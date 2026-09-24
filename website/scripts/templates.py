"""Shared templates. All reading content is in the first HTML response."""
import json
from html import escape as e
from urllib.parse import quote
from urllib.parse import urlparse

BRAND = "FrankenDojo by KataSpeak"
COURSES = {
    "A1": {"name": "はじまりは、星のかなた。", "label": "はじめての英会話", "description": "あいさつ、注文、道案内。短いやりとりから、二人の毎日へ。", "image": "A1-01"},
    "A2": {"name": "再会から、広がる毎日。", "label": "ひとつ先の日常英会話", "description": "予約、相談、気持ちの伝え方。再会した二人と、会話をもう少し先へ。", "image": "A2-01"}
}

def url(ep):
    return f'/ja/skits/{ep["level"].lower()}/{ep["meta"]["slug"]}/'

def brand():
    return '<span class="brand-name">Franken<span>Dojo</span></span><span class="brand-by">by KataSpeak</span>'

def arrow():
    return '<span aria-hidden="true">↗</span>'

def button(label, href, secondary=False):
    return f'<a class="button {"secondary" if secondary else ""}" href="{e(href, quote=True)}">{e(label)} {arrow()}</a>'

def training_link(config, lesson="A1-01"):
    if not config["release"]["webTraining"]:
        return "アプリの公開案内", f'/ja/updates/?lesson={quote(lesson)}'
    template = config["app"]["lessonUrlTemplate"]
    if not config["app"]["routeConfirmed"] or not template or template.count("{id}") != 1:
        raise ValueError("Web訓練を有効にするには確認済みの教材ID付きURLが必要です")
    parsed=urlparse(template.replace('{id}','A1-01'))
    if not ((parsed.scheme=='https' and parsed.netloc and not parsed.username) or (not parsed.scheme and not parsed.netloc and parsed.path.startswith('/app/'))):
        raise ValueError('教材リンクにはHTTPS URLまたは/app/以下の相対URLが必要です')
    return ("この話を無料で練習する" if lesson == "A1-01" else "この話を練習する", template.replace("{id}", quote(lesson)))

def picture(ep, *, priority=False, cls="", sizes="(max-width: 640px) 100vw, 50vw"):
    im = ep["image"]
    return f'<img class="{e(cls)}" src="/assets/images/{ep["meta"]["slug"]}-960.webp" srcset="/assets/images/{ep["meta"]["slug"]}-480.webp 480w, /assets/images/{ep["meta"]["slug"]}-960.webp 960w, /assets/images/{ep["meta"]["slug"]}-1440.webp 1440w" sizes="{e(sizes)}" width="{im["width"]}" height="{im["height"]}" alt="{e(im["alt"]["ja"], quote=True)}" style="object-position:{im["focalPoint"]["x"]*100}% {im["focalPoint"]["y"]*100}%" {"fetchpriority=\"high\"" if priority else "loading=\"lazy\""} decoding="async">'

def card(ep):
    return f'<article class="episode-card" data-search="{e(ep["id"]+" "+ep["title"]+" "+ep["scene"],quote=True)}"><a href="{url(ep)}"><div class="card-image">{picture(ep, sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw")}<span class="image-id">{ep["id"]}</span></div><div class="card-copy"><h3 lang="en">{e(ep["title"])} {arrow()}</h3><p>{e(ep["scene"])}</p></div></a></article>'

def course_cards(by_id):
    return '<div class="course-grid">'+''.join(f'<a class="course-card level-{level.lower()}" href="/ja/courses/{level.lower()}/"><div class="course-image">{picture(by_id[c["image"]])}</div><div class="course-copy"><div class="eyebrow"><span>CEFR {level}</span><span>60 EPISODES</span></div><h3>{c["name"]}</h3><p>{c["description"]}</p><span class="text-link">{level}の物語を読む {arrow()}</span></div></a>' for level,c in COURSES.items())+'</div>'

