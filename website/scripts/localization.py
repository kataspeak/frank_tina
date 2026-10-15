"""Build-time English localization. Missing copy fails the build, never falls back to Japanese.

Shared templates remain the layout source. Only text and local navigation are
localized; script dialogue and Japanese translations are kept verbatim.
"""
import copy
import hashlib
import json
import re
from functools import lru_cache
from html import escape
from html.parser import HTMLParser
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]
JAPANESE = re.compile('[ぁ-んァ-ヶ一-龯]')
LITERALS = re.compile(r'''//[^\n]*|/\*.*?\*/|(['"`])((?:\\.|(?!\1)[^\\])*?)\1''', re.S)
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

@lru_cache
def catalog(name='ui'):
    return json.loads((WEB/f'content/en/{name}.json').read_text())


@lru_cache
def site_script_url():
    inputs=[WEB/'static/site.js', WEB/'content/en/javascript.json', WEB/'content/en/ui.json']
    revision=hashlib.sha256(b''.join(path.read_bytes() for path in inputs)).hexdigest()[:12]
    return '/assets/site.js?v='+revision


@lru_cache
def english_stylesheet_url():
    revision=hashlib.sha256((WEB/'static/english.css').read_bytes()).hexdigest()[:12]
    return '/assets/english.css?v='+revision


def text(value):
    if value.strip() == '。':
        return value.replace('。','.')
    if not JAPANESE.search(value) or value.strip() == '日本語':
        return value
    stripped = value.strip()
    if stripped not in catalog():
        raise ValueError(f'英訳が未登録です: {stripped}')
    return value[:len(value)-len(value.lstrip())] + catalog()[stripped] + value[len(value.rstrip()):]


def localized_data(value):
    if isinstance(value, dict): return {k:localized_data(v) for k,v in value.items()}
    if isinstance(value, list): return [localized_data(v) for v in value]
    if isinstance(value, str): return text(value)
    return value


def language_links(path):
    if not path.startswith(('/ja/', '/en/')): return ''
    suffix=path[4:]
    return '<nav class="language-switch" aria-label="Language">' + ' / '.join(
        f'<a href="/{lang}/{suffix}" lang="{lang}" hreflang="{lang}"'+
        (' aria-current="page"' if path.startswith('/'+lang+'/') else '')+
        f'>{label}</a>' for lang,label in [('ja','日本語'),('en','English')])+'</nav>'


def alternates(config, path):
    if not path.startswith(('/ja/','/en/')): return ''
    return ''.join(f'<link rel="alternate" hreflang="{lang}" href="{config["origin"]}/{lang}/{path[4:]}">' for lang in ('ja','en'))


class EnglishHTML(HTMLParser):
    def __init__(self, keep_japanese=True):
        super().__init__(convert_charrefs=False)
        self.out=[];self.stack=[];self.keep_japanese=keep_japanese
    def handle_decl(self, value): self.out.append('<!'+value+'>')
    def handle_comment(self, value): self.out.append('<!--'+value+'-->')
    def handle_entityref(self, value): self.out.append('&'+value+';')
    def handle_charref(self, value): self.out.append('&#'+value+';')
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        protected = (self.stack and self.stack[-1][1]) or (self.keep_japanese and 'translation' in (a.get('class') or '').split())
        script_type=a.get('type') if tag=='script' else None
        if tag=='html': a['lang']='en'
        if 'sfx' in (a.get('class') or '').split(): a['lang']='en'
        if 'translation' in (a.get('class') or '').split(): a['lang']='ja' if self.keep_japanese else 'en'
        if a.get('id')=='script-content': a['class']='hide-translations'
        if a.get('id')=='translation-toggle': a['aria-pressed']='false'
        if tag=='a' and a.get('hreflang') in ('ja','en'):
            a.pop('aria-current',None)
            if a['hreflang']=='en': a['aria-current']='page'
        if tag=='meta' and a.get('property')=='og:locale': a['content']='en_US'
        if not protected:
            for key in ('alt','title','aria-label','placeholder','content','data-search'):
                if a.get(key): a[key]=text(a[key])
        for key in ('href','src','action'):
            value=a.get(key) or ''
            # hreflang destinations and language choices must keep both URLs.
            language_link = a.get('hreflang') or a.get('rel')=='alternate'
            if not language_link:
                if value.startswith('/ja/'): a[key]='/en/'+value[4:]
                elif '/ja/' in value and value.startswith(('http://','https://')):
                    a[key]=value.replace('/ja/','/en/')
                if key=='src' and value.startswith('/assets/practice-') and 'index.html' in value:
                    a[key]=value.replace('index.html','index.en.html')
            if key=='src' and (value in ('/assets/site.js','/assets/marketing.js') or value.startswith(('/assets/site.js?','/assets/marketing.js?'))):
                a[key]=value.replace('.js','.en.js',1)
            if key=='src' and value.startswith('./') and value.endswith('.js'):
                a[key]=value[:-3]+'.en.js'
        self.out.append('<'+tag+''.join(' '+k+(f'="{escape(v,quote=True)}"' if v is not None else '') for k,v in a.items())+'>')
        if tag not in VOID:self.stack.append((tag,protected,script_type))
    def handle_endtag(self,tag):
        self.out.append('</'+tag+'>')
        if self.stack and self.stack[-1][0]==tag:self.stack.pop()
    def handle_data(self,value):
        if self.stack and self.stack[-1][0]=='script':
            if self.stack[-1][2] in ('application/json','application/ld+json'):
                value=json.dumps(localized_data(json.loads(value)),ensure_ascii=False).replace('<','\\u003c')
                value=value.replace('/ja/','/en/')
            self.out.append(value)
        elif self.stack and (self.stack[-1][1] or self.stack[-1][0]=='style'):
            self.out.append(value)
        else:self.out.append(escape(text(value),quote=False))


