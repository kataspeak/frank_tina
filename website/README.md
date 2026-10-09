# FrankenDojo by KataSpeak — ローカルLP・スキットサイト

確認済みの **A1・A2、各60話・計120話**を対象とした日本語サイトです。トップページ、8つの機能詳細、人物紹介、2コースの入口・一覧、120話の詳細、アプリ公開案内、権利表記を静的HTMLで生成します。

2026-09-12の指示書に対するユーザーの最新指示を優先し、B1・B2の本文・画像・コースページは生成していません。当初は120話のローカル確認用でした。2026-09-29のユーザー指示により、現在のA1・A2サイトをアプリに先行してCloudflare Pagesへ公開しました。アプリと課金は提供準備中です。通常の全240話公開条件とは別に、下記の先行公開設定を用意しています。

## 起動と再生成

Python 3.12以降と `cwebp`（WebP CLI）が必要です。フロントエンドの依存インストール、外部フォントサービスへの接続、CDN、アカウントは不要です。この環境ではPython 3.14と既存のcwebpで確認しました。

```sh
cd /Users/Yoshio/StudioProjects/frank_tina/website
python3 scripts/build.py
python3 scripts/validate.py
python3 -m http.server 4321 --bind 127.0.0.1 --directory dist
```

[ローカルプレビュー](http://localhost:4321/ja/) を開きます。サーバーがすでに動いている場合、再生成後にブラウザを再読み込みしてください。サーバーを重複起動する必要はありません。終了は起動したターミナルでCtrl+Cです。

`cwebp`がないMacではWebPのコマンドラインツールを準備してください（Homebrewを使う場合は `brew install webp`）。画像はローカルの `../images/`、台本は `../skits/` を使用します。画像フォルダは元リポジトリでGit管理対象外なので、別環境にも制作素材の配置が必要です。

## 採用した生成方式

既存プロジェクトには再利用できる生成スクリプト・Web開発依存がなく、`build/`には既存の教材JSONがありました。原本からの厳密な抽出を優先し、**Python標準ライブラリによる静的サイト生成 + cwebp**を選びました。テンプレートを共用し、個別HTMLや台本コピーを手編集しません。

初期HTMLに全英文・和訳・話者・通常リンクを含みます。JavaScriptは検索、和訳の表示切替、設定済みの場合の案内フォーム、トップの出現演出、説明用デモ、HOME復帰の位置・フォーカス復元に使用します。説明はJavaScriptなしでも読めます。訓練プレーヤー・音声再生・録音・マイク取得・認証・購入処理は含みません。

| ファイル | 用途 |
|---|---|
| `scripts/source.py` | 正本2ファイルの型付き抽出。未知書式・対訳欠損・IDや番号の不整合は原本行番号付きで失敗 |
| `scripts/build.py` | 設定検証、画像監査・WebP変換、HTML・サイトマップ生成、本番公開ゲート |
| `scripts/templates.py` | LP・共通レイアウト・一覧・人物・各話・公開案内のテンプレート、教材リンク生成 |
| `scripts/marketing.py` | トップと8つの機能詳細の共通生成 |
| `content/features.json` | 機能説明・動作イメージ・初期設定の共通データ |
| `static/marketing.css` / `marketing.js` | トップ・機能詳細だけの表示と操作 |
| `static/fonts/` / `static/brand/` | ローカル配信するフォント・提供素材の軽量画像 |
| `static/site.css` | 配色、レスポンシブ表示、フォーカス、動きの軽減 |
| `static/site.js` | 検索・訳切替・案内受付。メールをログやローカル保存へ書き込まない |
| `content/episodes.json` | ID別の固定slug、見出し、3表現と出典台詞番号、解説、原本リビジョン、確認状態 |
| `content/images.json` | 明示的な採用ファイル、日英alt、焦点位置、採用根拠、実見時ハッシュ |
| `config.json` | ローカル用の初期設定。外部URL・公開状態の集約先 |
| `scripts/validate.py` | 生成HTML・原本対応・内部リンク・教材境界・設定切替などの検証 |
| `ASSET_AUDIT.md` | 画像選定・ID補正の判断根拠。Gitで保持する保守資料 |
| `reports/` | ローカルの検証結果・スクリーンショット。生成入力・配信対象ではなく、Git管理対象外 |
| `.cache/material.json` | 形式バージョンと教材リビジョンを持つ、原本由来の生成データ。配信対象外 |
| `.cache/images/` | 画像ハッシュ・サイズをキーにしたWebPキャッシュ。配信対象外 |
| `dist/` | 配信用生成物。手編集しない。Git管理対象外 |

本文・原画像・音声・既存の `build/` は更新していません。`dist/app/` は予約領域として生成・消去・上書きしません。再生成で消去するのは、この生成処理が所有する `dist/ja/` と `dist/assets/` です。将来の配信でも `/app/` を別成果物へ振り分け、ドメイン全体への同期削除を避けてください。

## ページ構成

```text
/
/ja/
/ja/features/<slug>/ 8機能
/ja/characters/
/ja/courses/
/ja/courses/a1/
/ja/courses/a2/
/ja/skits/a1/a1-01-beyond-the-stars/ など120話
/ja/updates/
/ja/rights/
/404.html
/sitemap.xml
/image-sitemap.xml
/robots.txt
```

ルートは日本語トップへ誘導します。静的ホストを選ぶ際は、未知のURLに `404.html` をHTTP 404として返す設定も必要です。標準のローカルHTTPサーバーでは、未知URLにはサーバー標準の404が表示されます。

## 原本と画像を更新するとき

1. 台本の編集は必ず `../skits/` で行います。
2. 対応する `content/episodes.json` の表現・解説を通読し、各 `learning.line` の原文に `phrase` が含まれることを確認します。全台詞の複製は置きません。
3. 確認後、対象話の `sourceRevision` を新しい抽出結果の値へ更新します。ハッシュだけを更新して確認を省略しないでください。**slugはタイトルから作り直しません。** URLを変える場合は旧URLのリダイレクトを別途用意します。
4. 画像を変更した場合は実見し、採用パス・日英alt・焦点・`reviewedSha256` を更新します。複数候補から更新日時だけで選びません。
5. 再生成・検証を実行し、`reports/` と実画面を確認します。

今回、A2の15話でファイル名のIDと画像内容が食い違っていました。現行台本の内容と照合し、**原画像を改名せず** `sourceEpisodeId` 付きで明示的に対応を補正しました。詳しくは [画像監査](ASSET_AUDIT.md) を参照してください。一覧画像は全体表示を基本にして顔の切れを防ぎ、詳細では縦横比を保って全体を表示します。

演技タグは既知の許可リストで扱い、未知の角括弧を一括削除しません。SFXは位置と内容を保持し、発話とは別の表示にします。A1-47後の設定メモとA1-49後の注釈は、既知の制作資料として監査に保存し、発話本文には出しません。

## 設定とアプリ接続

`config.json`を設定例として使い、必要ならGit管理対象外の`config.local.json`へコピーします。

```sh
python3 scripts/build.py --config config.local.json
```

- `previewOrigin`：ローカルまたはステージングのorigin。ローカルの別ポートを使う場合はここも合わせます。
- `productionOrigin`：本番ドメイン。未確定のため初期値はnullです。
- `release.siteApproved` / `webTraining` / `ios` / `android` / `billing`：各公開状態を独立管理。
- `app.lessonUrlTemplate`：**アプリ側と確認済みになってから**教材IDを `{id}` で受け取るURLを指定し、`routeConfirmed`をtrueにします。
- `stores.ios` / `android`：実在する公式ストアURLの確認後に設定します。
- `signup`：実受付先・同意文・プライバシーURL・接続確認。初期状態では入力・送信を無効化。
- `links`：原資料で確認できた運営サイトのみ設定済み。架空の問い合わせメール・利用規約・プライバシーページは作っていません。
- `pricing`：月額200円・14日間は予定として表示。商品設定確認前に課金公開を有効化するとビルドが失敗します。

教材のリンク契約とメール受付の応答契約は [接続メモ](APP_HANDOFF.md) に記載しています。

## 本番用ビルド

```sh
python3 scripts/build.py --production --config config.local.json
```

**通常設定では今回の120話構成を受け付けません。** 2026-09-29に承認されたサイト先行公開には、下記の専用設定を使用します。 本番ドメイン、全240話、全話の追加解説・画像対応の最終編集確認、サイト公開承認、未公開アプリに代わる有効な案内受付が必要です。通常設定の公開フラグだけでは120話を公開できません。B1・B2を含める場合は、原本確認後にパーサー・対象データ・コース紹介を拡張する後続作業が必要です。

通常ビルドは全ページ `noindex,nofollow`、robotsは全体を拒否します。XMLサイトマップも確認用originで生成されます。本番URLでのサイトマップ提出・検索登録は未実施です。公開用ビルドが失敗しても、直前のローカル出力を本番成果物として使わないでください。

## 検証と結果の保存

コード・台本・画像の変更後には、上記のビルドと `python3 scripts/validate.py` を再実行してください。原本と英文・対訳・話者・SFXの一致、120話のIDと前後リンク、学習表現、画像、内部リンク、メタデータ、公開条件を検証します。成功は `reports/validation.json` の `success` と終了コードで確認します。

`reports/` は実行時に自動作成され、検証JSON・スクリーンショット・過去の確認記録をローカルに保存します。既存レポートは生成入力ではなく、Gitにも配信物にも含めません。新しいチェックアウトには過去の記録はありません。`--report-dir` で保存先を変更できます。

自動検証だけでブラウザ確認の完了とは扱いません。320 / 390 / 768 / 1440pxで横はみ出し・画像表示を確認し、検索・和訳切替・キーボード操作・デモ・HOME復帰・JavaScript無効時の表示・動きを減らす設定も確認します。必要な画面や結果はローカルの `reports/` に保存してください。

元資料で確認済みの本文と、サイト追加解説・画像対応の最終編集確認は別の状態として管理しています。画像選定の判断根拠は [画像監査](ASSET_AUDIT.md) に保持します。

## 2026-09-27のサイト改善

ポスターに合わせたトップと、8種類の機能詳細・操作デモを追加しました。機能説明はFrankenDojoのコードとテストを参照して作成しました。参照先はビルド依存に含めていません。根拠と更新箇所は [機能説明の制作メモ](FEATURE_SOURCES.md) を参照してください。制作時の検証記録はローカルの `reports/redesign-2026-09-27/` に保持しています（Git管理対象外）。

今回と同じ出力先で検証する場合：

```sh
python3 scripts/build.py --report-dir reports/redesign-2026-09-27
python3 scripts/validate.py --report-dir reports/redesign-2026-09-27
```

変更前のキャッシュがあるこの作業環境では、検証に `--baseline .cache/redesign-baseline/story-main-sha256.json` を付けると、120話の本文HTML全体が変更前と一致することも確認できます。

Poppins ExtraBoldとNoto Sans JP（400・700）は `static/fonts/` から配信し、同じフォルダにSIL OFLライセンスを置いています。フォント・画像の取得や変換は通常のビルドでは不要です。素材を更新するときだけ `python3 scripts/prepare_marketing_assets.py`、表示する文字を追加してフォントを更新するときだけ `python3 scripts/prepare_marketing_assets.py --fonts` を使います。後者は公式Google Fontsへの接続が必要です。

デモは音を出さず、マイク・ファイル送信・録音も行いません。動きを減らす設定では自動再生せず、操作ボタンで進められます。HOMEへの復帰情報はタブ内の一時保存と履歴に限定し、直接アクセスでは機能アンカーへ戻ります。

## トップのRiveアニメーション（2026-09-27追記）

最新のユーザー指定に従い、トップのフランク画像に提供済みRiveを追加しました。ページ表示時に2秒間再生し、マウス進入・クリック／タップ・Enter／Spaceで先頭から再生します。最後の形で停止し、動きを減らす設定では自動再生とホバー再生を止め、明示的な操作だけで再生します。JavaScript無効・読み込み失敗時は元の静止画像を表示します。

`static/opening.js` とトップの専用マークアップで制御します。`static/animations/frankendojo_opening.riv` は `../output/rive/frankendojo-opening/frankendojo_opening.riv` の配信用コピーです。元のRiveを更新した場合はこのコピーも更新してください。アートボードは `FrankenDojo Opening`、ステートマシンは `Opening Player`、尺は2秒です。尺を変更した場合は `opening.js` の停止時間も更新します。

公式 `@rive-app/canvas` 2.43.1（MIT、ライセンス同梱）とWASMを `static/vendor/rive-2.43.1/` からローカル配信します。トップ以外では読み込みません。通常ビルド・閲覧時にCDNへ接続しません。検証は `node scripts/test_opening.cjs` と既存のPython検証、制作時の確認記録はローカルの `reports/rive-opening-2026-09-27/` に保存しています（Git管理対象外）。


## Cloudflare Pagesへのサイト先行公開（2026-09-29）

アプリをリリースせず、現在のランディングページ・8機能詳細・A1/A2の120話と関連ページを公開するユーザー指示に対応しました。

- 設定: `config.prelaunch.json`。本番originは `https://frankendojo.com`。
- 配置先: Pagesプロジェクト `frankendojo`、production branch `main`、`https://frankendojo.pages.dev`。
- カスタムドメイン: `frankendojo.com`。DNS CNAMEは `@ → frankendojo.pages.dev`（Proxied）。
- 指定ネームサーバー: `elle.ns.cloudflare.com` / `igor.ns.cloudflare.com`。ムームードメイン側で「GMOペパボ以外のネームサーバーを使用する」を選択する。
- アプリ・ストア・課金・メール受付を有効にしない。`dist/app` がある場合は先行公開ビルドを拒否する。
- 従来の指定どおり `noindex,nofollow` とrobotsの拒否を維持。公開URLへのアクセスは可能だが、検索掲載は開始しない。
- `prelaunchOnly` の公開条件を追加。通常の全240話公開条件と各教材の編集確認フラグは変更しない。

```sh
python3 website/scripts/build.py --production --config website/config.prelaunch.json --report-dir website/reports/cloudflare-2026-09-29
python3 website/scripts/validate.py --production --config website/config.prelaunch.json --report-dir website/reports/cloudflare-2026-09-29
```

認証済みWrangler 4.135.0での配置コマンド（リポジトリのルートから実行）：

```sh
wrangler pages deploy website/dist --project-name frankendojo --branch main --commit-dirty=true --force
```

この実行環境では `--force` なしのPagesコマンドが新しいWorkers配備へ委譲されるため、既定のPagesサイトへ配置するために指定しました。今回使用したCLIは隣接アプリの `tools/web/node_modules/.bin/wrangler` です。別環境では同じバージョンの公式CLIを使用してください。資格情報をリポジトリ・配信物へ入れないでください。

制作時の配置確認記録はローカルの `reports/cloudflare-2026-09-29/` に保存しています（Git管理対象外）。再配置時にはビルド・検証後、公開URLの表示とHTTP応答も確認してください。

## 法務ページ

`content/legal/` のMarkdownから `/ja/legal/terms/`、`/ja/legal/privacy/`、`/ja/legal/commercial-transactions/` を生成し、全ページのフッターからリンクします。利用規約とプライバシーポリシーは2026-10-04に `/Users/Yoshio/StudioProjects/FrankenDojo/docs/legal/` から取り込んだ全文のスナップショットです。原本更新時は2ファイルを再取り込みしてください。特商法表記は同資料の事業者・課金情報に基づき作成しています。電話番号が未確認の場合、本番ビルドは配信物を書き換える前に停止します。