def layout(config, path, title, description, body, *, breadcrumbs=None, social_image=None):
    origin = config["origin"]
    canonical = origin + path
    app_label, app_href = training_link(config)
    structured = [{"@context":"https://schema.org", "@type":"Organization", "name":"誠和アプリ開発 (Seiwa App Development)", "url":config["links"]["operator"]}]
    if breadcrumbs:
        structured.append({"@context":"https://schema.org", "@type":"BreadcrumbList", "itemListElement":[{"@type":"ListItem", "position":i+1,"name":name,"item":origin+link} for i,(name,link) in enumerate(breadcrumbs)]})
    if path in {"/ja/", "/ja/updates/"}:
        structured.append({"@context":"https://schema.org", "@type":"SoftwareApplication", "name":BRAND,"applicationCategory":"EducationalApplication", "description":"物語を読み、シャドーイングとリピーティングで発話練習をする英語学習アプリ。"+('Web訓練を提供中。' if config['release']['webTraining'] else '訓練機能は提供準備中。')})
    social = ''
    if social_image:
        social = f'<meta property="og:image" content="{e(origin+social_image[0])}"><meta property="og:image:alt" content="{e(social_image[1],quote=True)}"><meta name="twitter:card" content="summary_large_image">'
    else:
        social = '<meta name="twitter:card" content="summary">'
    nav = [("物語を読む", "/ja/courses/"), ("キャラクター", "/ja/characters/"), ("練習のしくみ", "/ja/#practice"), ("料金・提供予定", "/ja/#pricing")]
    nav_html = ''.join(f'<a href="{href}" {"aria-current=\"page\"" if href == path else ""}>{label}</a>' for label,href in nav)
    extra_links=''.join(f'<a href="{e(config["links"][key],quote=True)}">{label}</a>' for key,label in [("contact","お問い合わせ"),("terms","利用規約"),("privacy","プライバシーポリシー")] if config["links"][key])
    favicon = quote('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#191c28"/><path d="M17 14h31v9H27v9h17v9H27v12H17z" fill="#ffa338"/><circle cx="47" cy="48" r="6" fill="#237bff"/></svg>')
    return f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)}</title><meta name="description" content="{e(description,quote=True)}"><meta name="robots" content="{ 'index,follow' if config['production'] else 'noindex,nofollow'}"><meta name="theme-color" content="#191C28"><link rel="canonical" href="{e(canonical)}"><meta property="og:locale" content="ja_JP"><meta property="og:type" content="website"><meta property="og:site_name" content="{BRAND}"><meta property="og:title" content="{e(title,quote=True)}"><meta property="og:description" content="{e(description,quote=True)}"><meta property="og:url" content="{e(canonical)}">{social}<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,{favicon}"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script><script type="application/ld+json">{json.dumps(structured,ensure_ascii=False).replace('<', chr(92)+'u003c')}</script></head><body><a class="skip-link" href="#main">本文へスキップ</a><header class="site-header"><div class="header-inner"><a class="brand" href="/ja/" aria-label="{BRAND} ホーム">{brand()}</a><nav class="desktop-nav" aria-label="メインナビゲーション">{nav_html}</nav><a class="header-cta" href="{app_href}">{'アプリで練習' if config['release']['webTraining'] else 'アプリ公開案内'} {arrow()}</a><details class="mobile-menu"><summary aria-label="ナビゲーションを開く">メニュー <span aria-hidden="true">☰</span></summary><nav aria-label="モバイルナビゲーション">{nav_html}</nav></details></div></header><main id="main" tabindex="-1">{body}</main><footer class="site-footer"><div class="footer-top"><a class="brand" href="/ja/">{brand()}</a><p>物語を楽しむ。声に出して、英語を鍛える。</p><a class="text-link" href="/ja/courses/">物語を読む {arrow()}</a></div><div class="footer-bottom"><p>© 2026 誠和アプリ開発 (Seiwa App Development).<br>フランケン＆ティナ 英語大作戦 · CC BY-NC-ND 4.0</p><nav aria-label="フッターナビゲーション"><a href="{config['links']['operator']}">運営サイト</a><a href="/ja/rights/">権利表記</a><a href="/ja/updates/">提供状況</a>{extra_links}</nav></div><p class="preview-note">{'確認用プレビュー · A1・A2 / 120話 · アプリは提供準備中' if not config['production'] else ''}</p></footer></body></html>'''

