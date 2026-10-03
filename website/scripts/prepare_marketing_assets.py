#!/usr/bin/env python3
"""Authoring utility. Build uses committed assets and never downloads fonts."""
import argparse
import hashlib
import json
import re
import subprocess
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]
ROOT = WEB.parent
SOURCES = {'logo':'frenken_dojo.webp','frank':'Frank_speaking.webp','tina':'Tina.webp',
           'hearing':'repeat_hearing.webp','speaking':'repeat_speaking.webp'}
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent':UA})
    with urllib.request.urlopen(request, timeout=40) as response:
        return response.read()


def images():
    target = WEB/'static/brand'; target.mkdir(parents=True,exist_ok=True)
    manifest = {}
    for name, filename in SOURCES.items():
        source = ROOT/'reference_material/ref_website/assets'/filename
        manifest[name] = {'source':str(source.relative_to(ROOT)), 'sha256':hashlib.sha256(source.read_bytes()).hexdigest()}
        for width in (480,960):
            output = target/f'{name}-{width}.webp'
            subprocess.run(['cwebp','-quiet','-q','88','-alpha_q','100','-metadata','none','-resize',str(width),'0',str(source),'-o',str(output)], check=True)
    (WEB/'content/brand-assets.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')


def fonts():
    target = WEB/'static/fonts'; target.mkdir(parents=True,exist_ok=True)
    text = ''.join(p.read_text() for directory in ('scripts','content','static') for p in (WEB/directory).rglob('*') if p.suffix in {'.py','.json','.js'} and p.is_file())
    chars = ''.join(sorted(set(text)))
    rules = []; downloads = []
    requested = {ord(char) for char in chars}
    def matches_range(block):
        ranges = re.search(r'unicode-range:\s*([^;]+)', block)
        if not ranges: return True
        for token in ranges.group(1).split(','):
            value = token.strip().removeprefix('U+')
            bounds = value.split('-')
            low = int(bounds[0].replace('?', '0'), 16)
            high = int(bounds[-1].replace('?', 'F'), 16)
            if any(low <= code <= high for code in requested): return True
        return False
    for family, weight, name, query_text in [('Poppins',800,'poppins-800',None),('Noto Sans JP',400,'noto-sans-jp-400',chars),('Noto Sans JP',700,'noto-sans-jp-700',chars)]:
        params = {'family':f'{family}:wght@{weight}','display':'swap'}
        if query_text: params['text'] = query_text
        css = fetch('https://fonts.googleapis.com/css2?'+urllib.parse.urlencode(params)).decode()
        blocks = re.findall(r'@font-face\s*\{[^}]+\}', css)
        if not blocks: raise ValueError(f'No font faces returned for {family}')
        # CJK responses may ignore `text` and return many unicode-range faces.
        # Preserve every relevant face rather than selecting only the Latin URL.
        selected = [(i,block) for i,block in enumerate(blocks) if (i == len(blocks)-1 if family == 'Poppins' else matches_range(block))]
        for index,block in selected:
            source = re.search(r'url\((https://[^)]+)\)',block).group(1)
            filename = f'{name}{"" if index == len(blocks)-1 else f"-{index}"}.woff2'
            downloads.append((source,target/filename))
            rules.append(block.replace(source,filename))
        print(f'{family} {weight}: {len(selected)} local unicode-range faces')
    def download(item):
        source,path=item
        data=fetch(source)
        if data[:4] != b'wOF2': raise ValueError(f'Expected WOFF2: {path.name}')
        path.write_bytes(data)
    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(download,downloads))
    for family,path in [('poppins','ofl/poppins/OFL.txt'),('noto-sans-jp','ofl/notosansjp/OFL.txt')]:
        (target/f'{family}-OFL.txt').write_bytes(fetch('https://raw.githubusercontent.com/google/fonts/main/'+path))
    (target/'fonts.css').write_text('\n'.join(rules)+'\n')
    print('Saved local fonts, CSS and SIL OFL license files.')


if __name__ == '__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--fonts',action='store_true'); args=parser.parse_args()
    fonts() if args.fonts else images()
