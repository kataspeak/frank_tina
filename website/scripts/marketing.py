"""Source-backed marketing pages; independent of the Flutter app at build time."""
import json
from functools import lru_cache
from html import escape as e
from pathlib import Path

ASSETS = {
    'logo': ('logo', 2138, 735, 'FrankenDojo by KataSpeak'),
    'frank': ('frank', 2800, 1650, '声を出すフランクを囲む、反復のリングと音波'),
    'tina': ('tina', 1160, 1160, '両手を合わせ、楽しそうに見つめる青い髪のティナ'),
    'hearing': ('hearing', 1254, 1254, '繰り返し聞くことを表す、耳と音波とループ矢印'),
    'speaking': ('speaking', 1254, 1254, '声に出して練習することを表す、口と音波のネオン'),
}


@lru_cache
def content():
    return json.loads((Path(__file__).parents[1] / 'content/features.json').read_text())


def features():
    return content()['features']


def feature_url(feature):
    return f'/ja/features/{feature["slug"]}/'


def art(key, *, priority=False, cls=''):
    name, width, height, alt = ASSETS[key]
    sizes = '(max-width: 600px) 90vw, 50vw' if key in {'logo', 'frank'} else '(max-width: 600px) 75vw, 400px'
    return f'<img class="{cls}" src="/assets/brand/{name}-960.webp" srcset="/assets/brand/{name}-480.webp 480w, /assets/brand/{name}-960.webp 960w" sizes="{sizes}" width="{width}" height="{height}" alt="{alt}" {"fetchpriority=\"high\"" if priority else "loading=\"lazy\""} decoding="async">'


def more_link(f):
    return f'<a class="learn-link" id="learn-{f["slug"]}" data-feature-link="{f["slug"]}" href="{feature_url(f)}"><span>{f["name"]}を知る</span><span aria-hidden="true">↗</span></a>'


def store_cta(config):
    import templates as t
    stores = [(p, label) for p, label in [('ios', 'App Storeで見る'), ('android', 'Google Playで見る')] if config['release'][p]]
    buttons = ''.join(t.button(label, config['stores'][platform]) for platform, label in stores)
    return (f'<p class="availability">{"公開済みストアからダウンロードできます" if stores else "iOS・Androidアプリは提供準備中です"}</p>'
            f'<div class="actions">{buttons or t.button("アプリの公開案内", "/ja/updates/")}</div>')


def showcase(f, number, *, reverse=False):
    return f'''<section class="feature-showcase {'reverse' if reverse else ''} reveal" id="feature-{f['slug']}">
      <div class="feature-copy"><p class="section-index">{number} / {f['english']}</p><h2>{clause_title(f['title'])}</h2><p class="feature-summary">{f['summary']}</p>{more_link(f)}</div>
      <div class="feature-art">{art(f['image'])}<p class="art-caption" lang="en">{'Listen. Find your voice.' if not reverse else 'Recall. Say it again.'}</p></div>
    </section>'''


def clause_title(text):
    return ''.join(f'<span class="title-clause">{e(part)}{"、" if i < len(text.split("、"))-1 else ""}</span>' for i,part in enumerate(text.split('、')))