def home(config, episodes):
    by_id={ep['id']:ep for ep in episodes}; game=by_id['A1-21']; first=episodes[0]
    app_label,app_href=training_link(config)
    first_lines=[b for b in first['blocks'] if b['type']=='dialogue']
    primary=button('A1-01を無料で練習',app_href) if config['release']['webTraining'] else button('第1話を読む',url(first))
    secondary=button('120話の物語を読む','/ja/courses/',True) if config['release']['webTraining'] else button(app_label,app_href,True)
    return f'''<section class="hero section-shell"><div class="hero-copy"><p class="eyebrow"><span class="tiny-rule"></span> STORY MEETS PRACTICE</p><div class="hero-brand" aria-label="{BRAND}">{brand()}</div><h1>物語を楽しむ。<br>声に出して、<br><span class="orange">英語を鍛える。</span></h1><p class="hero-description">人造人間フランクと、星から来たティナ。<br>くすっと笑える毎日が、<br class="mobile-only">あなたの英語の練習になる。</p><div class="actions">{primary}{secondary}</div><div class="hero-facts"><span>英文・和訳つき</span><span>CEFR A1・A2</span><span>全120話</span></div></div><div class="hero-visual"><div class="orbit" aria-hidden="true"></div><div class="hero-image">{picture(game,priority=True,sizes="(max-width: 900px) 100vw, 58vw")}<div class="hero-image-caption"><span>FRANK &amp; TINA</span><span>ふたりとなら、英語はもっとおもしろい。</span></div></div><a class="episode-ticket" href="{url(game)}"><span class="ticket-number">21</span><span><small>STORY PREVIEW / A1</small><strong>Game Night</strong><span>今夜の勝負は、英語で。 {arrow()}</span></span></a><span class="vertical-caption" aria-hidden="true">READ. SPEAK. REPEAT.</span></div></section><div class="manifesto"><span>語学は、鍛える時代へ。</span><span lang="en">Read the story. Find your voice.</span><a href="#stories">物語の中へ <span aria-hidden="true">↓</span></a></div><section class="section-shell section" id="stories"><div class="section-heading"><div><p class="eyebrow">01 / THE STORY</p><h2>ちがう二人。<br>だから、話が尽きない。</h2></div><p>ブラックコーヒー派のフランクと、<br>抹茶ラテに夢中のティナ。<br>何気ない会話に、小さな事件と英語のヒント。</p></div><div class="story-intro"><figure>{picture(first)}<figcaption>A1-01 · Beyond the Stars!</figcaption></figure><div><p class="eyebrow">すべては、この出会いから。</p><blockquote><p lang="en">{e(first_lines[0]['en'])}</p><p class="quote-translation">{e(first_lines[0]['ja'])}</p><cite>FRANK</cite></blockquote><blockquote class="tina-quote"><p lang="en">{e(first_lines[1]['en'])}</p><p class="quote-translation">{e(first_lines[1]['ja'])}</p><cite>TINA</cite></blockquote><p>一人の問いかけから始まる、<br>ちょっと不思議な親友の物語。</p><a class="text-link" href="{url(first)}">第1話を読んでみる {arrow()}</a></div></div><div class="section-subheading"><h3>今日、どの話から始める？</h3><a href="/ja/courses/" class="text-link">120話を見にいく {arrow()}</a></div><div class="episode-grid">{''.join(card(by_id[k]) for k in ['A1-02','A1-21','A2-01'])}</div></section>'''+home_rest(config,by_id)

