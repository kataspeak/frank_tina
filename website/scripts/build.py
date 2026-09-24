#!/usr/bin/env python3
"""Deterministic static build; no application routes or private originals emitted."""
import argparse
import hashlib
import json
import re
import shutil
import struct
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree as ET
from source import ROOT, parse_sources
import templates

WEB = ROOT / 'website'

def load_config(path=None, production=False):
    config=json.loads((path or WEB/'config.json').read_text())
    config['production']=production
    config['origin']=(config['productionOrigin'] if production else config['previewOrigin'])
    if not config['origin']:
        raise ValueError('本番ドメインが未設定です')
    parsed=urlparse(config['origin'])
    if parsed.scheme not in {'https','http'} or not parsed.netloc or parsed.path not in {'','/'} or parsed.query or parsed.fragment or parsed.username:
        raise ValueError('originにはパス・認証情報を含まないHTTP(S) originを指定してください')
    config['origin']=config['origin'].rstrip('/')
    if config['includedLevels'] != ['A1','A2']:
        raise ValueError('今回確認済みの入力レベルはA1・A2だけです')
    if config['publication']!={'requiredLevels':['A1','A2','B1','B2'],'requiredEpisodeCount':240}:
        raise ValueError('本番の全240話一括公開条件は、今回のローカル範囲変更では変更できません')
    templates.training_link(config)
    signup=config['signup']
    if signup.get('integrationVerified'):
        for key in ('endpoint','privacyUrl'):
            parsed=urlparse(signup.get(key) or '')
            if parsed.scheme!='https' or not parsed.netloc or parsed.username:
                raise ValueError(f'先行案内の{key}には確認済みHTTPS URLが必要です')
        if not signup.get('consentText'): raise ValueError('先行案内の同意表示が未設定です')
    for platform in ('ios','android'):
        if config['release'][platform]:
            u=urlparse(config['stores'][platform] or '')
            if u.scheme!='https' or u.hostname not in ({'apps.apple.com'} if platform=='ios' else {'play.google.com'}):
                raise ValueError(f'{platform}: 公開済みの公式ストアURLが必要です')
    if config['release']['billing'] and not config['pricing']['productVerified']:
        raise ValueError('課金を有効にするには商品設定の確認が必要です')
    return config

def image_audit(episodes, mapping):
    ids={ep['id'] for ep in episodes}; candidates={}; other=[]; out_of_scope=[]
    for p in sorted((ROOT/'images').rglob('*.png')):
        m=re.match(r'^([AB][12]-\d{2})_',p.name)
        rel=p.relative_to(ROOT).as_posix()
        if m:
            candidates.setdefault(m[1],[]).append(rel)
            if m[1] not in ids: out_of_scope.append(rel)
        else: other.append(rel)
    problems=[]
    if set(mapping)!=ids: problems.append('画像対応表のID集合が原本と異なる')
    for ep in episodes:
        im=mapping.get(ep['id'])
        if not im: continue
        path=ROOT/im['sourceImage']
        source_id=im.get('sourceEpisodeId',ep['id'])
        if source_id!=ep['id'] and (im.get('reviewStatus')!='visually-reviewed' or not im.get('selectionReason')):
            problems.append(f'{ep["id"]}: 画像ID補正の確認根拠がありません'); continue
        if im['sourceImage'] not in candidates.get(source_id,[]):
            problems.append(f'{ep["id"]}: 採用画像の参照切れ・ID不一致'); continue
        raw=path.read_bytes()
        if raw[:8] != b'\x89PNG\r\n\x1a\n':
            problems.append(f'{ep["id"]}: PNGヘッダーが不正'); continue
        im['width'],im['height']=struct.unpack('>II',raw[16:24])
        im['sha256']=hashlib.sha256(raw).hexdigest()
        if im.get('reviewedSha256') != im['sha256']:
            problems.append(f'{ep["id"]}: 採用画像が実見時から変更されています。再確認が必要です')
        ep['image']=im
    if len({im['sourceImage'] for im in mapping.values()})!=len(mapping): problems.append('複数話に同じ採用画像があります')
    if problems: raise ValueError('\n'.join(problems))
    return {'totalPng':sum(len(v) for v in candidates.values())+len(other),'selectedCount':len(mapping),
            'duplicateCandidates':{k:v for k,v in candidates.items() if k in ids and len(v)>1},
            'explicitIdCorrections':{key:{'sourceEpisodeId':im['sourceEpisodeId'],'sourceImage':im['sourceImage'],'reason':im['selectionReason']} for key,im in mapping.items() if im.get('sourceEpisodeId')},
            'outsideSelectedLevels':out_of_scope,'nonEpisodeAssets':other,'missing':problems}

