# 場面6：眠りにつくまで、語学にひたる

2026-10-15。ホームの場面5の直後に配置。既存の「スリープ停止」のカードを置き換え、ページを移動せず操作できる。アンカーは `#feature-sleep-stop`。

## 見せる流れ

1. 「練習を始める」で、お手本とフランケンくんの口パクが繰り返される。
2. 「眠る」で寝顔になり、枕・毛布・z Zが現れる。発話だけが途切れ、お手本はまだ続く。
3. 無発話が設定時間続くと、お手本も静かに止まる。この時点では結果を見せない。
4. 「朝にする」で朝の色に変わる。右からティナが近づき、「おはよう、フランケンくん！」と声をかける。フランケンくんが目を開け、そのあとスマホに昨夜の結果例を表示する。

開始前に無発話の停止条件を1・3・5分から選べる。待ち時間は30倍の模型（3分を約6秒で表示）。ユーザーの修正指示により、「寝る前に少しだけ」ではなく1時間程度のまとまった練習を伝える構成に変更。朝は推定発話時間「38分24秒」を固定の説明用の例として表示する。操作時間から算出した値ではないことを明記し、実際の記録として保存しない。状態処理内部の時間計測と停止条件は維持する。

「一時停止」「最初から」を用意。画面外・非表示タブでは模型時計を進めない。動きを減らす設定では、Riveの波形やキャラクターの移動を止め、同じ操作と静止図で説明する。音声再生、マイク、録音、通知は使わない。

## アプリとの対応

参照した実装・仕様（アプリ側は変更していない）:

- `/Users/Yoshio/StudioProjects/FrankenDojo/docs/sleep_practice.md`
- `/Users/Yoshio/StudioProjects/FrankenDojo/lib/domain/sleep_practice/entities/sleep_practice_session.dart`
- `/Users/Yoshio/StudioProjects/FrankenDojo/lib/domain/sleep_practice/usecases/sleep_practice_usecase.dart`

睡眠そのものは検知しない。音声受付中の無発話が一定時間続くと止める。お手本の再生中も計測し、発話を検知すれば無発話時間をリセットする。無発話条件は1/3/5分、初期3分。最大時間は15/30/60/90分、初期60分。デモでも60分相当を上限にする。

停止時は静かに終わり、結果表示は後の操作や再訪時まで遅延する。結果の「発話時間（推定）」は声に出した時間の目安で、経過時間、睡眠時間、睡眠の質ではない。iOS/Androidの機能であることをホームに表示する。

ティナの声かけはウェブの説明用演出であり、アプリの目覚まし機能ではない。この点は折りたたみ詳細に記載。本文の長い説明を順に読ませる構成にはせず、夜から朝の変化を主役にする。

スマホは添付の参考画像に合わせ、縦横比約2.08対1の細い黒い筐体、上部の受話口、下部の白い丸いホームボタンで表現。端末内の画面は既存サイトの配色に合わせる。CSSで描画し、画像添付をそのまま拡大配置しない。

## 実装と素材

- `website/static/practice-sleep/` にHTML、CSS、JS、独立した状態処理を配置。
- 練習中のスピーカー・波形・口パクは既存の実際のRiveファイル `animations/practice-timing.riv` を再利用。スピーカー本体は振動させない。
- 寝顔・寝具・朝の色・ティナの移動・結果画面はHTML/CSSで重ねる構成。場面6全体を収めた新規 `.riv` は作成していない。
- 既存の `Frank_mouth_close.png` を `frank-awake.png` として使用。
- 寝顔は下記の内蔵画像生成で、同じフランケンくんの目を閉じた差分を作成。最終素材は `website/static/practice-sleep/frank-sleep.png`（1024×1536、透過PNG）。
- ティナは既存の `website/static/brand/tina-480.webp` を使用。新しい別人の素材には差し替えていない。
- 生成ビルドにデモHTMLと上記2枚のPNGのコピーを追加。

### 寝顔素材の生成記録

実行モード：内蔵 `image_gen`（CLI・外部APIキー未使用）。元画像を参照した編集。最終採用は2回目の結果。

初回プロンプト:

> Use case: precise-object-edit. Asset: transparent character sprite for the FrankenDojo website sleep animation. Edit the attached original Frank_mouth_close.png: change ONLY the visible eye to a peacefully closed eye, with one clean curved dark eyelid line, matching the original cartoon drawing. Keep mouth gently closed. Preserve exactly the orange-haired orange-skinned boy's identity, spiky hair silhouette, face outline, cheek white outline, metal stitch beside ear, black school uniform, body pose facing right, size and framing. Do not add pillow, bed, stars, text, shadows or other objects. Keep the same 1024x1536 portrait composition, full existing silhouette and genuinely transparent background. This is a single sleeping eye expression variant for a sprite swap, not a new illustration.

透過境界の調整プロンプト:

> Remove ONLY the orange glow / halo / shadow surrounding this sleeping character. Outside the hard character silhouette must be fully transparent (alpha 0), with no colored background or translucent glow. Keep all artwork inside the silhouette, closed eye, colors, framing and dimensions unchanged. Transparent isolated sprite for animation.

## 検証

- Nodeの状態処理テスト：発話時間だけの加算と無発話リセット、1/3/5分の停止、上限60分、停止後の値の固定、朝になるまで結果なし、発話0秒、初期化。
- ホーム内で開始→眠る→静かな停止→朝の結果を操作。停止直後は結果非表示であること、一時停止中は待ち時間が増えないことを確認。
- デスクトップと390px幅で表示・操作を確認。場面6の実行エラーなし。
- キャッシュ済みの教材を使ってローカルプレビューを更新。従来からの教材A1-49の注釈パース問題は変更対象外で、全体の本番ビルド成功を確認したものではない。公開サイトへの反映は行っていない。