def home_rest(config, by_id):
    training_available = config['release']['webTraining']
    web_status = '提供中' if training_available else '提供準備中'
    mobile_status = '一部または両ストアで提供中' if config['release']['ios'] or config['release']['android'] else '提供予定'
    trial_suffix = '' if config['release']['billing'] else '予定'
    app_label,app_href=training_link(config)
    price=config['pricing']; planned='' if config['release']['billing'] else '予定'
    return f'''<section class="practice-section" id="practice"><div class="section-shell section"><div class="section-heading"><div><p class="eyebrow">02 / THE PRACTICE</p><h2>耳でつかんで、<br>声で覚える。</h2></div><p>物語のことばを、あなたの声に。<br>アプリでは2つの方法で、繰り返し練習できます。<br><span class="status-label">Web訓練は{web_status}</span></p></div><div class="practice-grid"><article class="practice-card"><div class="practice-top"><span>01</span><span>SHADOWING</span></div><h3>聞いて、重ねて、<br>声に出す。</h3><p>フレーズを繰り返し聞き、音声に重ねて発話。難易度に応じた速度で、口を動かすリズムをつかみます。</p><div class="practice-diagram" role="img" aria-label="シャドーイングの模式図。お手本の音声に少し遅れて、自分の声を重ねます。"><div><span>お手本</span><i class="sound-track"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></i></div><div><span>あなた</span><i class="sound-track delayed"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></i></div></div><small>練習の流れを示した図です</small></article><article class="practice-card repeating"><div class="practice-top"><span>02</span><span>REPEATING</span></div><h3>聞いたあと、<br>思い出して声に出す。</h3><p>フレーズや短いまとまりを聞き、間を置いて発話。反復回数を調整しながら、気になる表現を練習します。</p><div class="repeat-diagram" role="img" aria-label="リピーティングの模式図。聞く、思い出す、声に出すの順に練習します。"><span>聞く</span><i aria-hidden="true">→</i><span>思い出す</span><i aria-hidden="true">→</i><span>声に出す</span></div><small>練習の流れを示した図です</small></article></div><p class="practice-footnote">練習ランクは、練習量と進捗の目安。発音の正確さを採点・認定するものではありません。</p></div></section><section class="section-shell section" id="library"><div class="section-heading"><div><p class="eyebrow">03 / STORY LIBRARY</p><h2>あなたのペースで、<br>物語の続きを。</h2></div><p>A1・A2、各60話。すべて英文・和訳つき。<br>第1話から順番に。気になる場面から自由に。</p></div>{course_cards(by_id)}<p class="library-note">今回のプレビューは、確認済みのA1・A2の120話を収録しています。</p></section><section class="section-shell section" id="app"><div class="section-heading"><div><p class="eyebrow">04 / YOUR DOJO</p><h2>いつもの場所を、<br>英語の練習場所に。</h2></div><p>Webでも、スマホでも。<br>声を出す訓練はアプリで提供予定です。</p></div><div class="environment-grid"><article><span class="eyebrow">WEB APP / {web_status}</span><h3>ブラウザで、物語を練習。</h3><p>公式教材のシャドーイングとリピーティング、練習ランクの確認。発話の検知にマイクを使います。</p><p class="fine-print">自作教材の取り込み・編集、録音の保存・再生、バックグラウンド実行はWeb版の提供範囲に含みません。</p></article><article><span class="eyebrow">iOS &amp; ANDROID / {mobile_status}</span><h3>好きな教材でも、鍛えられる。</h3><p>公式教材に加え、手持ち教材を取り込んで編集。対応モードでの録音・聞き比べも、スマホ版で。</p><p class="fine-print">端末間の進捗同期は今後の対応予定です。ストア公開時期は、公開案内でお知らせします。</p></article></div></section><section class="section-shell section" id="pricing"><div class="section-heading"><div><p class="eyebrow">05 / SIMPLE PRICING</p><h2>物語は、無料。<br>声の練習は、アプリで。</h2></div><p>まずは二人の物語を、気軽に。<br>料金・無料トライアルは{'以下の内容で提供しています' if config['release']['billing'] else '提供予定です'}。</p></div><div class="pricing-grid"><article class="price-card"><span class="eyebrow">READ THE STORY</span><h3>物語を読む</h3><div class="price">¥0<span> / いつでも</span></div><ul><li>A1・A2の120話</li><li>挿し絵・英文・日本語訳</li><li>ログイン不要で閲覧</li></ul>{button('第1話を読む',url(by_id['A1-01']),True)}</article><article class="price-card featured"><span class="price-tag">アプリ訓練プラン · {planned or '提供中'}</span><span class="eyebrow">TRAIN YOUR VOICE</span><h3>声に出して練習する</h3><div class="price">¥{price['monthlyYen']}<span> / 月額{f'（{planned}）' if planned else ''}</span></div><ul><li>シャドーイング・リピーティング</li><li>新規対象者は{price['trialDays']}日間無料トライアル</li><li>A1-01は常時無料で訓練体験{'できます' if training_available else 'できる予定'}</li></ul>{button(app_label,app_href)}</article></div><p class="pricing-note">{price['trialDays']}日間の無料トライアルはA1-01の常時体験とは別です。新規対象者が有料コースと訓練機能を利用でき、期間終了後は月額プランへ自動移行{'します' if config['release']['billing'] else 'する予定です'}。正式な条件はアプリ・ストアでご確認ください。現在、このサイトから購入・契約はできません。</p></section><section class="section-shell section faq-section"><div><p class="eyebrow">06 / FAQ</p><h2>はじめる前の、<br>ちょっとした疑問。</h2></div><div class="faq-list">{faq(config)}</div></section><section class="closing-cta"><div class="section-shell"><p class="eyebrow">YOUR STORY STARTS HERE</p><h2>最初のひとことは、<br>星のかなたから。</h2><p>英語と日本語で、二人の出会いをのぞいてみよう。</p>{button('第1話を読む',url(by_id['A1-01']))}<a class="text-link" href="/ja/characters/">フランクとティナを知る {arrow()}</a></div></section>'''

def faq(config):
    items=[('無料でどこまで読めますか？','このプレビューではA1・A2の120話を、ログインなしで読めます。挿し絵、英文、日本語訳、学習表現と解説を掲載しています。'),('英語が初めてでも読めますか？','短い日常会話が中心のA1から始められます。英文のすぐ下に日本語訳があるので、意味を確かめながら読めます。訳を隠して読むこともできます。'),('A1-01の訓練体験と、14日間のトライアルは違いますか？','違います。アプリ提供後、A1-01は訓練環境を確かめる常時無料の体験として提供予定です。14日間の無料トライアルは、新規対象者が有料コースと訓練機能を試すための別の仕組みです。'),('マイクは必要ですか？','物語を読むだけなら不要です。アプリで声を出して練習するときには、発話を検知するためにWeb版でもマイクが必要です。発音の採点は行いません。'),('Webとスマホでは何が違いますか？','Web版は公式教材の訓練と練習ランクの確認に対応予定です。スマホ版では、手持ち教材の取り込み・編集、対応モードでの録音・聞き比べも予定しています。'),('アプリはもう使えますか？','現在は提供準備中です。公開時期、利用できる環境、正式な料金条件は「アプリの公開案内」でお知らせします。')]
    if config['release']['webTraining']:
        items[-1]=('アプリはもう使えますか？','Web訓練を提供しています。各話の練習ボタンから進めます。スマホ版を含む提供状況は「アプリの公開案内」でご確認ください。')
    return ''.join(f'<details><summary>{q}<span aria-hidden="true">＋</span></summary><p>{a}</p></details>' for q,a in items)

