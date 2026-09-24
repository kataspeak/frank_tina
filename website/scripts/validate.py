#!/usr/bin/env python3
"""Checks the actual static deliverable and meaningful failure cases."""
import copy
import hashlib
import itertools
import json
import re
import tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
from xml.etree import ElementTree as ET
from build import WEB, load_config, publication_blockers
from source import parse_sources, segments, SourceError
import templates
import source
from unittest.mock import patch

class Node:
    def __init__(self,tag='',attrs=()): self.tag=tag; self.attrs=dict(attrs); self.children=[]
    def has_class(self,name): return name in self.attrs.get('class','').split()
    def text(self,exclude=()):
        return '' if any(self.has_class(c) for c in exclude) else ''.join(c if isinstance(c,str) else c.text(exclude) for c in self.children)
    def all(self):
        yield self
        for child in self.children:
            if isinstance(child,Node): yield from child.all()

class Document(HTMLParser):
    VOID={'meta','link','img','br','hr','input','source','wbr','area','base','embed','param','track','col'}
    def __init__(self,raw):
        super().__init__(convert_charrefs=True); self.root=Node(); self.stack=[self.root]; self.feed(raw); self.nodes=list(self.root.all())
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs); self.stack[-1].children.append(n)
        if tag not in self.VOID: self.stack.append(n)
    def handle_endtag(self,tag):
        if self.stack[-1].tag==tag: self.stack.pop()
        elif tag not in self.VOID: raise ValueError(f'不正なHTML入れ子: </{tag}> / <{self.stack[-1].tag}>')
    def handle_data(self,data): self.stack[-1].children.append(data)
    def cls(self,name): return [n for n in self.nodes if n.has_class(name)]
    def tag(self,name): return [n for n in self.nodes if n.tag==name]

def normalized(text): return re.sub(r'\s+',' ',text).strip()

