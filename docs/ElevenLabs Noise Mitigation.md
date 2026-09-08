# **ElevenLabsにおける文末過渡的クリックノイズの音響的発生機序と体系的防止・除去プロトコル**

## **文末クリックノイズ（オーディオアーティファクト）の音響的・数理的発生機序**

ElevenLabsを用いた長編朗読やオーディオブック制作において、キャラクターの台詞やセンテンスの終端に発生する「プチッ」「ブツッ」という破裂音（クリックノイズやトランジェント・アーティファクト）は、単一の不具合ではなく、離散信号処理における境界条件の破綻と深層学習ボコーダーの推論停止シーケンスの不完全性が複雑に交錯して発生する音響現象である1。  
デジタル音響信号において、音声ファイルが振幅ゼロ以外の電位（非ゼロ交差ポイント）を保ったまま急峻にデジタル無音または次ブロックの信号へと遷移すると、波形上に垂直の不連続ステップ（ヘビサイド階段関数状の電位変動）が生じる3。フーリエ解析の観点から、この急峻なステップ変化は周波数領域において無限大の帯域に広がる高周波インパルスを誘発し、人間の可聴域において広帯域のクリックノイズとして知覚される2。  
深層学習音声合成モデルの内部アーキテクチャにおいても固有の要因が存在する。ElevenLabsのニューラルボコーダーはテキストトークン系列と音響特徴量を照合しながら自己回帰的または拡散プロセスを経て波形を合成するが、文末の終了判定トークン（End-of-Sequence: EOS）に到達した際、発話の自然な減衰（調音器官の閉鎖運動や室内残響の減衰成分）を完結させる前に演算を早期打ち切り（トランケーション）する挙動が確認されている1。これにより、語尾の子音や母音の減衰波形が不自然に切断され、急峻な波形エッジが形成される1。  
音声境界における音素と休止記号の相互作用もこの現象を助長する。摩擦音や破擦音（/s/ や /z/ などの歯擦音）の直後に三点リーダー（...）などの休止記号が配置された場合、韻律制御モジュールが時間軸方向の滑らかな補間処理に失敗し、境界部分に不自然な高周波エネルギーの塊やファントム音素を挿入してしまう事例が報告されている9。さらに、カスタム音声クローニング（Instant Voice Clone / Professional Voice Clone）を使用している環境では、学習用音声データセット内に含まれていた暗騒音、暗流DCオフセット、あるいは元の編集点に存在したクリック音が、類似度アルゴリズムによって過剰に増幅され、文末のアーティファクトとして再構成される傾向が確認されている10。

## **スクリプト設計による生成時ノイズ抑止**

音声生成プロセスの段階で末尾ノイズの混入を未然に防ぐためには、スクリプトの表記方法を調整し、ニューラルモデルに対して十分な減衰時間と明確な終端境界を与えるアプローチが有効である7。  
実務上きわめて効果的な手法として定着しているのが、発話末尾に意図的なダミー語句を配置するパディング（Padding）処理である1。モデルが文末の終了判定時に過渡ノイズを発生させる傾向を持つ場合、本来のセリフの後に改行を挟んで不要な短い単語（例：ピリオド付きの「end.」や「stop.」）を追記して合成を実行する7。この措置により、モデルが引き起こす切断アーティファクトや急激な電位降下はすべてダミー語句側に転嫁され、本来意図したセリフ本体の音響的テールは完全な状態で保持される1。  
文末の記号選定においても注意が求められる。余韻や沈黙を演出するために三点リーダー（… や ...）を多用すると、モデルによっては低周波のハミングやノイズの延長、あるいは突発的な音割れを誘発する確率が高まる6。安定した発話終端を形成するためには、前後に半角スペースを設けたエフダッシュ（—）や、明確な終止符（.）を採用し、記号の末尾にも半角スペースを1〜2文字付与することが推奨される9。これにより、トークナイザーが文末境界を明瞭に認識し、過渡的な波形圧縮歪みを回避することが可能となる13。