def crumbs(items):
    return '<nav class="breadcrumbs" aria-label="パンくず"><ol>'+''.join(f'<li>{f"<a href=\"{href}\">{e(name)}</a>" if i<len(items)-1 else f"<span aria-current=\"page\">{e(name)}</span>"}</li>' for i,(name,href) in enumerate(items))+'</ol></nav>'

def course_index(config,episodes,level=None):
    by_id={ep['id']:ep for ep in episodes}
    trail=[('ホーム','/ja/'),('物語を読む','/ja/courses/')]
    if level:
        trail.append((f'CEFR {level}',f'/ja/courses/{level.lower()}/'))
        c=COURSES[level]; selected=[ep for ep in episodes if ep['level']==level]
        body=f'''<div class="section-shell">{crumbs(trail)}<section class="course-header"><div><p class="eyebrow">CEFR {level} / 60 EPISODES</p><h1>{c['name']}</h1><p class="lead">{c['description']}</p><p class="muted">{c['label']} · 英文・日本語訳つき</p>{button('最初から読む',url(selected[0]))}</div><div>{picture(by_id[c['image']],priority=True)}</div></section><nav class="level-tabs" aria-label="レベルを選ぶ"><a href="/ja/courses/a1/" {'aria-current="page"' if level=='A1' else ''}>A1 <span>はじめての英会話</span></a><a href="/ja/courses/a2/" {'aria-current="page"' if level=='A2' else ''}>A2 <span>ひとつ先の日常英会話</span></a></nav><section class="library-list" aria-label="{level}のスキット一覧"><h2>{level}のスキット一覧</h2><div class="search-tools" hidden data-enhancement><div><label for="story-search">物語を探す</label><div class="search-field"><span aria-hidden="true">⌕</span><input type="search" id="story-search" placeholder="話数・タイトル・場面で検索" autocomplete="off"><button type="button" id="clear-search" aria-label="検索を解除">クリア</button></div></div><p id="search-count" role="status" aria-live="polite">60 / 60話</p></div><div class="empty-state" id="no-results" hidden><h2>該当する物語がありません</h2><p>別のことばで探すか、検索を解除してください。</p><button type="button" class="button secondary" id="reset-search">すべての話を表示</button></div><div class="episode-grid" id="story-results">{''.join(card(ep) for ep in selected)}</div></section></div>'''
        path=f'/ja/courses/{level.lower()}/'; title=f'{level}英会話・60話｜{c["name"]} — {BRAND}'; desc=c['description']+'CEFR '+level+'の60話を挿し絵・英文・和訳で読む。'
    else:
        path='/ja/courses/'; title=f'A1・A2の英会話ライブラリ｜120話の物語 — {BRAND}'; desc='フランク＆ティナのA1・A2、各60話。あいさつから予約や相談まで、物語の中で英会話に出会う。'
        body=f'<div class="section-shell">{crumbs(trail)}<section class="page-heading"><p class="eyebrow">THE STORY LIBRARY / 120 EPISODES</p><h1>英語で出会う、<br>二人の毎日。</h1><p class="lead">出会いの一言から、少し込み入った相談まで。<br>あなたに合うレベルから、自由に読めます。</p></section><section class="section course-index-section" aria-label="レベル一覧"><h2>レベルを選ぶ</h2>{course_cards(by_id)}<p class="library-note">話数順に読むと、二人の物語が時系列で進みます。確認済みのA1・A2の120話を収録。</p></section></div>'
    return path,layout(config,path,title,desc,body,breadcrumbs=trail)

