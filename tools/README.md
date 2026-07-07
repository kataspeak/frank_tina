# スキット音声化パイプライン（ElevenLabs）

`skits_*_dialogs_jp.md` → 台本JSON → ElevenLabs で行単位の mp3 を生成する2段構成。

## 手順

```bash
# 1. 台本抽出（全レベル）
for lv in A1 A2 B1 B2; do
  python3 tools/extract_skits.py skits_${lv}_dialogs_jp.md -o build/skits_${lv}.json
done

# 2. ボイス設定
#    tools/voices.json の REPLACE_WITH_... を実際の ElevenLabs voice_id に置き換える。
#    Frank=低め・落ち着き / Tina=高め・感情豊か / Narrator / 第三者用の男女フォールバック。

# 3. 音声生成（まず1〜2話で試すこと）
export ELEVENLABS_API_KEY=sk_...
pip install requests
python3 tools/synthesize.py build/skits_A1.json -o build/audio_A1 \
  --only A1-01 A1-02 --sfx
```

出力は `build/audio_A1/A1-01/01_Narrator.mp3 ...` と、行順・話者・英文・日本語訳を持つ
`manifest.json`。**1行=1ファイル**なので、アプリのフレーズ単位訓練にそのまま対応します。

## 設計メモ

- **演技指示 `[excited]` 等**: モデル `eleven_v3` の audio tags としてそのまま送信。
  v3 以外のモデルを使う場合は `--strip-tags` を付ける。
- **効果音 `[SFX: ...]`**: `--sfx` 指定時に Sound Effects API で別ファイル生成（全240話で27箇所）。
- **第三者話者**（Clerk, Dr. Chen など64種）: `voices.json` の `gender_hints` で男女の
  汎用ボイスに振り分け。特定話者に専用の声を当てたい場合は `voices` に追記するだけ。
  `Frank and Tina`（同時発話行）はフォールバックになるので、必要なら個別に生成・ミックス。
- **多言語展開**: 台本を翻訳した同形式の JSON を作れば、`--lang ko` / `--lang es` で
  同じボイス（cross-lingual）のまま韓国語・スペイン語版を生成できる。
- **料金・冪等性**: 生成済みファイルはスキップするので、途中失敗しても再実行で続きから。
  429/5xx は指数バックオフでリトライ。
- **アプリ搭載前の後処理**: VAD 判定用には、各 mp3 の先頭・末尾無音の正規化と
  ラウドネス統一（例: `ffmpeg -af silenceremove,loudnorm`）を推奨。
