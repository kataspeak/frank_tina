# サイト改善のDesign QA — 2026-09-27

**Findings**

現時点で未解決のP0/P1/P2指摘はない。トップのポスター構成と提供素材を維持し、スマホでは文字・フランク・ロゴを縦に再配置した。

**比較対象と証拠**

- Source visual truth: `reference_material/ref_website/assets/FrankenDojoWeb-0485870.webp`（5300×3070）および `ref_web.md`。
- Implementation: `http://127.0.0.1:4321/ja/`。ホーム8機能の入口と `/ja/features/<slug>/`。
- 実装キャプチャ: [PC](website/reports/redesign-2026-09-27/screenshots/home-1440.jpg)、[スマホ](website/reports/redesign-2026-09-27/screenshots/home-390.jpg)。
- 同じ入力内の比較: [参考画像とヒーロー](website/reports/redesign-2026-09-27/screenshots/comparison-final.jpg)、[PCとスマホ](website/reports/redesign-2026-09-27/screenshots/comparison-responsive.jpg)。比較HTMLも同フォルダに保存。
- Viewport: 1440×1000、768×1000、390×844、320×844。実画像は1425×990、753×980、375×812、305×804（キャプチャからブラウザのスクロールバー等が除かれる）。取得時の画像サイズを確認し、リサイズ途中のキャプチャは不採用。
- Normalization: 参考画像とPCのヒーローを同じ約1.73の縦横比・同じCSS表示幅へ縮小。実装のヘッダーは比較HTML内で除外。元画像を1:1ピクセル比較するものではなく、構成・タイポグラフィの比較。画像はスクリーンショットのまま、比較用CSSで表示範囲を調整した。
- State: ログインなし・未公開プレビュー・ダーク背景・ヒーロー演出終了後。スマホ画像は指定の縦配置。デモは操作中と停止中の状態を別途確認。
- Focused evidence: [デモ操作](website/reports/redesign-2026-09-27/screenshots/shadowing-1440.jpg)、[320pxのボタン](website/reports/redesign-2026-09-27/screenshots/materials-320.jpg)、[JavaScriptなしの説明](website/reports/redesign-2026-09-27/screenshots/no-js-768.jpg)。ヒーロー内の見出し・ロゴは比較画像で十分読めるため、さらに小さい領域への切り出しは不要。

**Comparison history**

1. 初回比較：P2。英語見出しが参考より小さく、右上の余白が過大。ロゴが低すぎた。[初回実装](website/reports/redesign-2026-09-27/screenshots/desktop-initial.jpg) と参考を `comparison-initial.html` で並べて実見。見出しを5.75vwから7.2vwへ、ロゴ上端を64%から57%へ調整し、語間の幅を確保した。
2. スマホ初回実見：P2。ティナと筆文字が重なり、文節の途中で日本語見出しが改行された。本チャットの初回390pxスクリーンショットで確認。ティナをフランクの右へ移動し、見出しに文節単位の折り返しを追加。導入文のスマホ文字サイズも調整した。
3. 修正後比較：上記の最終比較画像と320・390・768・1440pxを確認。参考の主要領域、画像、色、改行階層を保ち、重なり・横はみ出しは解消。この構成比較に基づく指摘は解消。

4. フォント監査：P2。Google Fontsが日本語を124個の文字範囲に分けて返すため、初回はLatin側だけが保存され、日本語がシステムフォントへフォールバックしていた。取得処理を修正し、必要文字を含む59範囲×2ウェイトとPoppinsをローカル保存。生成HTMLの全かな・漢字が400/700双方の宣言範囲に含まれること、全参照ファイルの存在を自動検証した。修正後のPC・スマホ・機能カードを再撮影し、最終比較を更新した。

**Required fidelity surfaces**

| 項目 | 評価 |
|---|---|
| Fonts / typography | Poppins ExtraBold 800、Noto Sans JP 400/700をローカルWOFF2で配信。英語はHTMLの4行見出し。参考のラスター文字との字形差は指定フォントを使った結果として許容。日本語は文節で折り返し、狭い画面で切れない |
| Spacing / layout | フランク左・英語右、筆文字左下・ティナ右下の主要構成を保持。ヘッダーとby KataSpeak付記はWeb向けの追加。スマホは読み順を優先して縦配置。大きな画像と短文の節、制御機能の一覧、物語・料金・FAQ・CTAの順序を確認 |
| Colors / tokens | 濃紺 #191c28、オレンジ #f5a13d、提供素材の青い筆文字・ネオンを維持。フォーカスは明るい青、選択状態はオレンジ。文字・ボタンが背景に埋もれない |
| Image quality / fidelity | 提供された5種類の画像を使用。ロゴ・人物・リングをCSS/SVGの模造画像へ置換していない。透過・縦横比・顔の表示を確認。既存物語画像は確認済みSHA-256を維持 |
| Copy / content | 指定4コピーを保持。準備中の公開状況を表示。機能説明は現行コード・テストに対応し、想起のピンクノイズ、未達と進行、無発話停止の区別を説明 |

日本語の折り返し・フォーカスの修正後証拠：[390pxの機能カード](website/reports/redesign-2026-09-27/screenshots/controls-390.jpg)。

**Interactions / accessibility**

8デモの切り替え、再生・停止・再実行・ステップ送り、空の学習リスト、キーボードのTab/Enter、戻り時のフォーカス、HOMEと履歴の位置復元、直接訪問、幅変更、保存禁止時のアンカー復帰を確認。通常サイト操作のコンソールerrorは0件。全詳細の静的説明と通常リンクをJavaScriptなしで表示。減速設定の分岐は専用fixtureで停止・手動操作を確認した。

詳細な結果・範囲・未実施環境は [VALIDATION.md](website/reports/redesign-2026-09-27/VALIDATION.md)。実OSの減速設定切り替え、実機アプリ、他ブラウザ固有の試験はこのWeb実装QAには含めていない。

**Open Questions**

- 本番公開時期・ストアURLは未設定のまま。今回のローカル実装を妨げる未決事項はない。

**Implementation Checklist**

- [x] 参考との構成比較と修正後の再比較
- [x] 4画面幅、8詳細、主要操作、教材保護
- [x] 既存変更を保持し、今回の記録を別フォルダへ保存
- [x] noindex・提供準備中のCTAを維持

**Follow-up Polish**

追加の必須修正なし。実ストア公開時に、公開設定と実URLを既存の検証ゲートで確認する。

final result: passed