def characters(config,by_id):
    path='/ja/characters/'; trail=[('ホーム','/ja/'),('キャラクター',path)]
    body=f'''<div class="section-shell">{crumbs(trail)}<section class="page-heading"><p class="eyebrow">MEET FRANK &amp; TINA</p><h1>地球の毎日を、<br>二人の目で見てみよう。</h1><p class="lead">生真面目な人造人間と、好奇心いっぱいの宇宙人。<br>ちがいだらけの二人は、かけがえのない親友。</p></section><section class="character-profile"><div class="character-art">{picture(by_id['A1-04'],priority=True)}</div><div><span class="eyebrow">THE THOUGHTFUL FRIEND</span><h2 class="character-name">Frank<span>フランク</span></h2><p class="character-tag">礼儀正しく、観察的な人造人間。</p><p>博士に作られ、静かな山の村で育ったフランク。まじめに答えたつもりが、ティナにはおかしく聞こえることも。お気に入りはブラックコーヒー。大切な人の話を、よく聞いています。</p><dl><div><dt>好きなもの</dt><dd>静かな朝、科学の本、ブラックコーヒー</dd></div><div><dt>話し方</dt><dd>丁寧で、ことばを一つずつ選ぶ。</dd></div></dl><a class="text-link" href="{url(by_id['A1-04'])}">フランクの故郷の話を読む {arrow()}</a></div></section><section class="character-profile tina-profile"><div class="character-art">{picture(by_id['A1-07'])}</div><div><span class="eyebrow">THE CURIOUS FRIEND</span><h2 class="character-name">Tina<span>ティナ</span></h2><p class="character-tag">星から来た、好奇心いっぱいの宇宙人。</p><p>見つけたものは、まず試してみたい。うれしいときも困ったときも、気持ちがすぐことばになるティナ。ピンクが大好き。でも故郷の星図だけは、そのまま大切に飾っています。</p><dl><div><dt>好きなもの</dt><dd>ピンク、ダンス、地球で出会った抹茶ラテ</dd></div><div><dt>話し方</dt><dd>表情豊かで、反応はいつもまっすぐ。</dd></div></dl><a class="text-link" href="{url(by_id['A1-07'])}">ティナの部屋を訪ねる {arrow()}</a></div></section><aside class="friendship"><p class="eyebrow">A FRIENDSHIP, ONE CONVERSATION AT A TIME</p><h2>同じアパート。別々の部屋。<br>話したいことは、いつもある。</h2><p>二人は恋人ではなく、親友であり隣人。<br>その距離から生まれる、日々のやりとりが物語になります。</p>{button('二人の出会いを読む',url(by_id['A1-01']))}</aside></div>'''
    return path,layout(config,path,f'フランク＆ティナ｜キャラクター紹介 — {BRAND}','礼儀正しい人造人間フランクと、星から来た好奇心旺盛な宇宙人ティナ。英語で出会う二人の親友の物語。',body,breadcrumbs=trail)

SFX_JA={'old clock ticking':'古い時計の音','game over jingle':'ゲームオーバーの音','phone buzzes':'携帯の振動音','upbeat music':'軽快な音楽','chip bag crinkling':'お菓子の袋が鳴る音','door bell':'ドアベル','phone ringing':'電話の呼び出し音','phone ringtone':'着信音','shop door bell':'店のドアベル','festival crowd, drums':'祭りの人声と太鼓','loud movie scream':'映画から大きな悲鳴','cardboard box thud':'段ボール箱を置く音','soft karaoke intro':'静かなカラオケのイントロ','front desk bell':'フロントの呼び鈴','station announcement chime':'駅の案内チャイム','car door, traffic':'車のドアと通りの音','airport announcement':'空港アナウンス','final boarding call':'最終搭乗案内','bag drops':'かばんが落ちる音'}

def render_sfx(text):
    if text not in SFX_JA: raise ValueError(f'効果音の表示名が未設定: {text}')
    return f'<span class="sfx" lang="ja"><span aria-hidden="true">♪</span> 効果音：{SFX_JA[text]} <span class="sfx-en" lang="en">({e(text)})</span></span>'