def verify():
    config=load_config(); original=parse_sources(); material=json.loads((WEB/'.cache/material.json').read_text()); eps=material['episodes']
    checks=[]; problems=[]; output=WEB/'dist'
    def check(condition,message):
        if not condition: problems.append(message)
    check(material['materialRevision']==original['materialRevision'],'生成教材リビジョンが原本と不一致')
    expected={f'{level}-{n:02d}' for level in ('A1','A2') for n in range(1,61)}
    check({ep['id'] for ep in eps}==expected and len(eps)==120,'120話のID集合が不一致')
    original_by_id={ep['id']:ep for ep in original['episodes']}
    docs={}
    for p in sorted(output.rglob('*.html')):
        # /app is reserved and may be mounted by a separate app: never inspect it.
        if p.relative_to(output).parts[0]=='app': continue
        path='/'+p.relative_to(output).as_posix(); path=path[:-10] if path.endswith('index.html') else path
        raw=p.read_text(); doc=Document(raw); docs[path]=doc
        check('SayDojo' not in raw, f'{path}: 旧ブランド名')
        check('by KataSpeak' in raw, f'{path}: ブランド付記なし')
        check(not re.search(r'/(?:ja/)?(?:courses|skits)/b[12]/',raw),f'{path}: 対象外B1・B2リンク')
        check(any(n.attrs.get('name')=='robots' and n.attrs.get('content')=='noindex,nofollow' for n in doc.tag('meta')),f'{path}: noindexなし')
        ids=[n.attrs['id'] for n in doc.nodes if 'id' in n.attrs]
        check(len(ids)==len(set(ids)),f'{path}: HTML ID重複')
        if path=='/': continue
        check(len(doc.tag('h1'))==1,f'{path}: h1個数不正')
        check(len(doc.tag('title'))==1,f'{path}: title個数不正')
        check(any(n.attrs.get('name')=='description' and n.attrs.get('content') for n in doc.tag('meta')),f'{path}: descriptionなし')
        check(any(n.attrs.get('rel')=='canonical' and n.attrs.get('href')==config['origin']+path for n in doc.tag('link')),f'{path}: canonical不一致')
        for n in doc.tag('script'):
            if n.attrs.get('type')=='application/ld+json':
                for item in json.loads(n.text()): check('aggregateRating' not in item and 'offers' not in item,f'{path}: 未確認の販売情報')
        for n in doc.tag('img'):
            check(bool(n.attrs.get('alt')) and n.attrs.get('width') and n.attrs.get('height'),f'{path}: 画像alt/寸法なし')
        check(not doc.tag('audio') and not doc.tag('video'),f'{path}: 公開側の音声・動画プレーヤー')
    for path,doc in docs.items():
        for n in doc.nodes:
            for attr in ('href','src','action'):
                target=n.attrs.get(attr)
                if not target or target.startswith(('data:','mailto:','tel:')): continue
                u=urlparse(target)
                if u.netloc and u.netloc!=urlparse(config['origin']).netloc: continue
                dest=unquote(u.path) or path
                if dest.startswith('/app/'):
                    check(config['release']['webTraining'],f'{path}: 未公開アプリへのリンク'); continue
                file=output/dest.lstrip('/')
                if dest.endswith('/'): file=file/'index.html'
                check(file.is_file(),f'{path}: 参照切れ {target}')
                if u.fragment:
                    check(dest in docs and any(t.attrs.get('id')==u.fragment for t in docs[dest].nodes),f'{path}: アンカー参照切れ {target}')
            if 'srcset' in n.attrs:
                for item in n.attrs['srcset'].split(','):
                    check((output/item.strip().split()[0].lstrip('/')).is_file(),f'{path}: srcset参照切れ')
    spoken_count=0; sfx_count=0
    for i,ep in enumerate(eps):
        check(ep['blocks']==original_by_id[ep['id']]['blocks'],f'{ep["id"]}: 原本抽出の不一致')
        doc=docs[templates.url(ep)]
        speech=[b for b in ep['blocks'] if b['type']!='sfx']
        check(len(doc.cls('english'))==len(speech),f'{ep["id"]}: 英文数不一致')
        check(len(doc.cls('translation'))==len(speech),f'{ep["id"]}: 対訳数不一致')
        for b,en,jp in zip(speech,doc.cls('english'),doc.cls('translation')):
            check(normalized(en.text(exclude=('sfx',)))==normalized(b['en']),f'{ep["id"]}:{b["sourceLine"]}: 英文が変化')
            check(jp.text()==b['ja'],f'{ep["id"]}:{b["translationLine"]}: 和訳が変化')
            check('hidden' not in jp.attrs,f'{ep["id"]}: 和訳が初期非表示')
        speakers=doc.cls('speaker')
        check(len(speakers)==len(speech),f'{ep["id"]}: 話者ラベル数不一致')
        check(all(speaker.children[0].text()==b['speaker'] and speaker.children[1].text()==b['speakerJa'] for speaker,b in zip(speakers,speech)),f'{ep["id"]}: 話者不一致')
        expected_sfx=sum(1 if b['type']=='sfx' else sum(s['type']=='sfx' for s in b['segments']) for b in ep['blocks'])
        check(len(doc.cls('sfx'))==expected_sfx,f'{ep["id"]}: 効果音欠落')
        sfx_count+=expected_sfx; spoken_count+=len(speech)
        check(len(doc.cls('expression-number'))==3,f'{ep["id"]}: 学習表現数')
        check(bool(doc.cls('story-note')[0].text()),f'{ep["id"]}: 解説欠落')
        nav=doc.cls('episode-navigation')[0]
        for rel,j in [('prev',i-1),('next',i+1)]:
            links=[n.attrs['href'] for n in nav.all() if n.attrs.get('rel')==rel]
            check(links==([templates.url(eps[j])] if 0<=j<len(eps) else []),f'{ep["id"]}: 前後話リンク不正 {rel}')
        check(any(n.attrs.get('property')=='og:image' and ep['meta']['slug'] in n.attrs.get('content','') for n in doc.tag('meta')),f'{ep["id"]}: OG画像不一致')
    for level in ('a1','a2'):
        check(len(docs[f'/ja/courses/{level}/'].cls('episode-card'))==60,f'{level}: 初期HTMLのカード数')
    titles=[doc.tag('title')[0].text() for p,doc in docs.items() if p!='/']
    descriptions=[next(n.attrs['content'] for n in doc.tag('meta') if n.attrs.get('name')=='description') for p,doc in docs.items() if p!='/']
    check(len(titles)==len(set(titles)),'title重複'); check(len(descriptions)==len(set(descriptions)),'description重複')
    for p in output.rglob('*'):
        if p.is_file() and p.relative_to(output).parts[0]!='app':
            check(p.suffix in {'.html','.css','.js','.webp','.txt','.xml'},f'配信禁止形式: {p.name}')
    check(len(list((output/'assets/images').glob('*.webp')))==360,'3サイズの配信画像数')
    ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','i':'http://www.google.com/schemas/sitemap-image/1.1'}
    check(len(ET.parse(output/'sitemap.xml').findall('s:url',ns))==127,'サイトマップ数')
    check(len(ET.parse(output/'image-sitemap.xml').findall('s:url/i:image',ns))==120,'画像サイトマップ数')
    check('Disallow: /' in (output/'robots.txt').read_text(),'プレビューrobotsが拒否していない')
    # Check state switches without making requests, starting billing or publishing.
    for web,ios,android,billing in itertools.product([False,True],repeat=4):
        c=copy.deepcopy(config); c['release'].update(webTraining=web,ios=ios,android=android,billing=billing)
        c['app']={'routeConfirmed':True,'lessonUrlTemplate':'/app/lessons/{id}'}
        c['stores']={'ios':'https://apps.apple.com/app/test-only','android':'https://play.google.com/store/apps/details?id=test.only'}
        c['pricing']['productVerified']=True
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'config.json'; path.write_text(json.dumps(c)); c=load_config(path)
        update_doc=Document(templates.updates(c,eps)[1])
        links=[node.attrs.get('href') for node in update_doc.tag('a')]
        check((c['stores']['ios'] in links)==ios,'iOS単独の公開状態に追従していない')
        check((c['stores']['android'] in links)==android,'Android単独の公開状態に追従していない')
        dd=[node.text() for node in update_doc.tag('dd')]
        check(dd[1]==('提供中' if web else '提供準備中'),'Web公開状況が不一致')
        check(('（予定）' in dd[3])== (not billing),'料金の予定表示が不一致')
        for lesson in ('A1-01','A1-60','A2-01','A2-60'):
            label,link=templates.training_link(c,lesson)
            check(link==(f'/app/lessons/{lesson}' if web else f'/ja/updates/?lesson={lesson}'),f'CTA切替 {lesson}')
            check(('無料' in label)==(web and lesson=='A1-01'),f'無料CTA {lesson}')
    for bad in (None,'javascript:alert(1)','https://example.test/no-id','/unconfirmed/{id}'):
        c=copy.deepcopy(config); c['release']['webTraining']=True; c['app']={'routeConfirmed':True,'lessonUrlTemplate':bad}
        try: templates.training_link(c)
        except ValueError: pass
        else: problems.append(f'不正なアプリURLを受理: {bad}')
    for text in ('Hello [unknown-tag].','Hello [unclosed.'):
        try: segments(text,'fixture.md','A1-01',42)
        except SourceError as exc: check('fixture.md:42' in str(exc),'パース警告に原本行番号なし')
        else: problems.append('未知の制作タグを黙って受理')
    # Corrupt temporary copies, never the user's canonical scripts.
    for mutation in ('translation','id','number'):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); (root/'skits').mkdir()
            for level in ('A1','A2'):
                file=f'skits/skits_{level}_dialogs_jp.md'; text=(source.ROOT/file).read_text()
                if level=='A1':
                    if mutation=='translation': text=text.replace('   **フランク**: あなたは…一体どこから来たのですか？','',1)
                    elif mutation=='id': text=text.replace('### A1-02 ', '### A1-01 ',1)
                    else: text=text.replace('2. **Tina**: Oh! Beyond the stars!', '4. **Tina**: Oh! Beyond the stars!',1)
                (root/file).write_text(text)
            with patch.object(source,'ROOT',root):
                try: source.parse_sources()
                except SourceError as exc: check('skits/skits_A1_dialogs_jp.md:' in str(exc),f'{mutation}: 行番号のない診断')
                else: problems.append(f'{mutation}: 破損した原本を受理')
    check(bool(publication_blockers(config,eps)),'120話を本番公開可能として受理')
    report={'success':not problems,'htmlPages':len(docs),'episodes':len(eps),'bilingualBlocks':spoken_count,'sfx':sfx_count,'expressions':360,'webpFiles':360,'sitemapUrls':127,'stateCombinations':16,'parserNegativeCases':5,'sourceNotesHandled':len(material['sourceNotes']),'problems':problems,'materialRevision':material['materialRevision'],'browserChecks':'See browser-validation.json and VALIDATION.md. This script alone does not claim browser QA.'}
    (WEB/'reports/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if problems: raise SystemExit(1)

if __name__=='__main__': verify()
