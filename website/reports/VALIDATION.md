# ローカル実装の検証記録

2026-09-12 / FrankenDojo by KataSpeak

対象はユーザー指定のA1・A2、計120話です。ローカルLPと読書サイトは完成し、下記を確認しました。本番公開や実際のメール登録・課金は行っていません。

## 自動検証

`python3 scripts/build.py`、`python3 scripts/validate.py`、`node --check static/site.js`が成功しました。

| 項目 | 結果 |
|---|---|
| 原本 | A1・A2各60話、120ユニークID、期待する順序と一致 |
| HTML | 129ページ。120話、LP、人物、コース入口、2コース一覧、公開案内、権利、ルート誘導、404 |
| 本文 | ナレーションを含む1,336組の英文・和訳を現行原本と照合。話者・番号も一致 |
| SFX | 21件を位置・内容ごと保持し、発話と別表示 |
| 制作メモ | 既知の2件を監査へ保存。発話に混入せず、未知書式も黙って省略しない |
| 表現・解説 | 各話3点、計360表現と120解説。全表現に原本台詞番号があり、その英文内に実在 |
| 画像棚卸し | OLDを含むPNG201件の形式検証で破損なし。採用はA1・A2の120枚 |
| 配信画像 | 480・960・1440px幅のWebP計360件。採用先重複・参照切れなし |
| 画像の内容対応 | A2の15話でファイル名のIDと内容のずれを明示補正。[対応表](ASSET_AUDIT.md)参照 |
| 内部リンク | 全HTMLのhref・src・srcset・フォームaction・アンカーを検証、参照切れ0件 |
| 前後話 | 全120話の前後リンクを確認。A1-60→A2-01、A2-60で一覧へ戻る動線も確認 |
| 検索なしでの閲覧 | 各コース60話すべての通常リンク・全話の英日本文が初期HTMLに存在 |
| メタデータ | 各ページのtitle・descriptionは固有。canonical・OG・パンくずと各話画像が一致 |
| サイトマップ | URL127件、画像120件。ローカルoriginでの検証用出力 |
| プレビュー | 全HTMLがnoindex,nofollow、robots.txtは全体拒否 |
| 公開対象の除外 | B1・B2ページ、PNG原本、音声、制作メモ、認証情報は配信先に含めない |
| ブランド | 生成HTMLに旧称SayDojoなし。FrankenDojo / by KataSpeakを使用。権利者は変更なし |
| 公開状態 | Web訓練・iOS・Android・課金の16組をテンプレートで確認。無料CTAはA1-01だけ |
| 異常系 | 不正な訓練URL4種、未知タグ・閉じないタグ、対訳欠損・ID重複・番号欠落を拒否 |
| 本番ゲート | 仮の本番originを指定したCLIで、120話・未承認・未接続を理由に意図通り非ゼロ終了 |
| 再現性 | 通常ビルド再実行の前後で生成496ファイルのSHA-256が完全一致 |

機械可読の結果は [validation.json](validation.json)、[source-audit.json](source-audit.json)、[production-gate-check.json](production-gate-check.json)、[reproducibility.json](reproducibility.json) に保存しています。

## ブラウザ確認

Codex内蔵ブラウザで、LP・人物・コース入口・A1一覧・A1-01詳細・公開案内の6ページを、**320 / 390 / 768 / 1440px**の4幅で確認しました。スクロールバーを除く実際の表示幅とscrollWidthが全24画面で一致し、横スクロールはありません。優先画像の読み込み失敗はありません。

- トップの「第1話を読む」からA1-01へ遷移。
- 和訳を隠す→再表示。aria-pressedと実際の表示が一致。
- A1-21の検索で1件、存在しない検索語で0件・解除案内を表示。
- 検索解除で60話に復帰。
- キーボードのEnterで本文へのスキップ・FAQ展開・スマホメニュー展開・一覧への遷移。
- 公開案内までA2-60のIDを保持。未接続のメール欄・送信ボタンは無効。
- 同じサイトJSを使用するローカル模擬受付で、受理成功、HTTP失敗、HTTP成功でも受付未確認の3分岐を確認。最後の2分岐は失敗表示。
- 実サイトでは外部送信をしていません。模擬受付はテスト入力を保存せず破棄し、検証後に終了しました。
- A2-60の本文表示を追加確認。ブラウザのerror・warnログは0件。

詳細は [browser-validation.json](browser-validation.json) に保存しています。JavaScript無効設定でのブラウザ実行はしていませんが、全話をJavaScriptなしで読める初期HTMLの存在は全件検証しています。実機Safari/iOS/Androidや支払い・認証・音声訓練は今回の確認範囲外です。

主要色のコントラスト比は、本文15.55:1、補足文9.58:1、オレンジCTA上の濃色文字8.84:1、濃色パネル上の水色11.25:1です。これは定義色の計算であり、全要素の第三者アクセシビリティ認証ではありません。`prefers-reduced-motion`に対応しています。

## スクリーンショット

| 画面 | PC（1440px） | スマホ（390px） |
|---|---|---|
| トップ | [表示](screenshots/home-1440.png) | [表示](screenshots/home-390.png) |
| キャラクター | [表示](screenshots/characters-1440.png) | [表示](screenshots/characters-390.png) |
| コース入口 | [表示](screenshots/courses-1440.png) | [表示](screenshots/courses-390.png) |
| A1の60話一覧 | [表示](screenshots/a1-library-1440.png) | [表示](screenshots/a1-library-390.png) |
| スキット詳細 | [表示](screenshots/skit-1440.png) | [表示](screenshots/skit-390.png) |
| 公開案内 | [表示](screenshots/updates-1440.png) | [表示](screenshots/updates-390.png) |

補足: [和訳付き本文・スマホ](screenshots/skit-text-390.png)、[A2-60本文・PC](screenshots/a2-skit-text-1440.png)、[訓練説明・スマホ](screenshots/practice-390.png)、[料金・スマホ](screenshots/pricing-390.png)。

## 未接続・後続の確認

- 本番ドメイン、確認済みの訓練URL、iOS/AndroidストアURL、商品設定は未設定。
- メール受付先、同意文、プライバシーポリシー、問い合わせ先の実接続は未設定。架空のURLや送信成功は表示しない。
- B1・B2は未収録。全240話を一括公開する際には、確認後に生成対象・内容を拡張する作業が必要。
- 原本のA1・A2はユーザー確認済み。今回追加した120話の解説・360表現・alt・画像ID補正は、エージェント確認と最終編集承認を区別して記録。
- 音声ファイルとの内容・タイミング同期は未検証。台本原本、音声、画像、既存build生成物は変更していない。
- 既存の未コミット変更を保持し、今回の追加は`website/`内のみ。コミットはしていない。

全生成物は約31.7MiB、ヒーローの960px画像は約90.6KiB。画像は原寸PNGを公開せず、画面幅に応じたWebPと遅延読み込みを使用しています。外部フォント・CDNや生成時以外のサーバー処理に依存しません。