def home(config, episodes):
    import templates as t
    fs = features(); by_id = {ep['id']: ep for ep in episodes}
    controls = ''.join(f'''<article class="control-card reveal" id="feature-{f['slug']}"><div class="control-top"><span class="section-index">{i+3:02d}</span>{art(f['image'])}</div><p class="control-label" lang="en">{f['english']}</p><h3>{clause_title(f['title'])}</h3><p>{f['summary']}</p>{more_link(f)}</article>''' for i, f in enumerate(fs[2:7]))
    own = fs[7]
    price = config['pricing']; planned = '（予定）' if not config['release']['billing'] else ''
    app_label, app_href = t.training_link(config)
    heading = 'Train your mouth in the Dojo of language.'
    words = ['Train', 'your mouth', 'in the Dojo', 'of language.']
    heading_lines = ''.join('<span class="title-line">'+''.join(f'<span class="title-letter {"title-space" if char == " " else ""}" style="--letter:{idx}" aria-hidden="true">{e(char) if char != " " else "&nbsp;"}</span>' for idx,char in enumerate(word))+'</span>' for word in words)
    return f'''<div class="dojo-home">
    <section class="poster-hero" aria-label="フランケン道場">
      <div class="poster-art" data-opening>
        {art('frank', priority=True)}
        <canvas class="opening-canvas" width="1400" height="825" aria-hidden="true"></canvas>
        <button class="opening-replay" type="button" hidden aria-label="フランクのアニメーションを再生" title="アニメーションをもう一度再生"><span class="opening-hint" aria-hidden="true">もう一度再生 ↻</span></button>
      </div>
      <h1 class="poster-title" lang="en" aria-label="{heading}">{heading_lines}</h1>
      <div class="poster-brand">{art('logo', priority=True)}<span class="poster-byline">FrankenDojo <span>by KataSpeak</span></span></div>
      <div class="poster-tina">{art('tina', priority=True)}</div>
    </section>
    <div class="dojo-manifesto"><p>語学は鍛える時代へ</p><a href="#practice">声に出す練習を知る <span aria-hidden="true">↓</span></a></div>
    <div class="marketing-shell" id="practice">
      <div class="practice-intro reveal"><p class="section-index">TWO WAYS TO TRAIN</p><p>聞き込む。思い出す。声に出す。<br>あなたのペースで、何度でも。</p></div>
      {showcase(fs[0], '01')}{showcase(fs[1], '02', reverse=True)}
      <section class="support-section"><div class="support-heading reveal"><p class="section-index">A DOJO THAT MOVES WITH YOU</p><h2>練習に、<br>集中できるしくみ。</h2><p>速さも、回数も、練習するところも。<br>自分に合わせて、少しずつ。</p></div><div class="control-grid">{controls}</div></section>
      <p class="power-statement reveal">無意識で使える表現力が、<br class="desktop-break">ここで身につく</p>
      <section class="own-section reveal" id="feature-own-materials"><div><p class="section-index">08 / {own['english']}</p><h2>{own['title']}</h2><p class="feature-summary">{own['summary']}</p><p class="platform-label">スマホ版の機能</p>{more_link(own)}</div><div class="own-art">{art('frank')}<ol class="material-flow"><li>音源を取り込む</li><li>区切りを整える</li><li>声に出して練習</li></ol></div></section>
      <section class="home-stories reveal" id="stories"><div class="support-heading"><p class="section-index">ORIGINAL STORY</p><h2>続きが気になるから、<br>毎日続く。</h2><p>人造人間フランクと、星から来たティナ。<br>くすっと笑える毎日を、あなたの英語に。</p></div><a class="story-spotlight" href="{t.url(by_id['A1-21'])}">{t.picture(by_id['A1-21'])}<div><span class="section-index">FRANK &amp; TINA / A1-21</span><h3 lang="en">Game Night</h3><p>今夜の勝負は、英語で。</p><span class="spotlight-link">この物語を読む ↗</span></div></a><div class="story-entry">{t.button('第1話から読む',t.url(by_id['A1-01']))}<a class="text-link" href="/ja/characters/">フランクとティナを知る ↗</a></div></section>
      <section class="home-library" id="library"><div class="section-heading"><h2>あなたのペースで、物語の続きを。</h2><p>A1・A2、各60話。<br>挿し絵・英文・日本語訳つき。</p></div>{t.course_cards(by_id)}<p class="library-note">A1・A2、120話の物語を無料で読めます。</p></section>
      <section class="home-pricing" id="pricing"><div class="section-heading"><div><p class="section-index">START YOUR PRACTICE</p><h2>物語は無料。<br>声の練習はアプリで。</h2></div><p>Webは公式教材の訓練に。<br>スマホは手持ち教材やスリープ練習にも。</p></div><div class="pricing-grid"><article class="price-card"><p class="section-index">READ THE STORY</p><h3>物語を読む</h3><div class="price">¥0</div><p>ログイン不要。120話の英文と日本語訳、<br>学習表現とひとくちメモを楽しめます。</p>{t.button('物語の一覧へ','/ja/courses/',True)}</article><article class="price-card featured"><p class="section-index">TRAIN YOUR VOICE</p><h3>声に出して練習する</h3><div class="price">¥{price['monthlyYen']}<span> / 月額{planned}</span></div><p>新規対象者は{price['trialDays']}日間無料トライアル{planned}。<br>A1-01の常時無料体験とは別の仕組みです。</p>{t.button(app_label,app_href)}</article></div><p class="pricing-note">トライアル終了後は月額プランへ自動移行{'する予定です' if planned else 'します'}。正式な提供状況・条件はアプリの公開案内とストアでご確認ください。このサイトから購入・契約はできません。</p></section>
      <section class="faq-section home-faq"><div><p class="section-index">FAQ</p><h2>はじめる前に。</h2></div><div class="faq-list">{t.faq(config)}</div></section>
    </div>
    <section class="download-section"><div class="marketing-shell"><p class="section-index">WELCOME TO YOUR DOJO</p><h2>今すぐダウンロードして、言葉の道場に入門</h2>{store_cta(config)}</div>{art('tina',cls='download-tina')}</section>
    </div>'''


