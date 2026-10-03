# 機能説明の制作メモ（2026-09-27）

サイトの説明・デモは `content/features.json` に集約した。FrankenDojoの現行コードとテストを優先し、`docs/AppSpec.md`、`docs/sleep_practice.md` と照合した。アプリ側のファイルは変更していない。下記の参照先は制作時の根拠であり、サイト生成時には読み込まない。

参照ルート：`/Users/Yoshio/StudioProjects/FrankenDojo/`。参照ファイルのSHA-256は ローカルの `reports/redesign-2026-09-27/app-reference.json`（Git管理対象外） に保存。アプリのテストは内容を参照したもので、今回Flutterテストや実機テストを実行したという意味ではない。

| ページ | 採用した説明 | 現行コード・テスト（参照ルートからの相対パス） |
|---|---|---|
| shadowing | 無発話は同じ模範を再生。模範・発話終了後は次の予定試行へ。メニュー完了で次フレーズ | `lib/domain/lesson/usecases/start_lesson_practice_usecase.dart`（シャドーイング実行・noSpeech処理）、`test/domain/lesson/usecases/start_lesson_practice_usecase_test.dart`（331行〜速度メニュー完走、837行〜無発話再生、1301行〜未達でも進行） |
| repeating | フレーズ／チャンク。模範→想起→発話。全チャンクで1セット | 同usecaseのリピーティング処理、同テスト1329行〜全チャンク完了で1回、`lib/domain/lesson/value_objects/practice_settings.dart` |
| speech-detection | 発話と無音で終了を判断。模範完了・内部ポーズ・速度を考慮。発音採点ではない | `lib/domain/lesson/services/phrase_endpoint_detector.dart`、`test/domain/lesson/services/phrase_endpoint_detector_test.dart`、`lib/domain/settings/value_objects/phrase_endpoint_settings.dart` |
| difficulty-speed | 手動で設定した難易度に応じ、シャドーイングの速度メニューを選択 | `lib/application/app_state/app_state_signals.dart` 24〜50行、391〜486行、`lib/domain/lesson/value_objects/practice_settings.dart` |
| difficulty-repeat | 初期値1・2・3セット。1〜10で設定、アプリの保存時は簡単≦普通≦困難。進行とランク加算は別 | `lib/domain/settings/value_objects/repeat_settings.dart`、上記usecase／テスト |
| lesson-selection | studyingだけをコースの連続練習・リピート・シャッフルへ含める | `lib/presentation/course/playback/viewmodels/course_playback_viewmodel.dart` 142〜160行・219行〜、`test/presentation/course/playback/viewmodels/course_playback_viewmodel_test.dart` |
| sleep-stop | iOS・Android。最大期限または発話受付区間の無発話で静かに停止。翌朝は発話時間（推定） | `lib/domain/sleep_practice/entities/sleep_practice_session.dart`、`lib/domain/sleep_practice/usecases/sleep_practice_usecase.dart`、`lib/presentation/sleep_practice/sleep_practice_viewmodel.dart`、`lib/application/sleep_practice/sleep_practice_stopper.dart`、`test/domain/sleep_practice/sleep_practice_usecase_test.dart`、`test/application/sleep_practice/sleep_practice_stopper_test.dart` |
| own-materials | スマホ版で取り込み→解析→区切りを確認・編集→練習。下書きは確認完了まで練習へ反映しない | `docs/course_authoring_flow.md`、`lib/domain/lesson/services/lesson_editor_service.dart`、`lib/presentation/lesson/edit/`、`lib/presentation/course/creation/` |

## 数値・用語の根拠

- シャドーイング：簡単 `[1.0]`、普通 `[0.8, 0.8, 1.0]`、困難 `[0.6, 0.6, 0.6, 0.8, 0.8, 1.0]`。最大6枠、最低1枠を有効にし、0.5〜1.0倍を0.1刻みで設定する。`app_state_signals.dart` の定数・正規化と照合した。
- リピーティング：フレーズ／チャンク共通の `repeatingSpeed` は0.5〜1.0倍、初期1.0倍。シャドーイングの難易度別速度メニューと区別した。デモの回数セレクトは選択中の難易度のセット数を試す説明用で、アプリ設定は保存しない。
- 想起タイム：`lesson_playback_viewmodel.dart` 4572〜4625行の `playSilenceClip`／停止条件を確認。発話待ちのピンクノイズを説明し、「常に完全な無音」は使わない。初期音量0.01は実装上の設定値で、サイト上では音を再生しない。
- 発話終了：`phrase_endpoint_detector.dart` は発話量の成立判定と終了タイミングを独立に扱う。基本待ち時間500ms、設定範囲500〜5,000ms。リピーティングは内部ポーズを再生速度で換算し、余裕時間を加える。発話量の70%条件はランク加算等の成立判定であり、「正しく発音するまで進まない」とは説明しない。
- スリープ：最大15・30・60・90分、無発話1・3・5分、初期60分・3分。入力受付対象外の時間は無発話に含めず、最大期限は進む。テストの「お手本・切替など入力対象外の時間」「一時停止しても最大期限を延長しない」と照合。睡眠状態・就寝時刻の検知とは説明しない。
- スリープの対応環境：ViewModelの `!kIsWeb` とiOS／Android判定を根拠に表示。実機受け入れ確認の完了やストア公開は、この制作作業では保証・変更していない。

## 参照資料から修正した表現

`ref_web.md` の「言い終えると次のフレーズへ」は、速度メニュー内の次試行と次フレーズを区別した。「無音の想起タイム」はピンクノイズを含む「思い出す時間」に改め、「就寝を検知」は発話受付中の無発話／最大時間による停止へ改めた。指定の4コピーは原文のまま保持した。

旧い移植指示・広告表現より上記コードとテストを優先した。`AppSpec.md` とスリープ仕様は対応環境・用語・運用の補助資料として照合した。現行コードにある未達時の進行と、成立時だけの有効練習記録を混同していない。

## サイト内の実装

- `scripts/marketing.py`：トップと8詳細の共通テンプレート。静的説明はJavaScriptなしでも表示。
- `static/marketing.js`：説明用の状態遷移。自動デモは画面内に入ってから1巡し、停止／再実行／ステップ送りが可能。減速設定では自動再生しない。マイク取得・録音・音源アップロードなし。
- HOME復帰：通常クリック時にタブ内へ位置・フォーカス・幅・トークンを保存。明示的な戻りトークンと履歴エントリに限り復元。幅変更・保存不可・直接アクセスでは機能アンカーへ戻る。通常訪問は過去の保存位置を参照しない。
- ストアCTA：`config.json` の公開状態と確認済みURLを既存ビルド検証で確認した場合だけ実リンクを生成。現状は「提供準備中」と公開案内。
- 画像120件：同じ採用ファイルの移動後パスへ修正。既存 `reviewedSha256` と完全一致するファイルだけを採用した。元画像の選択・alt・焦点位置は維持。
- 提供素材5種：透明部分を保持して480／960pxのWebPへ変換。出典とSHA-256は `content/brand-assets.json`。配信対象は拡張子許可リストで選び、`.DS_Store` を含めない。
- Poppins 800、Noto Sans JP 400／700：Google Fontsの公式配信から制作時に取得したWOFF2とOFLを同梱。日本語は文字範囲別の59ファイル×2ウェイトを使用し、宣言された範囲でサイト内の全かな・漢字をカバーすることを検証した。実行時の外部通信・アプリ側のソース参照は不要。
