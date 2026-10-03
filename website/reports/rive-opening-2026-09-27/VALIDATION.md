# Riveオープニング組み込みの確認（2026-09-27）

## 変更

- トップのフランク画像へ、ユーザー指定の透過Riveを追加。元ファイルは未変更。
- ページ表示時に一度、マウス進入ごとに先頭から2秒間再生。クリック／タップとEnter／Spaceでも再生。
- 完成形（音波3本、口を閉じた状態）で停止。状態機械の不要な継続描画も停止。
- 動きを減らす設定では静止画像から始め、ホバーによる再生も抑制。明示的なクリック・キー操作は可能。
- 元の静止画像を初期HTMLに保持。JS無効、ランタイム・Rive読込失敗、15秒の読込タイムアウト時にも表示。
- ローカルの公式 @rive-app/canvas 2.43.1 とWASMを同梱。トップでのみ読み込む。画像はRive内包、外部アセットCDNは無効。
- ランタイムのMITライセンスは同梱。ソースマップは配信対象外（ベンダーJSは無改変）。

## 根拠

提供物の `output/rive/frankendojo-opening/README.md` と実ファイルを参照。アートボード `FrankenDojo Opening`、状態機械 `Opening Player`、120フレーム・60fps。配信コピーと指定.rivのSHA-256一致を確認。各素材のハッシュは `asset-sha256.json`。

APIは [Rive公式リファレンス](https://rive.app/docs/runtimes/web/rive-parameters) および同梱する2.43.1のソースで確認。`reset` でEntryへ戻し、`onAdvance` の経過時間で2秒後にpauseする。

## 確認結果

- 実ブラウザ：ページ再読込後、trigger=loadで自動再生、2秒後complete。開始の音波1本→終了の3本を目視確認。
- 実ブラウザ：外側から画像へポインターを移動（操作APIのドラッグで進入）するとtrigger=hoverで再生を開始し、completeで停止。
- 実ブラウザ：Enter、Space、クリックによる再生を確認。キーボードフォーカス枠を確認。
- 実ブラウザ：PCおよび390px幅でcanvasと画像領域の寸法が一致。390pxで横はみ出しなし。スマホ実機のタッチ入力そのものは未検証。
- 実ブラウザ：エラー・警告ログなし。
- Nodeの分離テスト：自動再生、2秒停止、再生途中のリセット、mouse/touchの区別、動きを減らす設定、タブ非表示／再表示、履歴復帰、読込失敗／タイムアウト、ランタイム不在を検証。Riveはモックであり、このテストは実描画を検証しない。OSの実際の設定切替は未実施。
- Python再生成・検証：137 HTML、120話、1,336対訳ブロック、360表現、8機能ページ、135サイトマップURLが成功。既存120話のmain内HTMLハッシュはすべて一致。
- 元の `website/reports/validation.json` と以前の改善レポートを上書きせず、このディレクトリへ記録。noindex・公開準備中を維持。

## 再実行

```sh
python3 website/scripts/build.py --report-dir website/reports/rive-opening-2026-09-27
python3 website/scripts/validate.py --report-dir website/reports/rive-opening-2026-09-27 --baseline website/.cache/redesign-baseline/story-main-sha256.json
node website/scripts/test_opening.cjs
node --check website/static/opening.js
git diff --check
```
