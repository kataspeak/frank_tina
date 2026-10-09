"""Render the reviewed legal Markdown snapshot without external dependencies."""
from pathlib import Path
from html import escape
import re

DOCUMENTS = {
    '/ja/legal/terms/': ('TERMS_OF_SERVICE.md', '利用規約'),
    '/ja/legal/privacy/': ('PRIVACY_POLICY.md', 'プライバシーポリシー'),
    '/ja/legal/commercial-transactions/': ('COMMERCIAL_TRANSACTIONS.md', '特定商取引法に基づく表記'),
}


def inline(text):
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', escape(text))


def markdown(source):
    lines = source.splitlines()
    output = []
    stack = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        item = re.match(r'^(\s*)(?:([-]) |(\d+)\. )(.*)$', line)
        if item:
            indent = len(item[1])
            tag = 'ul' if item[2] else 'ol'
            while stack and (indent < stack[-1][0] or (indent == stack[-1][0] and tag != stack[-1][1])):
                output.append('</li></' + stack.pop()[1] + '>')
            if stack and indent == stack[-1][0]:
                output.append('</li>')
            else:
                output.append('<' + tag + '>')
                stack.append((indent, tag))
            output.append('<li>' + inline(item[4]))
            i += 1
            continue
        while stack:
            output.append('</li></' + stack.pop()[1] + '>')
        heading = re.match(r'^(#{1,3}) (.*)$', line)
        if heading:
            level = len(heading[1])
            if level > 1:
                output.append(f'<h{level}>{inline(heading[2])}</h{level}>')
            i += 1
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [x.strip() for x in lines[i].strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', x) for x in cells):
                    rows.append(cells)
                i += 1
            output.append('<div class="legal-table"><table><thead><tr>' + ''.join('<th scope="col">'+inline(x)+'</th>' for x in rows[0]) + '</tr></thead><tbody>')
            for row in rows[1:]:
                output.append('<tr>' + ''.join('<td>'+inline(x)+'</td>' for x in row) + '</tr>')
            output.append('</tbody></table></div>')
        else:
            paragraph = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||\s*- |\s*\d+\. )', lines[i]):
                paragraph.append(lines[i])
                i += 1
            output.append('<p>' + '<br>'.join(inline(x) for x in paragraph) + '</p>')
    while stack:
        output.append('</li></' + stack.pop()[1] + '>')
    return ''.join(output)


def pages(config, layout, crumbs):
    result = {}
    for path, (filename, title) in DOCUMENTS.items():
        source = (Path(__file__).resolve().parents[1] / 'content/legal' / filename).read_text()
        if config['production'] and '【公開前に確認が必要】' in source:
            raise ValueError('特商法表記の電話番号を確認してから公開してください。')
        trail = [('ホーム', '/ja/'), (title, path)]
        body = '<div class="section-shell legal-shell">' + crumbs(trail) + '<section class="page-heading"><h1>' + title + '</h1></section><article class="legal-copy">' + markdown(source) + '</article></div>'
        result[path] = layout(config, path, title + ' — FrankenDojo', 'FrankenDojoの' + title + '。', body, breadcrumbs=trail)
    return result
