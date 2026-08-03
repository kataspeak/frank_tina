# ElevenLabs 演技指定（Voice Style / Performance Instructions）統合ガイド

英会話スキット音源をElevenLabsで作成する際の、英語による演技指定のまとめ。
4つの資料を統合し、重複を整理したもの。

---

## 0. 基本の考え方

演技指定を単に **`happy`** のような感情語だけにせず、

> **感情 ＋ 話す目的 ＋ 強さ ＋ テンポ ＋ 相手への反応**

まで短く書くと、狙った演技になりやすい。

- ✗ `happy`
- ✓ `Warmly excited, speaking a little faster as she shares good news.`

Eleven v3は感情・話速・ささやき・笑いなどを指示でき、角括弧のAudio Tagsも使用できる。ただし生成結果には多少ばらつきがあるため、**短く具体的な演技指定**を基本にするのが扱いやすい。

**4層で考えると設計しやすい**

1. 感情・トーン
2. 話し方・テンポ・音量
3. 非言語音（間・自然さ）
4. 場面・関係性・ペルソナ

参考: [ElevenLabs Best Practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) / [Voice Design](https://elevenlabs.io/docs/eleven-creative/voices/voice-design)

---

## 1. 記述方式（3パターン）

### パターンA：冒頭にシチュエーションを記述する

会話全体の背景をテキスト先頭に置く。安定しやすい。

```text
[Setting: A busy coffee shop. Speaker A is a friendly barista, speaking warmly and fast.
Speaker B is a tired, indecisive customer, speaking softly.]

A: Hi there! What can I get started for you today?
B: Um... I'm not sure. I really need something with a lot of caffeine.
```

### パターンB：セリフごとに `[ ]` でインライン指定する

```text
A: [Excited, laughing] Guess what? I just won two tickets to the concert!
B: [Gasping, shocked] Wait, are you serious? No way!
```

タグは**演技を発生させたい発話の直前**に置く。長い台詞の先頭に一つだけ置くと影響範囲が曖昧になるため、必要な箇所の直前に置くほうが管理しやすい。

### パターンC：定型フォーマット（推奨）

演技指定欄を統一するなら次の形。

```text
[Core emotion], [attitude toward the other speaker]. Speak [pace], with [specific emphasis or reaction].
```

例：

```text
Genuinely surprised, but also amused by Tina's misunderstanding. Speak at a relaxed conversational pace, emphasizing "actually."
Slightly embarrassed and trying to hide it. Begin hesitantly, then speak more quickly as Frank makes an excuse.
Warmly excited, eager to show Frank what she has found. Speak brightly and a little faster than usual.
Deadpan and completely sincere, unaware that the statement sounds ridiculous. Keep the delivery calm and matter-of-fact.
```

さらに、**固定候補から一つ選び、必要に応じて自由記述を一文追加する方式**が運用しやすい（→ 第11章の40種リスト）。

```text
Base direction: Confidently mistaken

Additional direction:
Frank explains it seriously, completely unaware that Tina is making fun of him.
```

これなら演技指定の表現がスキット間でばらつかず、キャラクター性も維持しやすい。

---

## 2. 感情・トーン

### 2-1. 基本感情（詳細版）

| 日本語 | 英語の演技指定 |
| --- | --- |
| 嬉しそうに | `Happily, with a bright and cheerful tone.` |
| 楽しそうに | `Playfully, clearly enjoying the conversation.` |
| 興奮して | `Excitedly, with lively energy.` |
| 喜びを抑えながら | `Trying to contain their excitement.` |
| 満足そうに | `With quiet satisfaction.` |
| 安心して | `With a relieved, relaxed tone.` |
| 悲しそうに | `Sadly, with a soft and subdued voice.` |
| 寂しそうに | `Lonely and slightly vulnerable.` |
| 落胆して | `Disappointed, with their energy dropping.` |
| 泣きそうに | `On the verge of tears, but trying to stay composed.` |
| 怒って | `Angrily, with controlled intensity.` |
| いら立って | `Irritated and increasingly impatient.` |
| むっとして | `Slightly offended, trying not to show it too much.` |
| 不安そうに | `Anxiously, with slight hesitation.` |
| 怖がって | `Fearfully, speaking cautiously.` |
| 緊張して | `Nervously, with a slightly unsteady delivery.` |
| 恥ずかしそうに | `Shyly and a little embarrassed.` |
| 気まずそうに | `Awkwardly, unsure how to respond.` |
| 困惑して | `Confused, trying to make sense of what was said.` |
| 驚いて | `With genuine surprise.` |
| ショックを受けて | `Stunned, momentarily struggling to respond.` |
| 疑って | `Suspiciously, not fully believing the other person.` |
| 嫉妬して | `Jealously, while trying to sound casual.` |
| 誇らしげに | `Proudly, with restrained confidence.` |
| 退屈そうに | `Bored and only half-interested.` |
| 疲れて | `Tiredly, with low energy.` |

### 2-2. 簡易タグ版（短く指定したいとき）

| タグ | ニュアンス・使える場面 |
| --- | --- |
| `[cheerful]` / `[warmly]` | 明るく親しみのある基本トーン。日常会話 |
| `[excited]` / `[enthusiastic]` | テンションが高い。良い知らせ、再会、旅行の計画 |
| `[nervous]` / `[hesitant]` / `[anxious]` | 緊張。面接、初対面、初めての体験 |
| `[apologetic]` | 申し訳なさそう。謝罪シーン |
| `[annoyed]` / `[irritated]` / `[frustrated]` | 苛立ち。クレーム、口論、トラブル |
| `[disappointed]` / `[sad and quiet]` | 落胆。断られた時、失敗の報告、別れの挨拶 |
| `[curious]` | 興味津々。質問する側 |
| `[sarcastic]` / `[dry tone]` / `[unimpressed]` | 皮肉。上級者向け教材 |
| `[reassuring]` / `[gentle]` / `[calm and warm]` | なだめる。アドバイス、挨拶 |
| `[confident and proud]` / `[bold and direct]` | 自信満々。プレゼン、議論 |

### 2-3. トーンの調整軸

| 軸 | 英語表現 |
| --- | --- |
| プロフェッショナル / フォーマル | `Professional and formal` |
| カジュアル / 砕けた | `Casual and natural` / `Informal` |
| 友好的・温かい | `Friendly and warm` |
| 真面目・厳格 | `Serious and stern` |
| 遊び心・ジョーク | `Playful and joking` |
| 共感的・思いやり | `Empathetic and compassionate` |
| 無感情・一本調子 | `Monotone and robotic` |

---

## 3. 会話で頻出する反応

英会話スキットでは、単独の感情よりも **相手の発言をどう受け止めたか** を指定すると自然になる。

| 状況 | 英語の演技指定 |
| --- | --- |
| 相手の話に興味を持つ | `With genuine interest, encouraging the other person to continue.` |
| 相手に共感する | `Sympathetically, showing that they understand.` |
| 相手を励ます | `Reassuringly, with warm encouragement.` |
| 相手をなだめる | `Calmly, trying to reassure the other person.` |
| 相手を説得する | `Persuasively, emphasizing the practical benefit.` |
| 相手を止める | `Firmly, trying to stop the other person before they continue.` |
| 相手を急かす | `Urgently, encouraging the other person to hurry.` |
| 相手をからかう | `Teasingly, but without sounding mean.` |
| 冗談だと伝える | `Playfully, making it clear that this is a joke.` |
| 相手を疑う | `Skeptically, questioning whether the story is true.` |
| 信じられない | `In disbelief, as if asking, "Are you serious?"` |
| 話を理解した | `With sudden understanding, as the idea clicks.` |
| 聞き返す | `Politely confused, asking for clarification.` |
| 言い間違いを訂正する | `Gently correcting the misunderstanding.` |
| しぶしぶ同意する | `Reluctantly agreeing, still not entirely convinced.` |
| 納得していない | `Unconvinced, but willing to listen.` |
| 秘密を打ち明ける | `Quietly and confidentially, as if sharing a secret.` |
| 本音を言う | `Honestly and sincerely, dropping the playful tone.` |
| 嘘をごまかす | `Trying to sound casual while hiding something.` |
| 相手の機嫌をうかがう | `Cautiously, watching for the other person's reaction.` |

---

## 4. コメディー向け

掛け合い（例：FrankとTina）で特に使いやすい指定。

| 演技 | 英語の演技指定 |
| --- | --- |
| とぼけて | `Innocently, pretending not to understand the problem.` |
| 真顔で冗談を言う | `Deadpan, delivering the absurd line as if it were completely normal.` |
| 大げさに反応する | `Dramatically, making the situation sound much more serious than it is.` |
| 自信満々に間違える | `Confidently, completely unaware that they are wrong.` |
| 苦笑いする | `With an awkward, strained smile in the voice.` |
| 愛想笑いする | `With a polite but clearly forced laugh.` |
| 呆れている | `Dryly amused and slightly exasperated.` |
| つっこむ | `Quickly and incredulously, pointing out the obvious problem.` |
| いたずらっぽく | `Mischievously, enjoying the other person's confusion.` |
| 勝ち誇って | `Triumphantly, pleased to have proven their point.` |
| バレて焦る | `Flustered, realizing they have been caught.` |
| 言い訳する | `Defensively, scrambling to come up with an explanation.` |
| しれっと言う | `Casually, as though the strange statement were perfectly ordinary.` |
| 盛大に勘違いする | `With complete sincerity, misunderstanding the situation in a comical way.` |
| 後から意味に気づく | `A beat of confusion, followed by sudden embarrassed realization.` |
| 不吉なことを明るく言う | `Cheerfully, unaware of how alarming the statement sounds.` |

**特に便利な三つ**

- `Deadpan, as if this were completely normal.`
- `Confidently, without realizing that he is mistaken.`
- `With an awkward, strained smile in his voice.`

---

## 5. 話す速さ・リズム

| 指定 | 英語の演技指定 |
| --- | --- |
| ゆっくり明瞭に | `Slowly and clearly, with natural conversational rhythm.` |
| 学習者向けに少しゆっくり | `At a slightly slower conversational pace, without sounding unnatural.` |
| 普通の会話速度 | `At a relaxed, natural conversational pace.` |
| 少し早めに | `A little faster, carried by excitement.` |
| 早口で | `Quickly, with rushed and nervous energy.` |
| 言葉を選びながら | `Slowly, choosing each word carefully.` |
| ためらいながら | `Hesitantly, with small pauses between thoughts.` |
| 途中から勢いづく | `Starting cautiously, then gradually becoming more animated.` |
| 最後だけゆっくり | `Slowing down on the final words for emphasis.` |
| 畳みかける | `Rapidly, barely giving the other person time to respond.` |
| 一語ずつ強調する | `Deliberately, emphasizing each key word.` |
| 淡々と | `Evenly and matter-of-factly, without dramatic variation.` |

**注意**：語学教材では、単に `slowly` と指定すると不自然に間延びすることがある。

```text
At a slightly slower conversational pace, while keeping the rhythm natural.
```

のように **自然なリズムを維持する** ことも加えるのがおすすめ。話速は演技やタグの影響を受け、別途speed設定がある機能では極端な値が品質に影響する可能性がある。

---

## 6. 声量・距離感

| 指定 | 英語の演技指定 |
| --- | --- |
| 小声で | `Quietly, as if trying not to be overheard.` |
| ささやいて | `In a soft whisper.` |
| 内緒話のように | `In a confidential, conspiratorial tone.` |
| はっきり大きく | `Loudly and clearly, trying to get someone's attention.` |
| 遠くの人に呼びかける | `Calling out to someone across the room.` |
| 隣の人だけに話す | `Softly, speaking only to the person beside them.` |
| 電話越しに話す感覚 | `Clearly and directly, as if speaking over the phone.` |
| マイクのすぐ近くで | `Speaking directly into the microphone.` |
| 独り言 | `Quietly to themselves, not expecting a response.` / `Muttering to oneself.` |
| 息を切らして | `Slightly out of breath, struggling to finish the sentence.` |
| 声を抑えて怒る | `In a low, controlled voice, holding back anger.` |
| いら立ちながら大声で | `Shouting with frustration.` |

### 身体的状態

- `Out of breath, catching wind`（息が切れている）
- `Tired and sleepy, slurring slightly`（眠くて少し滑舌が悪い）
- `Laughing while speaking`（笑いながら話す）
- `Trying not to cry`（泣きそうになりながら）
- `Talking casually while walking`（歩きながらカジュアルに話す）

---

## 7. 強調・意味の伝え方

| 指定 | 英語の演技指定 |
| --- | --- |
| 重要な言葉を強調 | `Emphasizing the key word without overacting.` |
| 最後の語を強調 | `Placing extra emphasis on the final word.` |
| 対比を明確にする | `Clearly contrasting the two ideas.` |
| 警告として言う | `With firm emphasis, making the warning unmistakable.` |
| 念を押す | `Deliberately, making sure the other person understands.` |
| 意外な事実を明かす | `Building toward the final revelation.` |
| オチを効かせる | `Pausing slightly before delivering the punchline.` |
| 含みを持たせる | `Suggestively, implying more than is being said.` |
| 皮肉を込める | `Dryly sarcastic, with restrained emphasis.` |
| 本気で言う | `Sincerely, making it clear that this is not a joke.` |

---

## 8. 疑問文の演技

| 疑問の種類 | 英語の演技指定 |
| --- | --- |
| 純粋な質問 | `Curiously, genuinely asking for information.` |
| 確認 | `Seeking confirmation, with a gentle rise at the end.` |
| 驚きの聞き返し | `In surprised disbelief, sharply questioning what was just said.` |
| 疑い | `Skeptically, expecting that the answer may not be true.` |
| 心配 | `Concerned, urgently checking whether everything is all right.` |
| 遠慮がちな質問 | `Tentatively, not wanting to sound intrusive.` |
| 答えが分かっている反語 | `Rhetorically, not actually expecting an answer.` |
| 責めるような質問 | `Accusingly, demanding an explanation.` |
| ワクワクした質問 | `Eagerly, hoping for a positive answer.` |
| 語尾を上げる練習 | `[with a rising intonation]` |

---

## 9. キャラクターの態度・性格・ペルソナ

### 9-1. 性格・態度

同じ感情でも、キャラクターらしさを付加できる。

| 性格・態度 | 英語の演技指定 |
| --- | --- |
| 生真面目 | `Earnestly and seriously, taking the situation at face value.` |
| 無邪気 | `Innocently, with open and childlike curiosity.` |
| 楽観的 | `Optimistically, assuming everything will work out.` |
| 悲観的 | `Pessimistically, already expecting the worst.` |
| 自信がある | `Confidently, with relaxed certainty.` |
| 自信がない | `Uncertainly, with a slight lack of confidence.` |
| 世話好き | `Warmly and helpfully, eager to solve the problem.` |
| 頑固 | `Stubbornly, refusing to reconsider.` |
| 負けず嫌い | `Competitively, determined not to lose.` |
| お調子者 | `Showily and playfully, enjoying the attention.` |
| 天然 | `With complete sincerity, unaware of the unintended humor.` |
| 冷静 | `Calmly and analytically, unaffected by the commotion.` |
| 尊大 | `Self-importantly, as though their opinion settles the matter.` |
| 礼儀正しい | `Politely and respectfully, with restrained warmth.` |
| 親しみやすい | `Warm, friendly, and easygoing.` |

### 9-2. 年齢感

- `Youthful and energetic`（若々しくエネルギッシュ）
- `Mature and wise`（成熟して賢明）
- `Elderly and gentle`（年配者の穏やかさ）
- `Childlike and innocent`（子供のような無邪気さ）

### 9-3. 役割（ペルソナ）

ペルソナを指定すると、その役に合った声質・口調に引き寄せられる。

- `Friendly tour guide`（フレンドリーなツアーガイド）
- `Strict but fair boss`（厳しくも公正な上司）
- `Anxious customer service caller`（焦っている電話客）
- `Curious young child`（好奇心旺盛な子供）
- `Experienced professor`（経験豊富な教授）

---

## 10. 非言語音（Audio Tags）と間・沈黙

### 10-1. Audio Tags

Eleven v3では角括弧のAudio Tagsで笑い、ため息、ささやきなどを指定できる。

```text
[laughs]  [chuckles]  [giggles]  [sighs]
[gasps]   [whispers]  [clears throat]
[hesitates]  [pauses]  [exhales]
```

組み合わせ例：

```text
[chuckles] You really believed that?
[sighs] Fine. I'll do it.
[gasps] Is that a real alien?
[whispers] Don't look behind you.
```

スキットでは `[pauses]` と `[sighs]` が特に効く。ただし多用すると不自然になるため、**1発話あたり1つまで**が目安。

### 10-2. 間・沈黙を含む演技指定（文章で書く場合）

| 指定 | 英語の演技指定 |
| --- | --- |
| 答える前に一瞬考える | `Pausing briefly before answering, as if thinking.` |
| ショックで言葉が出ない | `A stunned pause before speaking.` |
| 言いにくそうに切り出す | `Hesitating before reluctantly saying what happened.` |
| オチの前に間を置く | `A short comedic pause before the final phrase.` |
| 相手の反応を待つ | `Pausing briefly to see how the other person reacts.` |
| 思い出しながら話す | `Speaking reflectively, with small pauses while remembering.` |
| 途中で考え直す | `Starting confidently, then pausing and correcting themselves.` |
| 言葉に詰まる | `Momentarily stumbling over the words from embarrassment.` |
| 言いよどむ・途中で止める | `[trailing off]` |

---

## 11. 場面・関係性で演技を誘導する

タグより、地の文で状況を書くほうが安定することがある。

### 場面指定の例

- `[on the phone]` — 電話越しの話し方
- `[talking to a customer at a hotel front desk]`
- `[a teenager talking to a close friend]` — くだけた口調
- `[a manager giving feedback to a junior employee]` — フォーマル寄り
- `[ordering food at a busy café]`
- `[calling out from across the room]`
- `[British accent]` / `[American accent]` — アクセント指定

### シチュエーション別まとめ

| 分類 | 指定例 |
| --- | --- |
| ビジネス | `In a business meeting` / `Giving a presentation` / `Negotiating professionally` / `Customer service tone` |
| 日常会話 | `Chatting with friends` / `Ordering at a restaurant` / `Making small talk` / `Asking for directions` |
| 教育・説明 | `Teaching and explaining clearly` / `Reading aloud` / `Narrating a story` |
| 話法 | `Conversational` / `Storytelling mode` / `Questioning tone` / `Explanatory` / `Persuasive` |

---

## 12. 語学教材向けの特別な指定

教材では、自然さだけでなく **聞き取りやすさと模倣しやすさ** が重要。

**使いやすい基本指定**

```text
Natural and conversational, but slightly slower and clearer than everyday speech.
Keep contractions, linking, and natural American English rhythm.
```

**初心者向け**

```text
Warm and expressive, speaking clearly at a learner-friendly pace.
Do not sound like a formal language-learning recording.
```

**感情を保ちながら明瞭に**

```text
Act the emotion naturally, while keeping every word clear and easy to imitate.
```

**短いフレーズ練習向け**

```text
Deliver the line as a complete conversational thought, with clear stress and natural sentence rhythm.
```

**避けたい指定**

```text
Speak very slowly and pronounce every word separately.
```

単語同士のつながりや英語らしいリズムを壊しやすい。代わりに：

```text
Slightly slower than normal, while preserving natural connected speech.
```

---

## 13. 実用的な演技指定40選（固定候補リスト）

スキット制作で最初に用意する候補として、この40種でかなりカバーできる。

| # | 指定 | # | 指定 |
| --- | --- | --- | --- |
| 1 | `Warm and friendly` | 21 | `Playfully teasing` |
| 2 | `Brightly excited` | 22 | `Mischievous and amused` |
| 3 | `Genuinely curious` | 23 | `Dryly sarcastic` |
| 4 | `Pleasantly surprised` | 24 | `Deadpan and matter-of-fact` |
| 5 | `Shocked and confused` | 25 | `Confidently mistaken` |
| 6 | `Nervous and hesitant` | 26 | `Innocently confused` |
| 7 | `Quietly worried` | 27 | `Dramatically overreacting` |
| 8 | `Deeply relieved` | 28 | `Trying to hide excitement` |
| 9 | `Softly disappointed` | 29 | `Trying to hide disappointment` |
| 10 | `Sad but composed` | 30 | `Trying to sound casual` |
| 11 | `Embarrassed and flustered` | 31 | `Making a weak excuse` |
| 12 | `Awkwardly trying to smile` | 32 | `Sharing a secret` |
| 13 | `Annoyed but controlled` | 33 | `Thinking out loud` |
| 14 | `Increasingly impatient` | 34 | `Calling from a distance` |
| 15 | `Firm and serious` | 35 | `Speaking under their breath` |
| 16 | `Calm and reassuring` | 36 | `Out of breath and hurried` |
| 17 | `Sincere and apologetic` | 37 | `Pausing before the punchline` |
| 18 | `Reluctantly agreeing` | 38 | `Realizing the mistake halfway through` |
| 19 | `Skeptical and unconvinced` | 39 | `Gently correcting the other person` |
| 20 | `Suspicious but curious` | 40 | `Encouraging the other person to continue` |

---

## 14. 組み合わせ例

複数要素を組み合わせると効果的。

```text
Speak in a friendly, casual tone with enthusiasm, as if chatting with a close friend.
（親しい友達と話しているように、フレンドリーでカジュアルに熱意を持って）

Deliver the lines professionally but warmly, with measured pacing and confidence.
（プロフェッショナルだが温かみを持って、リズム良く自信を持って）

Speak nervously and hesitantly, with a quiet voice, as if unsure of yourself.
（自信がないかのように、小さく緊張してためらいながら）
```

---

## 15. 実践のコツ（まとめ）

1. **具体的かつ簡潔に** — 長すぎる指示よりも核心を捉えた短い指示。目安は「1つのセリフにつき形容詞2〜3個」。
2. **タグは発話の直前に置く** — `[nervous] Um... is this seat taken?` のように。長台詞の先頭に一つだけ置かない。
3. **タグを重ねすぎない** — `[excited][speaking quickly][laughs]` は破綻しやすい。**2つまで**。
4. **句読点で補強する** — `...`（ためらい・間）、`—`、`!`、`?` を意図的に混ぜると、指示がより強く反映される。
5. **感情＋話し方の複合指定** — 単一要素より複合のほうが自然な結果になる。
6. **コンテキストを含める** — 「〜のように（as if / as though）」で状況を説明するとAIが理解しやすい。
7. **声の素材と合わせる** — 落ち着いた声に `[shouting]` を指定しても効きが弱い。役ごとにボイスを選び分けるほうが確実。
8. **教材用途なら誇張を抑える** — 学習者が聞き取れる範囲に留める。感情タグ + `[speaking clearly]` の組み合わせが安全。
9. **試行錯誤する** — 同じテキストで異なる指示を試し、最適なものを見つける。生成にはばらつきがある。
10. **固定候補＋自由記述1文** — 表現のばらつきを防ぎ、キャラクター性を維持できる。



