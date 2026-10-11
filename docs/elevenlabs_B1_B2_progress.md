# ElevenLabs B1・B2 制作進捗（2026-10-11）

対象：`skits/skits_B1_dialogs_jp.md`、`skits/skits_B2_dialogs_jp.md`各60話。手順：`docs/skit_to_voice.md`。

## 準備

- `build/elevenlabs_B1_B2/`に120個のspeaker,line形式CSVと`manifest.json`を作成。ナレーション込み1,678段落。台詞番号の連続性とCSVの再読み込み一致を確認。
- SFXはCSVから除外し、7箇所の挿入位置をmanifestに記録。B1-56のFrank and Tinaは同時発話として別途処理が必要。
- 配役表のCrisis at Workは旧番号B1-01。現行本文のB1-02とタイトル・Priyaの役名で照合し、US-F1を指定。ナレーターの男女は現行IDの奇数・偶数で決定。
- 台本の正本とローカル音声は変更していない。

## 登録状況

| 話 | 作成先 | 状態 |
|---|---|---|
| B1-01 Quarter-Life Crisis | [ElevenLabs](https://elevenlabs.io/app/studio/df4DlsvKtVE857BdpGOF) | 作成済み。Eleven v4、NarratorMale 1段落、Tina 7台詞、Frank 6台詞を照合。会話13段落のテキスト強化を実行。角括弧タグの追加はなく句読点を強化。ユーザー指示に従い強化後の表記を保持し、台詞3を再生成。1:08 / 1:08、再生停止・生成中表示消失を確認。 |

| B1-02 Crisis at Work | [ElevenLabs](https://elevenlabs.io/app/studio/EuNq2WgXZb1yXMWg0nMe) | 登録・会話13段落の強化済み。NarratorFemale 1、US-F1（Priya）7、Frank 6、Eleven v4。1:10 / 1:10、再生停止・生成中表示消失を確認。 |

B1-03〜B1-60、B2-01〜B2-60はCSV準備済み・未登録。

2026-10-11のユーザー指示：Eleven v4のテキスト強化は主に大文字・句読点による。強化後の文章変更は不要。


## 中断理由と再開位置

ElevenLabsに「Failed to fetch」の通知が複数表示された。B1-03作成のためStudio一覧へ移動すると、サイドバーのみで本文・新規登録操作が表示されなくなった。再読み込み、オーディオブック画面経由の開き直し、既知のインポートURLへの移動でも復旧しなかった。

登録・全編生成確認済み：2/120話。残り118話は未登録。復旧後はB1-03から再開し、B1-01とB1-02の重複作成を避ける。

完了確認は画面上の生成状態と末尾への再生到達による。音声を聴いての品質評価とローカルへの音声書き出しは未実施。

B1-02の完了画面：`build/elevenlabs_B1_B2/B1-02-complete.jpg`。


## 再接続試行（2026-10-11 21:32 JST）

ユーザーの再開指示により再読み込みと新しいタブでの接続を試行。画面に「Failed to connect to the backend」が表示され、接続診断の操作後には「Application error: a client-side exception has occurred」が表示された。新規登録画面を利用できず、追加登録・音声生成は0話。再開位置はB1-03、残り118話のまま。

B1・B2本文のSHA-256がCSV準備時と一致することを確認。再接続エラー画面を`build/elevenlabs_B1_B2/reconnect-error.jpg`に保存。


## 接続復旧後の再開

ユーザーが開いた既存のStudioタブでは一覧が正常表示された。B1-03 After the Lectureを[作成](https://elevenlabs.io/app/studio/ESbftnjGPRa0qh9V2Ei4)。Eleven v4、NarratorMale 1段落・Frank 7台詞・Tina 6台詞を照合。会話13段落のテキスト強化済み。1:20 / 1:20、再生停止・生成中表示消失を確認。B1-03完了。

現時点の完了は3/120話。次はB1-04、残り117話。

- B1-04 I Wish I Had Studied: 登録・配役・会話13段落の強化・全編生成完了。1:05 / 1:05で停止を確認。タイトル保存は再試行で成功。https://elevenlabs.io/app/studio/UZOXn8u8kUmii9MIGBbE
- 完了4/120話。次はB1-05、残り116話。

- B1-05 Tech Support Call: 登録・配役・会話13段落の強化・全編生成完了。1:12 / 1:12で停止を確認。ナレーション直後に2秒の無音（Multilingual v2）を追加。通信エラー発生時は途中から再開した。https://elevenlabs.io/app/studio/k60NDcgm5xBRwJm1hmSr
- 完了5/120話。次はB1-06、残り115話。

- B1-06 Failing Adulting: 登録・配役・会話13段落強化・全編生成完了。1:03 / 1:03で停止を確認。https://elevenlabs.io/app/studio/fd3JZxfLonNFeC9KlTgH
- 完了6/120話。次はB1-07、残り114話。

- B1-07 Visa Application: 登録・配役・会話13段落強化・全編生成完了。1:14 / 1:14で停止を確認。https://elevenlabs.io/app/studio/Yhk2pyUy4figylbp0sry
- 完了7/120話。次はB1-08、残り113話。

- B1-08 Group Project Hell: 登録・配役・会話13段落強化・全編生成完了。1:08 / 1:08で停止を確認。作成・名前保存・生成で通信エラーが発生し、画面更新と再開で完了。https://elevenlabs.io/app/studio/8uiyaRtMRAffy3Eh9QrK
- 完了8/120話。次はB1-09、残り112話。

- B1-09はCSV取り込み・配役設定後、プロジェクト作成が完了せず配役画面に戻った。画面更新後にFailed to connect to the backendを確認。新規タブでもStudio本文を表示できない。B1-09は未完了として保持し、再開時は重複有無を確認する。
- Chrome切り替えのユーザー回答待ち。台本正本の変更なし。