| 構文・記法 | 対象モデル | 作用機序 | 具体的入力例 |
| :---- | :---- | :---- | :---- |
| **パディング（捨て文字付加）** | 全モデル共通 | 終了トークンに伴う切断ノイズを余剰領域に追いやる1。 | 「そこを動かないで！」 end. |
| **SSML Breakタグ** | Multilingual v2 / Flash系列 | ミリ秒単位の明示的な休止を付与し、ゼロ振幅への自然な遷移を促す15。 | 「そこを動かないで！」\<break time="0.5s" /\> |
| **Audio Tags** | Eleven v3 | 演技・休止の文脈指示により、末尾の急峻な切断を抑制する15。 | 「そこを動かないで！」\[pause\] |
| **終止符＋末尾スペース** | 全モデル共通 | 歯擦音等の直後における韻律平滑化エラーを防止する9。 | 「そこを動かないで。」 （末尾にスペース） |

## **音声モデル特性とパラメータ設計の最適化**

ElevenLabsの「Voice Settings（音声設定）」画面に配置された各パラメータは、モデルの潜在空間内における探索範囲と決定論的挙動の度合いを制御しており、その設定バランスはアーティファクトの発生率に直結する10。

| 設定項目 | 推奨レンジ | 音響信号・潜在空間に対する作用 | ノイズ抑制の観点における挙動 |
| :---- | :---- | :---- | :---- |
| **Stability（安定性）** | **0.60 〜 0.80** | 音声波形の時間的連続性とピッチ変動の分散を制限する20。 | 0.40未満では表現力が高まる反面、文末の波形崩壊や過渡ノイズが増加する。数値を引き上げることで安定した減衰が得られる10。 |
| **Clarity / Similarity** | **0.70 〜 0.75** | 生成音声を学習元話者の特徴量分布へ拘束する強度を調整する20。 | 最大値（1.00付近）では元データに欠落した音素を無理に再現しようとして破綻を招く。適度に緩和することで滑らかな補間が働く20。 |
| **Style Exaggeration** | **0%（厳守）** | スタイル誇張によるダイナミクスと感情表現を増幅する10。 | わずかでも引き上げると、予期せぬ息継ぎノイズや語尾のクリッピング、速度の不安定化を招くため、原則として完全無効化する10。 |
| **Speaker Boost** | **OFF（ノイズ時）** | 話者の音響的存在感を高めるエンハンス処理を実行する10。 | クローン元に含まれる暗騒音や極小のリップノイズまで過剰にブーストして文末クリック化させるリスクがあり、問題発生時は停止が推奨される10。 |

モデル選定の観点では、オーディオブック制作において予測可能性と整合性を最優先する場合、Multilingual v2モデルが適している22。Multilingual v2はSSML Break構文をサポートしており、長文朗読時における急峻な文末クリップ現象が比較的少ない安定性を備えている15。  
一方、最新のEleven v3モデルは感情表現やキャラクターの演じ分けにおいて優れたダイナミクスを発揮する反面、文末における単語のドロップアウトや、破裂音・過渡クリックを伴う急激なトランケーションが散発的に発生しやすい傾向が確認されている1。したがって、表現力の観点からEleven v3を採用する場合には、前述したスクリプト側でのパディングや後述する波形編集処理の併用が実質的な必須要件となる1。

## **ポストプロダクション工程における信号処理とノイズ除去**

生成された音声ファイルに混入したクリックノイズに対しては、デジタル・オーディオ・ワークステーション（DAW）や波形修復ソフトウェアを用いた信号処理により、音声品質を劣化させることなく除去することが可能である3。  
波形終端が非ゼロ交差によって切断されている場合、最も基礎的かつ透明性の高い修復手法はゼロクロス点でのトリミングとマイクロフェードアウトの適用である3。波形編集ソフトウェア上で「Snap to Zero-Crossings」を有効化して振幅がゼロを通過する位置で余剰データを切除した上で、セリフ終端の5 msから30 ms程度の区間にS字カーブ（S-Curve）または対数特性のフェードアウト処理を施す3。これにより、周波数領域における広帯域インパルスが完全に無効化され、自然な無音へと着地する3。  
ノイズが文末の子音成分（無声破裂音や摩擦音など）と時間軸上で重なり合っている場合、単純なフェードアウトでは言語音の輪郭を削り取ってしまう危険がある2。このケースでは、iZotope RXに代表されるスペクトラル修復ツールが威力を発揮する23。スペクトログラム上で垂直方向に鋭く立ち上がるインパルス成分を検出し、前後の正常な調和波およびフォルマント構造から時間・周波数空間の双方向で補間計算（インペインティング）を行うことで、明瞭度を完全に保ったまま過渡ノイズのみを物理的に消去できる2。  
長編オーディオブックでは数千単位の音声セグメントを結合する必要があるため、手動作業による修正は生産性のボトルネックとなる4。これに対しては、Audacityの「Macro Manager」を用いたバッチ処理や、FFmpegを用いた自動スクリプトが実用的な解決策となる4。各セグメントの末尾数十ミリ秒に対して自動的にフェードアウトを適用し、直流分を除去するハイパスフィルター（20 Hz前後）を通過させた上で一括書き出しを行うパイプラインを構築することで、結合時における全ブロック間のクリックノイズを網羅的に遮断できる4。

