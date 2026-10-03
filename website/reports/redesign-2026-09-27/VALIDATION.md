# サイト改善の検証記録（2026-09-27）

今回の記録はこのフォルダに分離した。既存の `reports/validation.json`（作業開始時点で変更済み）と `website/.gitignore` の変更を保持した。

## 静的生成・教材保護

実行コマンド（リポジトリルート）：

```sh
python3 website/scripts/build.py --report-dir website/reports/redesign-2026-09-27
python3 website/scripts/validate.py --report-dir website/reports/redesign-2026-09-27 --baseline website/.cache/redesign-baseline/story-main-sha256.json
node --check website/static/marketing.js
```

[validation.json](validation.json) は成功。137 HTML、サイトマップ135 URL、8機能詳細、120話、1,336対訳ブロック、21 SFX、360表現、物語画像360 WebP（120話×3サイズ）を確認。

- 120話すべての `<main>` 内部HTMLが変更前のSHA-256と完全一致。英文・対訳・3表現・ひとくちメモ・画像・URLを保持。
- 移動後の原画像120件は既存の確認済みハッシュと一致。採用画像の差し替えなし。
- 全内部リンク・アンカー・srcset、8詳細の共通データ、PoppinsとNoto Sans JP 400/700のローカル配信119 WOFF2を検証し、全かな・漢字の文字範囲も確認。
- 公開フラグ16組でCTA切り替えを確認。未公開ストアへの実リンクなし。
- `dist` に `.DS_Store` なし。全ページnoindex、robots拒否、本番公開ゲートを維持。
- 実装と仕様の根拠は [FEATURE_SOURCES.md](../../FEATURE_SOURCES.md)、参照ファイルのハッシュは [app-reference.json](app-reference.json)。アプリ側テストは参照のみ。

## ブラウザ確認

Codex In-app Browserで `http://127.0.0.1:4321/ja/` を操作。レポート表示・隔離条件の確認用に一時的な127.0.0.1:4322を使用した。実ストア、マイク、録音、フォーム送信は使っていない。

| 確認項目 | 結果 |
|---|---|
| トップ 320・390・768・1440px | 横はみ出しなし。PCの左右配置をスマホで縦へ再構成。画像欠損なし |
| 8詳細 320px | 全ページで横はみ出しなし。操作ボタンは折り返して利用可能 |
| 詳細の768・1440px | 見出し・説明・デモ操作の配置を実見 |
| 難易度別速度 | 簡単1.0、普通0.8→0.8→1.0、困難0.6→0.6→0.6→0.8→0.8→1.0を確認 |
| 反復回数 | 初期1・2・3、簡単の最小1・困難の最大10セット、簡単≦普通≦困難の順序を保つ選択制限を確認 |
| シャドーイング | 無発話の模範再生を確認。通常フローとは別に選択可能 |
| リピーティング | フレーズ4段階、3チャンクの例で各チャンクを練習し、全体で1セット完了 |
| 発話検知 | 発話受付→発話→終了待ち→次へを手動操作 |
| 学習対象 | 初期1・3・4、全件待機の空状態、2だけの復帰を確認 |
| スリープ | 最大15/30/60/90、無発話1/3/5の選択肢、15分・1分での停止説明と翌朝の表示を確認 |
| 自分の教材 | 取り込み→解析→区切り確認・編集→練習の各段階を確認 |
| デモ操作 | 再生／一時停止／再実行／次のステップ。自動デモは1巡で停止。手動停止を可視領域検知が上書きしない |
| HOME復帰 | 元のリンクへフォーカスと位置を復元。ヘッダー・パンくず・下部HOMEのリンク生成を確認 |
| 戻る／進む | キーボードで遷移後の戻るを確認（0.5px以内）。HOMEリンクで帰還した履歴への進むでも同一位置・フォーカス |
| 幅変更・直接アクセス | 古い座標を使わず、機能セクションのアンカーへ復帰 |
| 通常のトップ訪問 | 過去の保存情報があってもscrollY=0、過去リンクにフォーカスしない |
| 保存不可 | `sandbox="allow-scripts"` の不透明originでsessionStorageが禁止された状態を使用。詳細へ遷移でき、HOMEで該当セクション・リンクフォーカスへ復帰 |
| JavaScript無効 | `sandbox="allow-same-origin"`（スクリプト許可なし）で実確認。説明・初期メニュー・HOMEの通常アンカーを表示、操作不能なデモボタンは非表示 |
| 動きを減らす設定 | 同じJSへ `matchMedia` のreduce=trueを渡す専用fixtureで確認。初期停止・手動ステップ・再実行後も停止。CSSのreduce分岐はアニメーション・遷移を無効化 |
| キーボード | Tab・Enterで機能リンクへ移動し、復帰時のフォーカス枠と背景横バーを実見。radio/select/buttonは標準要素 |
| 既存の読み物 | A1検索でA1-02を1件表示、和訳を隠す／再表示、3表現とひとくちメモの表示を確認 |
| コンソール | 通常のサイト操作を行った検証タブでerror 0件 |

生の操作結果：[browser-interactions.json](browser-interactions.json)、[history.json](history.json)、[responsive.json](responsive.json)、[reader-checks.json](reader-checks.json)。

検証の範囲：OS全体の「動きを減らす」設定は変更せず、当該分岐を専用fixtureで検証した。JavaScript無効フレーム内のクリックはブラウザ操作ツールが実行できなかったため、表示・通常href・生成物のリンク検証まで確認した。実機iOS/Androidや他ブラウザ固有の受け入れ確認は行っていない。

## 画面と比較

- [参考画像との比較](screenshots/comparison-final.jpg)
- [PC・スマホの比較](screenshots/comparison-responsive.jpg)
- [320px](screenshots/home-320.jpg) / [390px](screenshots/home-390.jpg) / [768px](screenshots/home-768.jpg) / [1440px](screenshots/home-1440.jpg)
- [最小幅でのデモ](screenshots/materials-320.jpg)、[PCのデモ](screenshots/shadowing-1440.jpg)、[JavaScriptなし](screenshots/no-js-768.jpg)

ブラウザのキャプチャ出力はJPEG。スクロールバー等が除かれるためCSS viewportと画像寸法は少し異なる。320→305×804、390→375×812、768→753×980、1440→1425×990。比較HTMLでは画像を同じ表示幅に揃えた。参考とヒーローの比較はヘッダー部分をCSSで除いて同じ領域・縦横比で表示した。キャプチャのclip/fullPageが倍率を変えたものは最終比較に使わず、通常viewportの画像を採用した。

配信成果物に検証用HTML・参照アプリのソース・制作メモは含まれない。本番公開・B1/B2追加・アプリの編集は行っていない。