def skit(config,episodes,index):
    ep=episodes[index]; path=url(ep); level=ep['level']; meta=ep['meta']
    trail=[('ホーム','/ja/'),(f'CEFR {level}',f'/ja/courses/{level.lower()}/'),(ep['id'],path)]
    blocks=[]
    for b in ep['blocks']:
        if b['type']=='sfx': blocks.append(f'<div class="sfx-block">{render_sfx(b["text"])}</div>'); continue
        en=''.join(e(s['text']) if s['type']=='text' else render_sfx(s['text']) if s['type']=='sfx' else '' for s in b['segments'])
        kind=b['type']; speaker_class=b['speaker'].lower() if b['speaker'] in {'Frank','Tina'} else 'other'
        line_id = f'id="line-{b["number"]}"' if b["number"] else ""
        line_number = f'<span class="line-number">{b["number"]:02d}</span>' if b["number"] else ""
        blocks.append(f'<div class="script-block {kind} {speaker_class}" {line_id}><div class="speaker"><span lang="en">{e(b["speaker"])}</span><span>{e(b["speakerJa"])}</span>{line_number}</div><div class="speech"><p class="english" lang="en">{en}</p><p class="translation">{e(b["ja"])}</p></div></div>')
    notes='<div class="expression-grid">'+''.join(f'<article><span class="expression-number">0{i+1}</span><h3 lang="en">{e(item["phrase"])}</h3><p>{e(item["explanation"])}</p><a href="#line-{item["line"]}">本文の台詞{item["line"]}へ <span aria-hidden="true">↑</span></a></article>' for i,item in enumerate(meta['learning']))+'</div>'
    app_label,app_href=training_link(config,ep['id'])
    prev=episodes[index-1] if index else None; nxt=episodes[index+1] if index+1<len(episodes) else None
    navigation='<nav class="episode-navigation" aria-label="前後の物語">'
    navigation+=(f'<a href="{url(prev)}" rel="prev"><span>← 前の話 / {prev["id"]}</span><strong lang="en">{e(prev["title"])}</strong></a>' if prev else '<div><span>ここから物語が始まります</span></div>')
    navigation+=(f'<a href="{url(nxt)}" rel="next"><span>次の話 / {nxt["id"]} →</span><strong lang="en">{e(nxt["title"])}</strong></a>' if nxt else '<a href="/ja/courses/"><span>A2を読み終えました</span><strong>ほかの物語を読む →</strong></a>')+'</nav>'
    body=f'''<div class="section-shell reader-shell">{crumbs(trail)}<header class="skit-heading"><p class="eyebrow">{ep['id']} / CEFR {level} / EPISODE {int(ep['id'][-2:]):02d}</p><h1 lang="en">{e(ep['title'])}</h1><p class="skit-subtitle">{e(meta.get('heading') or ep['scene'])}</p><p class="scene"><span>場面</span>{e(ep['scene'])}</p></header><figure class="skit-illustration"><a href="/assets/images/{meta['slug']}-1440.webp" target="_blank" rel="noopener" aria-label="挿し絵を別タブで拡大表示">{picture(ep,priority=True,sizes="(max-width: 900px) 100vw, 900px")}</a><figcaption>挿し絵を選ぶと、別タブで全体を拡大できます。</figcaption></figure><section class="script-section" aria-labelledby="script-heading"><div class="reader-toolbar"><h2 id="script-heading">STORY <span>英文と日本語訳</span></h2><button type="button" class="translation-toggle" id="translation-toggle" aria-pressed="true" aria-controls="script-content" hidden data-enhancement>日本語訳を隠す</button></div><div id="script-content">{''.join(blocks)}</div></section><section class="learning-section"><p class="eyebrow">WORDS TO TAKE WITH YOU</p><h2>この回で使う表現</h2>{notes}<aside class="story-note"><h3>物語のひとくちメモ</h3><p>{e(meta['note'])}</p></aside></section><aside class="skit-practice"><div><p class="eyebrow">NEXT, FIND YOUR VOICE.</p><h2>この会話を、あなたの声で。</h2><p>{ep['id']}のシャドーイング・リピーティングをアプリで{'練習できます' if config['release']['webTraining'] else '提供予定です'}。</p></div>{button(app_label,app_href)}</aside>{navigation}<div class="back-to-course"><a class="text-link" href="/ja/courses/{level.lower()}/">{level}の60話一覧へ {arrow()}</a></div></div>'''
    title=f'{meta.get("heading") or ep["scene"]}｜{level}英会話 {ep["title"]} — {BRAND}'
    description=f'{ep["id"]}「{ep["title"]}」。{ep["scene"]}英文・和訳と3つの学習表現で読む、フランク＆ティナの英会話。'
    return path,layout(config,path,title,description,body,breadcrumbs=trail,social_image=(f'/assets/images/{meta["slug"]}-960.webp',ep['image']['alt']['ja']))