def english_html(html, *, keep_japanese=True):
    parser=EnglishHTML(keep_japanese);parser.feed(html);parser.close()
    return ''.join(parser.out)


def english_episodes(episodes):
    result=copy.deepcopy(episodes)
    for ep in result:
        en=catalog('episodes')[ep['id']]
        if en['sourceRevision']!=ep['sourceRevision']:
            raise ValueError(f'{ep["id"]}: 英語版解説を原本変更に合わせて再確認してください')
        if en['sourceMetadataRevision']!=metadata_revision(ep):
            raise ValueError(f'{ep["id"]}: 英語版解説を日本語の見出し・解説変更に合わせて再確認してください')
        ep['scene']=en['scene'];ep['meta'].update(heading=en['heading'],note=en['note'])
        for item, explanation in zip(ep['meta']['learning'],en['explanations']):item['explanation']=explanation
        ep['image']['alt']['ja']=ep['image']['alt']['en']
        for b in ep['blocks']:
            if 'speakerJa' in b:b['speakerJa']=''
    return result


def metadata_revision(ep):
    source={'scene':ep['scene'], **{key:ep['meta'][key] for key in ('heading','note','learning')}}
    return hashlib.sha256(json.dumps(source,ensure_ascii=False,sort_keys=True).encode()).hexdigest()


def javascript(source):
    def replace(match):
        if match[1] is None: return match[0]  # Comments may contain apostrophes.
        quote,original=match.groups()
        if not JAPANESE.search(original):return match[0]
        translated=catalog('javascript').get(original, catalog().get(original))
        if translated is None:raise ValueError(f'JavaScriptの英訳が未登録です: {original}')
        # Template expressions keep their exact spelling; escape only literal quotes.
        if quote=='`':return '`'+translated+'`'
        return quote+translated.replace('\\','\\\\').replace(quote,'\\'+quote)+quote
    return LITERALS.sub(replace,source)


def prepare_english(config, episodes):
    import templates as t
    eps=english_episodes(episodes)
    pages=t.all_pages(config,eps)
    pages['/ja/']=t.layout(config,'/ja/',f'{t.BRAND}｜物語で英語を鍛える',
        'フランク＆ティナのA1・A2全120話。挿し絵・英文・日本語訳で物語を楽しみ、アプリでの発話練習へ。',t.home(config,eps))
    for ep in eps:
        path=t.url(ep);raw=pages[path]
        # These episode-specific sentences are assembled by the shared template.
        replacements={
            f'{ep["meta"]["heading"]}｜{ep["level"]}英会話 {ep["title"]} — {t.BRAND}':f'{ep["id"]}: {ep["title"]} | {ep["meta"]["heading"]} — {t.BRAND}',
            f'{ep["id"]}「{ep["title"]}」。{ep["scene"]}英文・和訳と3つの学習表現で読む、フランク＆ティナの英会話。':f'{ep["id"]}: {ep["title"]}. {ep["scene"]} Read the English conversation with three useful expressions and an English story note.',
            f'{ep["id"]}の発話練習をアプリで'+('練習できます' if config['release']['webTraining'] else '提供予定です')+'。':f'Speaking practice for {ep["id"]} '+('is available in the app.' if config['release']['webTraining'] else 'is planned for the app.'),
        }
        for ja,en in replacements.items():raw=raw.replace(escape(ja,quote=True),escape(en,quote=True)).replace(escape(ja,quote=False),escape(en,quote=False))
        pages[path]=raw
    result_pages={}; result_assets={}
    for path,html in pages.items():
        translated=english_html(html)
        # Keep the purchase display together, including the requested currency note.
        translated=translated.replace('<div class="price">¥0</div>','<div class="price">Free</div>')
        translated=translated.replace(f'¥{config["pricing"]["monthlyYen"]}<span> / month</span>', '$1.99<span> / month</span>')
        translated=translated.replace('$1.99<span> / month</span></div>', '$1.99<span> / month</span></div><p class="local-currency"><em>(or equivalent in your local currency)</em></p><p class="price-disclaimer">Actual prices may vary depending on your country and Google Play Store settings.</p>')
        translated=translated.replace('>ORIGINAL STORY</p>', '>Frank &amp; Tina English Adventures</p>')
        result_pages['/en/'+path[4:]]=translated
    for name in ('site','marketing'):
        source=(WEB/f'static/{name}.js').read_text()
        if name=='marketing':source=source.replace('/ja/','/en/')
        if name=='site':
            # Let readers type "cafe" to find "café", without changing Japanese search.
            source=source.replace("value.normalize('NFKC')", "value.normalize('NFKD').replace(/\\p{M}/gu, '')")
        result_assets[f'{name}.en.js']=javascript(source)
    for folder in (WEB/'static').glob('practice-*'):
        if not folder.is_dir():continue
        result_assets[f'{folder.name}/index.en.html']=english_html((folder/'index.html').read_text(),keep_japanese=False)
        for source in folder.glob('*.js'):
            result_assets[f'{folder.name}/{source.stem}.en.js']=javascript(source.read_text())
    return result_pages,result_assets