def convert_image(ep):
    exe=shutil.which('cwebp')
    if not exe: raise ValueError('cwebpが必要です（README参照）')
    im=ep['image']; cache=WEB/'.cache'/'images'; cache.mkdir(parents=True,exist_ok=True)
    for width in (480,960,1440):
        name=f'{ep["meta"]["slug"]}-{width}.webp'
        cached=cache/f'{im["sha256"]}-{width}-q82.webp'
        if not cached.exists():
            subprocess.run([exe,'-quiet','-q','82','-metadata','none','-resize',str(width),'0',str(ROOT/im['sourceImage']),'-o',str(cached)],check=True,capture_output=True)
        shutil.copyfile(cached,WEB/'dist/assets/images'/name)

def write_page(path, html):
    target=WEB/'dist'/path.strip('/')/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True); target.write_text(html)

def build(config):
    material=parse_sources(); episodes=material['episodes']
    meta=json.loads((WEB/'content/episodes.json').read_text())
    images=json.loads((WEB/'content/images.json').read_text())
    if set(meta)!={ep['id'] for ep in episodes}: raise ValueError('サイト用メタデータのID集合が原本と異なります')
    for ep in episodes:
        ep['meta']=meta[ep['id']]
        if not re.fullmatch(re.escape(ep['id'].lower())+r'-[a-z0-9-]+',ep['meta']['slug']): raise ValueError(f'{ep["id"]}: 不正な固定slug')
        if ep['meta']['sourceRevision']!=ep['sourceRevision']:
            raise ValueError(f'{ep["source"]["file"]}:{ep["source"]["line"]} [{ep["id"]}] 原本が解説確認時から変更されています。解説・学習表現を再確認してください')
        blocks={b['number']:b for b in ep['blocks'] if b['type']=='dialogue'}
        if len(ep['meta']['learning'])!=3 or not ep['meta']['note'] or not ep['meta'].get('heading'):
            raise ValueError(f'{ep["id"]}: 3表現・解説・見出しが未完了です')
        for item in ep['meta']['learning']:
            if item['line'] not in blocks or item['phrase'].casefold() not in blocks[item['line']]['en'].casefold() or not item['explanation']:
                raise ValueError(f'{ep["id"]}: 原本に対応しない学習表現 {item["phrase"]}')
    audit=image_audit(episodes, images)
    if len({templates.url(ep) for ep in episodes}) != len(episodes): raise ValueError('URL重複')
    if config['production']:
        blockers=publication_blockers(config,episodes)
        if blockers: raise ValueError('本番公開ゲート:\n'+'\n'.join(blockers))
    output=WEB/'dist'; output.mkdir(exist_ok=True)
    # Clean only generator-owned directories. /app is never touched.
    for owned in ('ja','assets'):
        if (output/owned).exists(): shutil.rmtree(output/owned)
    (output/'assets/images').mkdir(parents=True,exist_ok=True)
    for p in (WEB/'static').iterdir():
        if p.is_file(): shutil.copyfile(p,output/'assets'/p.name)
    for legal in ('LICENSE','NOTICE'): shutil.copyfile(ROOT/legal,output/'assets'/f'{legal}.txt')
    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(convert_image,episodes))
    write_page('/ja/', templates.layout(config,'/ja/',f'{templates.BRAND}｜物語で英語を鍛える','フランク＆ティナのA1・A2全120話。挿し絵・英文・日本語訳で物語を楽しみ、アプリでの発話練習へ。', templates.home(config,episodes)))
    write_page('/', '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=/ja/"><title>FrankenDojo by KataSpeak</title><a href="/ja/">日本語サイトへ</a></html>')
    if hasattr(templates,'all_pages'):
        for path, html in templates.all_pages(config,episodes).items(): write_page(path,html)
    write_sitemaps(config,episodes)
    (output/'robots.txt').write_text(f'User-agent: *\nDisallow: /\n' if not config['production'] else f'User-agent: *\nAllow: /ja/\nDisallow: /app/\nSitemap: {config["origin"]}/sitemap.xml\n')
    (output/'404.html').write_text(templates.layout(config,'/404.html',f'ページが見つかりません — {templates.BRAND}','お探しのページが見つかりません。A1・A2の物語一覧からお探しください。','<section class="section-shell section"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>物語が見つかりませんでした。</h1><p class="lead">一覧から、読みたい回を探してみてください。</p><div class="actions">'+templates.button('物語の一覧へ','/ja/courses/')+'</div></section>'))
    (WEB/'.cache/material.json').write_text(json.dumps(material,ensure_ascii=False,indent=2)+'\n')
    (WEB/'reports/source-audit.json').write_text(json.dumps({'schemaVersion':1,'materialRevision':material['materialRevision'],'counts':{level:sum(ep['level']==level for ep in episodes) for level in ('A1','A2')},'sourceNotes':material['sourceNotes'],'images':audit},ensure_ascii=False,indent=2)+'\n')
    (WEB/'reports/publication-blockers.json').write_text(json.dumps(publication_blockers(config,episodes),ensure_ascii=False,indent=2)+'\n')
    print(f'Build complete: {len(episodes)} episodes, {len(list(output.rglob("*.html")))} HTML pages. Preview only (noindex).')