def demo_controls(f):
    settings = content()['settings']; slug = f['slug']; out = ''
    if slug in {'difficulty-speed', 'difficulty-repeat'}:
        out += '<fieldset class="demo-options"><legend>フレーズの難易度</legend>' + ''.join(f'<label><input type="radio" name="difficulty" value="{key}" {"checked" if key=="normal" else ""}>{label}</label>' for key,label in settings['difficultyLabels'].items()) + '</fieldset>'
    if slug == 'difficulty-repeat':
        out += '<label class="demo-setting">選択した難易度のセット数 <select data-repeat-count aria-label="セット数">'+''.join(f'<option value="{n}" {"selected" if n==2 else ""}>{n}セット</option>' for n in range(1,11))+'</select></label>'
    if slug == 'repeating':
        out += '<fieldset class="demo-options"><legend>練習する単位</legend><label><input type="radio" name="unit" value="phrase" checked>フレーズ全体</label><label><input type="radio" name="unit" value="chunk">チャンク</label></fieldset>'
    if slug == 'lesson-selection':
        out += '<fieldset class="lesson-choices"><legend>学習中にするレッスン</legend>'+''.join(f'<label><input type="checkbox" name="lesson" value="{n}" {"checked" if n in (1,3,4) else ""}><span>レッスン {n:02d}</span></label>' for n in range(1,6))+'</fieldset>'
    if slug == 'sleep-stop':
        for key,title,values,default in [('maximum','最大時間',settings['sleepMaximumMinutes'],settings['sleepDefaults']['maximum']),('silence','無発話で停止',settings['sleepSilenceMinutes'],settings['sleepDefaults']['silence'])]:
            out += f'<label class="demo-setting">{title}<select data-sleep-{key} aria-label="{title}">'+''.join(f'<option value="{v}" {"selected" if v==default else ""}>{v}分</option>' for v in values)+'</select></label>'
    if slug == 'shadowing':
        out += '<fieldset class="demo-options"><legend>試してみる流れ</legend><label><input type="radio" name="voice" value="speaking" checked>声を出す</label><label><input type="radio" name="voice" value="listening">もう一度聞く</label></fieldset>'
    return out


def feature_page(config, f):
    import templates as t
    path = feature_url(f); anchor = f'/ja/#feature-{f["slug"]}'
    trail = [('HOME',anchor),(f['name'],path)]
    steps = ''.join(f'<li><span class="step-number">{i+1:02d}</span><h3>{e(s["title"])}</h3><p>{e(s["text"])}</p></li>' for i,s in enumerate(f['steps']))
    menus = ''
    if f['slug'] == 'difficulty-speed':
        settings = content()['settings']
        menus = '<div class="default-menus" aria-label="初期速度メニュー">' + ''.join(f'<p>{settings["difficultyLabels"][key]}：{" → ".join(f"{speed:.1f}" for speed in speeds)} 倍</p>' for key,speeds in settings['shadowSpeeds'].items()) + '</div>'
    panels = ''.join(f'<section class="feature-explanation"><span class="section-index">0{i+1}</span><div><h2>{e(d["title"])}</h2><p>{e(d["text"])}</p></div></section>' for i,d in enumerate(f['details']))
    related = ''.join(f'<a href="{feature_url(other)}">{other["name"]} <span aria-hidden="true">↗</span></a>' for other in features() if other['slug'] != f['slug'])
    data = json.dumps({'feature':f,'settings':content()['settings']},ensure_ascii=False).replace('<','\\u003c')
    body = f'''<article class="feature-detail marketing-shell" data-feature="{f['slug']}">
      {t.crumbs(trail)}<header class="feature-heading"><div><p class="section-index">{f['english']}</p><p class="feature-kind">{f['name']}</p><h1>{clause_title(f['title'])}</h1><p class="feature-intro">{f['intro']}</p>{f'<p class="platform-label">{f["platform"]}</p>' if f.get('platform') else ''}</div>{art(f['image'],priority=True)}</header>
      <section class="feature-demo" aria-labelledby="demo-heading"><div class="demo-heading"><h2 id="demo-heading">しくみを、見てみよう。</h2><span>動作イメージ・音は出ません</span></div>
      <div class="interactive-demo" hidden data-demo-ui>{demo_controls(f)}<div class="demo-stage" data-demo-stage><p class="demo-cue" lang="en" data-demo-cue></p><div class="demo-track" data-demo-track></div><h3 data-demo-title></h3><p data-demo-text></p></div><div class="demo-actions"><button type="button" data-demo-play>一時停止</button><button type="button" data-demo-restart>もう一度</button><button type="button" data-demo-next>次のステップ</button><span data-demo-progress></span></div><p class="demo-announcement sr-only" role="status" aria-live="polite"></p></div>
      <ol class="explanation-steps">{steps}</ol>{menus}<p class="demo-note">{e(f['note'])}</p></section>
      <div class="feature-explanations">{panels}</div>
      <aside class="feature-cta"><p>声に出す練習を、あなたの毎日に。</p>{store_cta(config)}</aside>
      <nav class="related-features" aria-label="ほかの機能"><h2>ほかのしくみも、知ってみよう。</h2><div>{related}</div></nav>
      <a class="home-return learn-link" data-home-return href="{anchor}"><span>HOMEに戻る</span><span aria-hidden="true">↖</span></a>
      <script type="application/json" id="feature-data">{data}</script>
    </article>'''
    return path, t.layout(config,path,f'{f["name"]}｜{f["title"]} — {t.BRAND}',f['intro'],body,breadcrumbs=trail,social_image=(f'/assets/brand/{ASSETS[f["image"]][0]}-960.webp',ASSETS[f['image']][3]))