| 手法 | 推奨ツール | 処理対象ノイズ | 処理速度・自動化適性 | 音響的保全性 |
| :---- | :---- | :---- | :---- | :---- |
| **マイクロフェードアウト** | Audacity, Reaper, Pro Tools3 | 終端の直流断絶・非ゼロ交差クリック4 | 高（バッチマクロや自動化スクリプトで即時処理可能）4 | 極めて高い（語尾の減衰区間外であれば音質変化なし）4 |
| **スペクトラルリペア / De-click** | iZotope RX, Steinberg SpectraLayers23 | 語尾の子音・息音と重層した突発性過渡ノイズ2 | 中（スタンドアロンでのバッチ処理または手動選択）23 | 最高（周波数空間での精密補間により原音を維持）23 |
| **コマンドライン一括整流** | FFmpeg (afade, highpass)5 | 結合前の中間ブロック末尾における微小ステップ5 | 最高（数百トラックを一括非対話処理）27 | 高（一律処理のためミリ秒設計の事前検証が必須）5 |

## **オーディオブック制作におけるエンドツーエンド推奨ワークフロー**

ElevenLabsを用いた商用オーディオブック制作における品質管理では、生成環境の制御からポストプロダクションの結合工程までを一連のパイプラインとして標準化することが要求される6。  
プリプロダクション段階では、テキストのチャンク設計が最も重要な基盤となる。長大な原稿を一度に処理させると内部アテンションのコンテキスト長超過に伴い音声品質のドリフトや末尾アーティファクトが指数関数的に増大するため、Studio（旧Projects）を用いて原稿を段落単位、あるいは1ブロックあたり800文字以下に構造化してインポートする10。同時に、文末の句読点を点検し、歯擦音直後の不自然な三点リーダーを排除してピリオドやダッシュへ正規化を完了させる9。  
プロダクション段階においては、Voice SettingsのStabilityを0.65〜0.75、Similarityを0.70〜0.75に設定し、Style Exaggerationを完全にゼロへ固定した上でブロック生成を実行する10。Studioのタイムライン上で段落間に急激な呼吸音や過渡ノイズ（パラグラフ間グリッチ）が検知された場合、公式トラブルシューティングの指針に則り、当該ブロックのみならず**その直前のブロックも同時に再生成（リロール）** を実施する10。前段ブロックの終了コンテキストの乱れが次段の立ち上がりに歪みを波及させている事例が多いためである10。  
ポストプロダクション段階では、Studioから直接マスターを作成するのではなく、トラック単位またはチャプター単位で高品質な非圧縮WAV形式にてエクスポートを行う26。書き出されたセグメントファイル群に対しては、DAWへの配置前にFFmpegまたはAudacityマクロを用いて末尾15 msのマイクロフェード処理を一括適用し、境界における非ゼロ交差クリックを機械的に排除する4。  
最終アセンブリでは、マルチトラック環境上に各キャラクターおよびナレーションのクリップを配置し、文脈に応じたポーズ長（標準的な会話間隔や文末ポーズ）をミリ秒単位でレイアウトする30。全編トラックのマスターバスには20 Hzから30 HzのハイパスフィルターとiZotope RX等のDe-clickプラグインをインサートし、可聴域外の直流オフセットや微小な過渡成分を包括的にトリートメントした上で、主要オーディオブック配信プラットフォーム（Audible/ACX基準等）が定めるRMSレベル（-23 dB〜-18 dB）およびトゥルーピーク値（-3 dB以下）に合致するようマスタリングを完結させる5。

