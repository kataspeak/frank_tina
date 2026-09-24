# 画像棚卸し・採用対応の確認

確認日: 2026-09-12。原画像は一切改名・変更していません。

- `images/`以下のPNG: **201件**（OLDを含む）。
- 採用対象: **A1・A2の120話に各1件**。採用先重複・欠損なし。
- 同じIDの候補が複数あるもの: **39 ID**。現行画像とOLDの候補を機械的に先頭選択していません。
- 対象外レベルのIDを持つ画像: **6件**。今回の配信に含めません。
- 話IDを持たない衣装・Champion等: **13件**。今回の配信に含めません。
- 採用120枚は全体をコンタクトシートで実見。日英altを個別に作成。
- 原本ファイルに対するcwebp変換は採用120枚で成功。全PNGの形式検証は `full-image-audit.json` に記録。
- 配信は480・960・1440px幅のWebP計360件。原寸PNGは配信先にコピーしません。

## ファイル名と内容のずれを補正した15話

以下は既存ファイル名を信用して自動決定した対応ではなく、実際の絵と現行台本の場面・台詞を照合した採用です。`content/images.json`に元ID、採用理由、実見時ハッシュを保持しています。

| 掲載する話 | 採用した既存画像 | 内容の一致 |
|---|---|---|
| A2-23 Asking Neighbors | `images/A2-24_Crush_Update.png` | アパートの廊下で、ルールの冊子を持つフランクが隣人と話す。 |
| A2-24 Crush Update | `images/A2-26_Lost_My_Phone.png` | カフェでスマホの一覧をフランクに見せながら喜ぶティナ。 |
| A2-25 Travel Insurance | `images/A2-28_Moms_Calling.png` | 保険のオフィスで、書類とマーカーを前に担当者と話すフランクとティナ。 |
| A2-26 Lost My Phone | `images/A2-25_Travel_Insurance.png` | カフェでクラウドのマークを映すパソコンと、空を見上げるティナ。 |
| A2-28 Mom's Calling | `images/A2-23_Asking_Neighbors.png` | 勉強道具を広げたテーブルで、スマホ越しに母と話すティナとフランク。 |
| A2-30 Asking for Refund | `images/A2-34_Workplace_Training.png` | 電気製品の店で、ティナが小型機器を店員に見せ、フランクは工具を持つ。 |
| A2-31 TikTok Famous | `images/A2-30_Asking_for_Refund.png` | 磁石の動画と反応が映るスマホをフランクが掲げ、ティナが喜ぶ。 |
| A2-32 Changing Reservation | `images/A2-33_Roommate_Problems.png` | 座席図を前に電話するフランクと、デザートを思い描くティナ。 |
| A2-33 Roommate Problems | `images/A2-38_Hangover.png` | カフェで皿と家事の一覧表を持つフランクに、ティナが話す。 |
| A2-34 Workplace Training | `images/A2-32_Changing_Reservation.png` | 研修の場で、付箋だらけの冊子を開いて担当者と話すフランク。 |
| A2-36 Recommending a Book | `images/A2-31_TikTok_Famous.png` | カフェで本と書類を差し出すフランクと、ピンクのペンを持つティナ。 |
| A2-38 Hangover | `images/A2-39_Fixing_a_Bike.png` | ソファでサングラスをかけてぐったりするティナに、フランクが朝食を運ぶ。 |
| A2-39 Fixing a Bike | `images/A2-36_Recommending_a_Book.png` | 自転車店で記録ノートを開き、整備士と話すフランクとティナ。 |
| A2-46 Online Shopping Fails | `images/A2-48_Crying_at_Movies.png` | 部屋で大きすぎるジャケットを広げるティナと、同じ服を持つフランク。 |
| A2-48 Crying at Movies | `images/A2-46_Online_Shopping_Fails.png` | 映画館の通路で目元をぬぐうフランクと、隣に立つティナ。 |

## 確認状態

A1・A2の本文確認済みというユーザーの申告は尊重しています。今回追加した表現解説・日英alt・上記の画像対応についてはエージェントによる確認を記録し、本番用の最終編集承認を別の`editorialApproval`でpendingとして残しています。

旧版と範囲外の全ファイル一覧、39 IDの重複候補一覧、制作メモ2件の扱いは [source-audit.json](source-audit.json) にあります。B1・B2の台本は今回解析・改稿していません。

画像はファイル名より現行本文の出来事を優先して対応させました。将来原本を改稿した場合は、画像の対応と説明も再確認してください。
