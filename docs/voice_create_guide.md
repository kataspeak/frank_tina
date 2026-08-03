# ElevenLabs v3 で「感情表現を変えても声のアイデンティティがブレない」若い男性(米国英語)キャラクターボイスを作る実践ガイド



## Key Findings

### 1. なぜ v3 で声が変わるのか(根本原因)

- ElevenLabs v3 は v2 とは別アーキテクチャで、**表現力(audio tagによる感情制御、多言語)を最優先**に設計されている。公式 Help Center は v3 が **74言語**をサポートすると記載(公式 Models ドキュメントでは「70+ languages」と表記)。トレードオフとして声の忠実度(voice fidelity)が犠牲になり、cloneした声をv3に通すと「テキストの感情解釈」を「声の特徴への忠実さ」より優先するため、音色がドリフトする(inference.sh の実務レポート:「自分の声をcloneしてv3に通したら、同じ言葉・美しいデリバリーなのに"別人(a stranger)"が返ってきた」)。

  

### 2. Stability(v3では最重要スライダー)

- v3 公式ベストプラクティスの逐語:「**The stability slider is the most important setting in v3, controlling how closely the generated voice adheres to the original reference audio. Creative: More emotional and expressive, but prone to hallucinations. Natural: Closest to the original voice recording—balanced and neutral. Robust: Highly stable, but less responsive to directional prompts but consistent, similar to v2.**」
- **identity維持と表現の両立には Natural が既定の最適解**。Robust はタグ反応を抑制するため「タグを入れたのに何も起きない」原因になる。Moe Lueker 氏の V3 チュートリアルは逐語で:「There are three positions on the stability slider: Creative, Natural, and Robust… But Robust is essentially V2 behavior. It suppresses audio tag responsiveness.」と述べている。Creative は最大表現だがプロンプトエンジニアリングと複数回生成を要する。
- v3のStabilityは連続値ではなく **Creative / Natural / Robust の離散3値**(内部的に 0.0 / 0.5 / 1.0 に対応)として扱われる。

### 3. 感情タグ(audio tags)の設計と「行き過ぎ」の回避

- タグは角括弧のインライン記法: `[happy] [sad] [angry] [excited] [whispers] [shouts] [sighs] [laughs]` など。感情系・デリバリー系・非言語反応系・効果音系・実験系(`[strong X accent]` `[sings]` 等)に大別される。
- **公式の最重要注意点(逐語)**:「**The most important parameter for Eleven v3 is the voice you choose. It needs to be similar enough to the desired delivery. For example, if the voice is shouting and you use the audio tag [whispering], it likely won't work well.**」加えて「囁き声のvoiceが [shout] タグで急に叫べると期待してはいけない」。=voiceの素の性質から遠い極端なタグは、モデルが無理に外挿して音色・ピッチ・アクセントを崩す原因になる。
- **極端・多重タグの弊害**: 実験系タグ(特にアクセント指定 `[strong French accent]` 等)は「voiceによっては一貫して機能しない」。アクセントタグは声のアイデンティティを line 単位で切り替える設計思想であり、若い男性・米国英語の一貫キャラでは原則使わない(必要なら `[American accent]` 程度に留める)。
- **段階的な感情遷移**: Moe Lueker 氏の逐語:「Going directly from laughing to sad in one line can produce uneven output. Staging the transition, laughing, then wondering, then sad, gives the model a path to follow and produces more natural results.」急激な感情シフトはv2/v3とも「機械的に聞こえる」限界がある(TechSifted)。
- **句読点で強度を調整**: 大文字化=強調、`…`(省略記号)=間・重み、標準句読点=自然なリズム。CAPSは1文に1〜2語まで。Style Exaggerationを上げるほど長文でピッチ割れ(pitch break)の確率が上がる(AIVoiceLab)ため、v2併用時も控えめに。
- タグは「感情のピークと谷」にだけ置き、過剰タグ(over-tagging)を避ける。UI の「Enhance」ボタンはLLMでタグを自動付与するが、その内部プロンプトは「元テキストを一切変更せず、聴覚的なタグのみを付与」「`[standing]`のような非聴覚タグは使わない」と規定している。

### 4. Voice Design v3(テキストから声を作る)で若い男性・米国英語を作るコツ

- Voice Design v3 は 20〜1000文字のプロンプトから3案を生成し、1つを採用(採用しなかった2案は無料)。生成される声は **v3対応で audio tags も使える**。
- 公式の推奨プロンプト構造: **年齢・アクセント・トーン・ペーシング・音質を1文で**。年齢は数値でなく知覚年齢語(`young adult`)が安定。音質語(`perfect audio quality` / `studio-quality recording`)を必ず入れる。
- 若い男性・米国英語の実例プロンプト(実務ガイドで検証済とされるもの):
  - 「Perfect audio quality. Young adult American male, neutral accent, warm and clear, natural conversational pace. Friendly and approachable.」
  - 「30-year-old American male, neutral accent, crisp and engaging tone, moderate pacing, with the clarity of a professional audiobook narrator」
  - **否定指定**が有効:「confident but NOT aggressive, energetic but NOT shrill」のように「〜ではない」を入れると生成空間が狭まり、狙いに近づく。
- **preview text はプロンプトと矛盾させない**: 公式は「calm な声の説明に対し、怒鳴るような preview text を使うと矛盾を無理に調停して不自然・不安定になる」と警告。狙う感情トーンに沿った preview text を使い、長めの preview text の方が安定・表現豊か。
- **seed パラメータで再現性**: 同じ seed + 同じプロンプトで同じ声を再生成できる。プロンプトと共に seed を記録しておけば、後から同一キャラボイスを復元できる(プロダクションのバージョン管理に有効)。
- **Guidance Scale**: 低い=創造的自由、高い=プロンプト厳守。ただし「高いGuidance Scale + 曖昧なプロンプト」はロボット的になる。公式は「長く詳細なプロンプト + 低めGuidance Scale」を推奨。
- 保存後は基本特性は変えられないが、**Voice Remixing**で「10歳分年上に、少しgravellyに」等、核となる特徴を保持したまま属性だけ微調整でき、キャラの一貫性を保ちつつバリエーションを作れる。

## Recommendations(段階的アクションと切替基準)

1. **まず土台voiceを固定する(最優先)**。「best voices for V3」または Voice Design v3(seed記録)で若い米国男性ニュートラルを確定。ここが8割。

2. **Stability = Natural を既定**に。タグ反応が弱い→Creativeへ。逆に暴れる/別人化する→Robust寄り(ただしタグは効きにくくなる)。

3. **タグは最小限・段階的・非極端**。素の声から遠い感情は無理させない。アクセントタグは若い米国英語キャラでは原則封印。

   