def publication_blockers(config,episodes):
    blockers=[]
    if len(episodes)!=240 or {ep['level'] for ep in episodes}!={'A1','A2','B1','B2'}:
        blockers.append('全240話一括公開の条件未充足。今回の範囲はA1・A2の120話。B1・B2は未収録。')
    if not config['release']['siteApproved']: blockers.append('サイトの正式公開は未承認。')
    if not config.get('productionOrigin'): blockers.append('本番ドメイン未設定。')
    if config.get('productionOrigin') and urlparse(config['productionOrigin']).scheme!='https': blockers.append('本番ドメインはHTTPSが必要。')
    pending=[ep['id'] for ep in episodes if ep['meta'].get('editorialApproval')!='approved' or ep['image'].get('editorialApproval')!='approved']
    if pending: blockers.append(f'サイト追加解説・学習表現・画像対応の最終編集確認: {len(pending)}話。本文A1・A2のユーザー確認とは別管理。')
    if not config['release']['webTraining'] and not config['signup']['integrationVerified']: blockers.append('訓練未公開時の先行案内受付先・同意表示・送信結果処理の実接続確認が未完了。')
    return blockers

def write_sitemaps(config,episodes):
    ns='http://www.sitemaps.org/schemas/sitemap/0.9'; ins='http://www.google.com/schemas/sitemap-image/1.1'
    ET.register_namespace('',ns); ET.register_namespace('image',ins)
    pages=['/ja/','/ja/characters/','/ja/courses/','/ja/courses/a1/','/ja/courses/a2/','/ja/updates/','/ja/rights/']+[templates.url(ep) for ep in episodes]
    sitemap=ET.Element(f'{{{ns}}}urlset')
    for path in pages:
        node=ET.SubElement(sitemap,f'{{{ns}}}url'); ET.SubElement(node,f'{{{ns}}}loc').text=config['origin']+path
    ET.ElementTree(sitemap).write(WEB/'dist/sitemap.xml',encoding='utf-8',xml_declaration=True)
    images=ET.Element(f'{{{ns}}}urlset')
    for ep in episodes:
        node=ET.SubElement(images,f'{{{ns}}}url'); ET.SubElement(node,f'{{{ns}}}loc').text=config['origin']+templates.url(ep)
        im=ET.SubElement(node,f'{{{ins}}}image'); ET.SubElement(im,f'{{{ins}}}loc').text=config['origin']+f'/assets/images/{ep["meta"]["slug"]}-1440.webp'
    ET.ElementTree(images).write(WEB/'dist/image-sitemap.xml',encoding='utf-8',xml_declaration=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--production',action='store_true'); parser.add_argument('--config',type=Path)
    args=parser.parse_args()
    try: build(load_config(args.config,args.production))
    except (ValueError, subprocess.CalledProcessError) as exc:
        (WEB/'reports/build-errors.txt').write_text(str(exc)+'\n')
        raise SystemExit(str(exc))
    else:
        (WEB/'reports/build-errors.txt').unlink(missing_ok=True)