def updates(config,episodes):
    path='/ja/updates/'; trail=[('ホーム','/ja/'),('アプリの公開案内',path)]
    signup=config['signup']; enabled=all(signup.get(k) for k in ['endpoint','privacyUrl','consentText','integrationVerified'])
    stores=''.join(button(f'{"App Store" if p=="ios" else "Google Play"}で見る',config['stores'][p],True) for p in ['ios','android'] if config['release'][p])
    form=f'''<form id="signup-form" action="{e(signup['endpoint'],quote=True) if enabled else '/ja/updates/'}" method="post" data-enabled="{str(enabled).lower()}"><label for="email">メールアドレス</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required {'disabled' if not enabled else ''}><input type="hidden" name="lesson" id="signup-lesson" value=""><label class="consent"><input type="checkbox" name="consent" required {'disabled' if not enabled else ''}><span>{e(signup['consentText']) if enabled else '公開案内メールの受け取りに同意する（受付準備中）'}{f' <a href="{e(signup["privacyUrl"],quote=True)}">プライバシーポリシー</a>' if enabled else ''}</span></label><button class="button" type="submit" {'disabled' if not enabled else ''}>{'公開案内を受け取る' if enabled else 'メール受付は準備中です'}</button><p id="signup-status" role="status" aria-live="polite">{'メールアドレスは現在送信できません。受付開始後、このページでご案内します。' if not enabled else ''}</p></form>'''
    heading = '声の練習を、<br>アプリで始めよう。' if config['release']['webTraining'] else '声の練習は、<br>もう少し先に。'
    body=f'''<div class="section-shell updates-shell">{crumbs(trail)}<section class="page-heading"><p class="eyebrow">COMING TO YOUR DOJO</p><h1>{heading}</h1><p class="lead">今は、二人の物語をお楽しみください。<br>アプリの公開時期や提供内容を、このページでご案内します。</p><p class="selected-lesson" id="selected-lesson" hidden></p></section><section class="release-status" aria-labelledby="release-heading"><h2 id="release-heading">現在の提供状況</h2><dl><div><dt>物語の閲覧</dt><dd>A1・A2 / 120話をプレビュー</dd></div><div><dt>Webでの訓練</dt><dd>{'提供中' if config['release']['webTraining'] else '提供準備中'}</dd></div><div><dt>iOS / Android</dt><dd>{'一部または両ストアで提供中' if stores else '公開時期は未定'}</dd></div><div><dt>アプリの料金</dt><dd>月額{config['pricing']['monthlyYen']}円・{config['pricing']['trialDays']}日間無料トライアル{'' if config['release']['billing'] else '（予定）'}</dd></div><div><dt>端末間の進捗同期</dt><dd>今後対応予定</dd></div></dl>{stores}</section><section class="signup-panel"><div><p class="eyebrow">KEEP IN TOUCH</p><h2>公開案内を受け取る</h2><p>{'Web版やスマホ版の公開情報を、メールでお届けします。' if enabled else 'Web版やスマホ版の公開情報をお届けするメール案内を準備しています。'}</p></div>{form}</section><div class="updates-reading"><p>待っている間に、物語の続きを。</p>{button('120話の物語を読む','/ja/courses/')}</div></div>'''
    return path,layout(config,path,f'アプリの公開案内・提供状況 — {BRAND}','FrankenDojoのWeb訓練版とスマホ版の公開案内。現在は提供準備中。A1・A2の120話はこのプレビューで読めます。',body,breadcrumbs=trail)

def rights(config):
    path='/ja/rights/'; trail=[('ホーム','/ja/'),('権利表記',path)]
    body=f'''<div class="section-shell legal-shell">{crumbs(trail)}<section class="page-heading"><p class="eyebrow">CREDITS &amp; RIGHTS</p><h1>作品と権利について</h1></section><section class="legal-copy"><h2>フランケン＆ティナ 英語大作戦</h2><p>Frank &amp; Tina English Adventures<br>© 2026 誠和アプリ開発 (Seiwa App Development). All rights reserved.</p><p>台本・登場人物・ストーリーは、誠和アプリ開発のオリジナル作品です。教材の利用条件は、原本のLICENSE・NOTICEに基づきます。</p><p><a href="/assets/LICENSE.txt">台本利用許諾（LICENSE）全文</a><br><a href="/assets/NOTICE.txt">原本の権利表記（NOTICE）</a><br><a href="https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode">CC BY-NC-ND 4.0 ライセンス全文</a></p><h2>ブランド表記</h2><p>FrankenDojo <span>by KataSpeak</span></p><p>ブランド付記と、上記の著作権者表記はそれぞれのものです。</p><h2>運営サイト</h2><p><a href="{config['links']['operator']}">誠和アプリ開発のWebサイト</a></p></section></div>'''
    return path,layout(config,path,f'権利表記・作品クレジット — {BRAND}','フランケン＆ティナ 英語大作戦の作品クレジット、原本の利用許諾、運営サイト。',body,breadcrumbs=trail)

def all_pages(config,episodes):
    by_id={ep['id']:ep for ep in episodes}
    pages=dict([course_index(config,episodes),course_index(config,episodes,'A1'),course_index(config,episodes,'A2'),characters(config,by_id),updates(config,episodes),rights(config)])
    pages.update(skit(config,episodes,i) for i in range(len(episodes)))
    return pages