#### **引用文献**

> 1. Sentences start distorted, truncate with artifacts, almost every time, [https://www.reddit.com/r/ElevenLabs/comments/1u5gm0p/sentences\_start\_distorted\_truncate\_with\_artifacts/](https://www.reddit.com/r/ElevenLabs/comments/1u5gm0p/sentences_start_distorted_truncate_with_artifacts/)  
> 2. Audio Quality Check \- Detect Noise, Glitches, Clipping & Silence, [https://ttsaudit.com/checks/audio-quality](https://ttsaudit.com/checks/audio-quality)  
> 3. How to Trim Audio File on Audacity \- Swell AI, [https://www.swellai.com/blog/how-to-trim-audio-file-on-audacity](https://www.swellai.com/blog/how-to-trim-audio-file-on-audacity)  
> 4. Exporting drum samples (Edison) \- Low volume, clicks | Forum, [https://forum.image-line.com/viewtopic.php?t=277263](https://forum.image-line.com/viewtopic.php?t=277263)  
> 5. benchflow-ai/text-to-speech \- Decision Hub, [https://hub.decision.ai/skills/benchflow-ai/text-to-speech](https://hub.decision.ai/skills/benchflow-ai/text-to-speech)  
> 6. Alias TTS: the audio was never the hard part \- SuperGeekery, [https://supergeekery.com/blog/alias-tts-the-audio-was-never-the-hard-part](https://supergeekery.com/blog/alias-tts-the-audio-was-never-the-hard-part)  
> 7. I'm using Text to Speech (V3) and the last word of almost all ... \- Reddit, [https://www.reddit.com/r/ElevenLabs/comments/1lguvzn/im\_using\_text\_to\_speech\_v3\_and\_the\_last\_word\_of/](https://www.reddit.com/r/ElevenLabs/comments/1lguvzn/im_using_text_to_speech_v3_and_the_last_word_of/)  
> 8. V3 Issues : r/ElevenLabs \- Reddit, [https://www.reddit.com/r/ElevenLabs/comments/1r8g8ea/v3\_issues/](https://www.reddit.com/r/ElevenLabs/comments/1r8g8ea/v3_issues/)  
> 9. ElevenLabs generates a phantom syllable artifact before words that, [https://agents.stackoverflow.com/tils/ca620798-8ea4-4ea5-ad6a-37d6eb354081?tag=python\&page=7](https://agents.stackoverflow.com/tils/ca620798-8ea4-4ea5-ad6a-37d6eb354081?tag=python&page=7)  
> 10. Troubleshooting | ElevenLabs Documentation, [https://elevenlabs.io/docs/eleven-creative/troubleshooting](https://elevenlabs.io/docs/eleven-creative/troubleshooting)  
> 11. ElevenLabs で Instant Voice Cloning を試す｜npaka \- note, [https://note.com/npaka/n/n56340fdf0e1c](https://note.com/npaka/n/n56340fdf0e1c)  
> 12. ElevenLabsのTTSを試す \- Zenn, [https://zenn.dev/kun432/scraps/56061597330096](https://zenn.dev/kun432/scraps/56061597330096)  
> 13. Integrate your own model | ElevenLabs Documentation, [https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm](https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm)  
> 14. audio cutting off short, loosing my mind lol : r/ElevenLabs \- Reddit, [https://www.reddit.com/r/ElevenLabs/comments/1kpfqkl/audio\_cutting\_off\_short\_loosing\_my\_mind\_lol/](https://www.reddit.com/r/ElevenLabs/comments/1kpfqkl/audio_cutting_off_short_loosing_my_mind_lol/)  
> 15. How can I add pauses? \- ElevenLabs, [https://help.elevenlabs.io/hc/en-us/articles/13416374683665-How-can-I-add-pauses](https://help.elevenlabs.io/hc/en-us/articles/13416374683665-How-can-I-add-pauses)  
> 16. On Text Markup For the ElevenLabs v3 Text-to-Speech \- Medium, [https://medium.com/@v-jur-kh/on-text-markup-for-the-elevenlabs-v3-text-to-speech-2b0a330110e1](https://medium.com/@v-jur-kh/on-text-markup-for-the-elevenlabs-v3-text-to-speech-2b0a330110e1)  
> 17. Best practices | ElevenLabs Documentation, [https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)  
> 18. How can I add pauses? | ElevenLabs Documentation, [https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-can-i-add-pauses](https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-can-i-add-pauses)  
> 19. How To Add Pauses In ElevenLabs \- YouTube, [https://www.youtube.com/watch?v=Ld0-Ihw0Ja0](https://www.youtube.com/watch?v=Ld0-Ihw0Ja0)  
> 20. Unwanted artifacts : r/ElevenLabs \- Reddit, [https://www.reddit.com/r/ElevenLabs/comments/1fxczwq/unwanted\_artifacts/](https://www.reddit.com/r/ElevenLabs/comments/1fxczwq/unwanted_artifacts/)  
> 21. ElevenLabs in GPTunneL: Voiceover and Sound Effects, [https://www.gptunnel.ru/en/guide/elevenlabs](https://www.gptunnel.ru/en/guide/elevenlabs)  
> 22. What are some issues I might encounter and how can I avoid them?, [https://help.elevenlabs.io/hc/en-us/articles/16102244695185-What-are-some-issues-I-might-encounter-and-how-can-I-avoid-them](https://help.elevenlabs.io/hc/en-us/articles/16102244695185-What-are-some-issues-I-might-encounter-and-how-can-I-avoid-them)  
> 23. Best AI Noise Removal Tools (2026) \- Dupple, [https://dupple.com/learn/best-ai-noise-removal-tools](https://dupple.com/learn/best-ai-noise-removal-tools)  
> 24. Resolve Voice Overlap and Cut-Off Issues in ElevenLabs, [https://prosperasoft.com/blog/voice-synthesis/elevenlabs/elevenlabs-voice-overlap-cutoff/](https://prosperasoft.com/blog/voice-synthesis/elevenlabs/elevenlabs-voice-overlap-cutoff/)  
> 25. Audacity: Free, Cross-Platform Audio Editor and Recorder. · GitHub, [https://github.com/gcode-mirror/audacity](https://github.com/gcode-mirror/audacity)  
> 26. Process on soundfont creation \- Sound Fonts \- The Crucible, [https://crucible.hubbe.net/t/process-on-soundfont-creation/296](https://crucible.hubbe.net/t/process-on-soundfont-creation/296)  
> 27. Fade-in and out multiple times within the same audio file \- Transloadit, [https://transloadit.com/demos/audio-encoding/fade-in-out-audio-ffmpeg-timeline/](https://transloadit.com/demos/audio-encoding/fade-in-out-audio-ffmpeg-timeline/)  
> 28. Clicking sounds/artifacts in rendered video : r/kdenlive \- Reddit, [https://www.reddit.com/r/kdenlive/comments/14g4gp3/clicking\_soundsartifacts\_in\_rendered\_video/](https://www.reddit.com/r/kdenlive/comments/14g4gp3/clicking_soundsartifacts_in_rendered_video/)  
> 29. Sox: concatenate multiple audio files without a gap in between, [https://stackoverflow.com/questions/25280958/sox-concatenate-multiple-audio-files-without-a-gap-in-between](https://stackoverflow.com/questions/25280958/sox-concatenate-multiple-audio-files-without-a-gap-in-between)  
> 30. How to Use ElevenLabs Projects Feature for Audiobooks \- tinofast.com, [https://tinofast.com/how-to-use-elevenlabs-projects-feature-for-audiobooks/](https://tinofast.com/how-to-use-elevenlabs-projects-feature-for-audiobooks/)  
> 31. Script to Voice Generator — ElevenLabs V3 TTS \- GitHub, [https://github.com/ReactorcoreGames/Script-to-Voice-Generator-11Labs](https://github.com/ReactorcoreGames/Script-to-Voice-Generator-11Labs)  
> 32. Audiobooks | ElevenLabs Documentation, [https://elevenlabs.io/docs/eleven-creative/products/audiobooks](https://elevenlabs.io/docs/eleven-creative/products/audiobooks)  
> 33. How to create long pauses with a duration around 10-20 second?, [https://www.reddit.com/r/ElevenLabs/comments/1s70mwx/how\_to\_create\_long\_pauses\_with\_a\_duration\_around/](https://www.reddit.com/r/ElevenLabs/comments/1s70mwx/how_to_create_long_pauses_with_a_duration_around/)