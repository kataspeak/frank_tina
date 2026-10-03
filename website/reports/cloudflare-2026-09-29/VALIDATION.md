# Cloudflare Pagesへの先行公開（2026-09-29）

ユーザーから、アプリはリリースせず現在のランディングページをCloudflareへ公開し、DNSも設定する指示を受領。従来の「ローカル確認のみ」は今回の指示で更新。検索除外の指定は維持。

## 配置

- Cloudflare Pages project: `frankendojo`、production branch: `main`
- 本番デプロイ: `32e002e5-741f-4215-8548-fdc71bfcac5b`
- URL: https://frankendojo.pages.dev/ja/
- 固定デプロイURL: https://32e002e5.frankendojo.pages.dev
- 対象は検証済み `website/dist` の645ファイル。137 HTML、8機能ページ、120話、画像、ローカルフォント、Riveとランタイム。appディレクトリ、音源、資格情報、ソース、レポートは含まない。
- Pages APIでproduction deploymentの成功を確認。公開ブラウザでトップ、画像読込（欠落なし）、Rive初回再生完了、コンソールエラーなしを確認。シャドーイング詳細の再実行・ステップ送り、HOME復帰、コース一覧への導線も確認。
- canonicalは `https://frankendojo.com/ja/`、robots metaは `noindex,nofollow`。
- Python HTTPクライアントでの公開URL検査は403となったため、HTTPのバイト一致は未検証。実ブラウザではページとRiveが正常表示された。

## DNS

- Cloudflareの既存KataSpeakアカウントに `frankendojo.com` をFreeプランで追加。
- DNS自動スキャンは0件。ユーザーに確認し、メール・既存サブドメインは利用していないとの回答を受領。
- Pagesにカスタムドメインを関連付け、Cloudflare DNSへCNAME `frankendojo.com → frankendojo.pages.dev`（Proxied・TTL Auto）を保存。
- 指定NS: `elle.ns.cloudflare.com` / `igor.ns.cloudflare.com`。
- 既存のAPIトークンはR2用途の権限であり、ゾーン・Pages作成は403。Pagesは保存済みWrangler OAuth、ゾーン追加とDNS編集はログイン済みCloudflare UIで実施。権限拡張・新しいトークン生成は行っていない。
- ネームサーバー切替は、ムームードメインの画面を開いているユーザーへ上記2件の入力を案内。確認時点ではCloudflare zone / custom domainともpending。最新結果は `deployment-status.json`。

## ローカル検証

先行公開専用のconfig.prelaunch.jsonと公開ゲートを追加。アプリ・課金などが有効な場合と、出力先にappが混在する場合は拒否。通常の全240話公開ゲートは維持。

Python生成・検証成功。1,336対訳ブロック・360表現と120話のmain HTMLハッシュ一致。既存の未コミット変更と以前のレポートは保持。説明の「ローカルプレビュー」を公開サイト向けに修正。

## ネームサーバー変更後の確認

ユーザーからムームードメインで変更済みとの連絡を受領。

- Cloudflare zoneは `active`、PagesのDNS所有確認（verification_data）は `active`。
- .comの権威DNSと1.1.1.1は `elle.ns.cloudflare.com` / `igor.ns.cloudflare.com` を返す。両Cloudflare権威DNSはAレコード `104.21.7.2` / `172.67.135.138` を返す。
- この端末の通常DNSは旧ムームードメイン情報を返し、ChromeはNXDOMAINのキャッシュが残る。そのため権威DNSで確認したIPをcurlの `--resolve` に指定してHTTPSを検証。TLS証明書検証は無効にしていない。
- `https://frankendojo.com/` は200。指定された `website/dist/index.html` と配信バイトが一致し、`/ja/` へのmeta refreshを確認。
- `/ja/`、コース一覧、シャドーイング詳細、公開案内、A1-01、Rive本体、WASM、robots、sitemapはいずれも200・ローカルSHA-256一致。`/app/` は404。
- 詳細は `domain-http-verification.json`。確認時点のPagesカスタムドメイン全体・validation_dataはまだpending。DNS設定の追加変更は不要で、通常の名前解決とPages表示状態の反映を待つ。
