# B1 全60話 アメリカ英語ナチュラルネス検証レポート

検証日: 2026-10-10 ／ 対象: `skits/skits_B1_dialogs_jp.md`（B1-01〜B1-60、台詞780行＋ナレーション60本＋注釈3本）
方法: 全英文を通読し、①英米差（語彙・綴り・制度名）②コロケーション・語の選び方 ③文法（とくに仮定法・条件文の時制の一貫性）④口語マーカー（kinda / gotta / Yeah 等）の自然さ ⑤英語だけで意味・オチが通じるか、の5観点で評価した。

> **本文への適用状況（2026-10-11 追記）**: ユーザー指示により、§2〜§5 の修正案（高13件・中24件・低16件・口語マーカー2件）と、§7 のうち B1-58（計算）・B1-02（"I told her I'd be back by ten."）を `skits/skits_B1_dialogs_jp.md` に適用済み。和訳は各表の案に沿って調整した。B1-09 の改題（Public Transit Complaint）に合わせ、`docs/skits_arrangement.md`・`docs/skits_additional_voice_casting.md` のタイトルも同期した。§7-2（同一話者の連続）は未対応。
> `build/skits_B1.json`・`build/skits_B1_elevenlabs.md`・`audio/B1/` は未更新。なお `build/skits_B1.json` は適用前から旧配置（B1-01＝Job Promotion Talk）のままで、現行本文と同期していない。

---

## 1. 結論サマリ

**全体として、アメリカ英語として自然な水準にある。** 会話のテンポ、イディオム（`ghosted`、`highlight reel`、`went sideways`、`meetings that could have been emails` など）、綴り（`gray`、`canceled`、`toward`）、単位（dollars、pounds）は一貫してアメリカ式になっている。英国綴り（-our / -ise / travelling 等）は検出されなかった。

ただし、次の3種類の問題が散発的にある。

1. **英国寄りの語・制度名**: `the right way up`、`open-plan`、`handover`、`the tax office`、`film` など。いずれも意味は通じるが、アメリカ英語を標榜するなら差し替えたい。
2. **条件文の時制の不一致**: 仮定法を多用する B1 では、教材として時制のずれが目立つ（B1-39、B1-48）。
3. **非ネイティブ的なコロケーション**: `I met the guy every week`、`vanished on smaller things`、`handed me a list`（電話なのに）など。

| 優先度 | 件数 | 内容 |
|---|---|---|
| **高（修正推奨）** | 13 | 英米差、明確な不自然さ、文法の時制不一致、英語でオチが通じない箇所 |
| **中（改善推奨）** | 24 | 誤りではないが、ネイティブならまず言わない言い回しや、曖昧さがある箇所 |
| **低（任意）** | 16＋§5の2件 | 今のままでも通じる。より自然にしたい場合の磨き上げ |

---

## 2. 優先度「高」— 修正推奨

| # | 話・行 | 現行 | 問題 | 修正案 | 和訳 |
|---|---|---|---|---|---|
| 高-1 | **B1-07** L10 ＋注釈 | Lawyers always promise the stars. | 定型句は `promise (someone) the moon` / `promise the moon and the stars`。`promise the stars` 単独は慣用句として定着しておらず、注釈の「慣用表現」という説明も不正確 | **Lawyers always promise the moon and the stars.**（Tina の返し "the stars aren't that far" はそのまま成立） | 訳は「月も星も約束してみせますからね」程度に。注釈は `promise the moon (and the stars)` を見出しにして書き直す |
| 高-2 | **B1-19** L8 | ...you'd have carried it **the right way up**. | `the right way up` は英国英語。米語は `right side up` | ...you'd have carried it **right side up**. | 変更不要 |
| 高-3 | **B1-19** L5 | You held the door for **the accused**. | 米国の法廷では `the defendant` が標準。`the accused` は英国寄りか文語的 | You held the door for **the defendant**. | 変更不要（被告人） |
| 高-4 | **B1-31** L5 | ...basically an **open-plan layout**. | `open-plan` は英国英語。米語は `open floor plan` / `open concept` | ...basically an **open floor plan**. | 変更不要 |
| 高-5 | **B1-41** L10 | Stay two more months and **the handover's** smooth. | `handover` は英国寄り（米語は `handoff` / `transition`）。命令文＋and の帰結が現在形 `'s` で、ぎこちない | Stay two more months, and **the transition will go a lot smoother.** | 変更不要 |
| 高-6 | **B1-52** L7 | **The tax office** won't. | 作品の舞台は米国（ドル・ポンド）。米国人は税務当局を `the IRS` と呼ぶ。`tax office` は英国（HMRC）的な響きになる | **The IRS won't.** | 「税務署」のままで可 |
| 高-7 | **B1-53** ナレーション・L2・L10 | a **film** Tina chose / It was just a long **film**. / You picked this **film** on purpose | 米国の日常会話では `movie` が基本。`film` は英国的、または芸術映画寄りに響く | a **movie** / a long **movie** / this **movie**（3箇所とも） | 変更不要 |
| 高-8 | **B1-48** L4 | **If you bring** it up out of nowhere, **would** she actually listen? | 条件節が現在形なのに帰結節が `would` で、時制が合っていない。条件文を学ぶ教材としては要修正 | **If you brought** it up out of nowhere, **would** she actually listen? | 変更不要 |
| 高-9 | **B1-39** L1・L7 | **Take** the senior role and **you'd** lead... / **Train** her properly and **she'd** grow into it fast. | 「命令文＋and」は条件文の代わりなので、帰結節は通常 `will`。口語では聞かれるが、教材としては時制が揃っていない | **Take the senior role, and you'll be leading** a whole different team. / **Train her properly, and she'll grow** into it fast. | 変更不要 |
| 高-10 | **B1-11** L9 | She **handed** me a whole list... | 電話の場面なのに `handed`（手渡した）で、状況と矛盾する | She **gave** me a whole list... ／ She **rattled off** a whole list...（まくし立てた） | 「連絡すべき人をずらっと挙げられたの」 |
| 高-11 | **B1-10** L7 | I **met** the guy every week... | 繰り返し顔を合わせる意味の `meet` は典型的な非ネイティブ用法。米語の `meet` は初対面か約束しての面会 | I **saw** the guy every week and he said nothing. | 変更不要 |
| 高-12 | **B1-08** L11 | He'd **vanished on** smaller things before. The folders made him look **safe**. | `vanish on (物事)` は慣用ではない。人の信頼性を言うのに `safe` は不自然 | He'd **bailed on** smaller things before. The folders made him look **reliable**.（L2 の "The reliable one?" とも呼応） | 「前にも小さいことでドタキャンしてたんだ。フォルダのせいで頼れる人に見えてた」 |
| 高-13 | **B1-24** L13 | So apparently **the rice survived.** | 危機にあったのは米ではなく、生魚を食べられなかった彼。英語ではオチの意味が通らない | So apparently **he survived the sushi.** | 「どうやら彼、お寿司を生き延びたみたい」 |

---

## 3. 優先度「中」— 改善推奨

| # | 話・行 | 現行 | 問題 | 修正案 |
|---|---|---|---|---|
| 中-1 | **B1-09** タイトル | Public Transport Complaint | `public transport` は英国英語。米語は `public transportation` / `transit`。ただし改題すると `skits_arrangement.md`・年表・build 等の同期が必要なので判断はお任せ | Public Transit Complaint |
| 中-2 | **B1-06** L7 | ...that's how beginners survive — 'cause the recipe is the rules. | `the recipe is the rules` は単複が噛み合わず、ぎこちない | Boring or not, that's how beginners survive. **The recipe is the rulebook.** |
| 中-3 | **B1-16** L1 | My sister was always **the achiever**. | 兄弟比較の文脈では `the overachiever` / `the star` が定番 | My sister was always **the overachiever**. |
| 中-4 | **B1-16** L4 | So **the dinners** were about her. | 前の文脈に dinner が出ていないのに `the dinners` と定冠詞で始まり、唐突 | So **family dinners were all about her.** |
| 中-5 | **B1-16** L5 | I stopped **bringing news** at all. | `bring news` は「知らせを持ってくる」で、家族に話す意味では不自然 | I stopped **sharing anything** at all. |
| 中-6 | **B1-19** L12 | He **loaded a gray van**... | 「バンを（荷物で）満載にした」とも読める | He **loaded it into a gray van** and drove off. |
| 中-7 | **B1-25** L5 | **A honeymoon**, last week. | キャンセルした「人」を `a honeymoon` と呼ぶのは不自然 | **A honeymoon couple**, last week. |
| 中-8 | **B1-28** L7 | Then pretended he **never heard**. | 目的語 `it` がなく、時制もずれている | Then pretended he'**d never heard it**. |
| 中-9 | **B1-28** L10 | You shouldn't have to **guard yourself with** friends. | `guard yourself with` は「〜で身を守る」と読める | You shouldn't have to **watch what you say around** friends. |
| 中-10 | **B1-29** L6 | **The phone stamps them**, right? The phone stamps them. | `stamps` だけでは何を押すのか不明 | **My phone time-stamps them**, right? **It does!** |
| 中-11 | **B1-29** L9 | ...the landlord's report, **her statement**, and... | 直前に landlord と neighbor の2人がいて、`her` がどちらか曖昧 | ...the landlord's report, **your neighbor's statement**, and... |
| 中-12 | **B1-30** L11 | She'd ask if we're dating **within five minutes**. | 「5分以内に付き合っているか」と読めてしまう（修飾の係り先の誤読） | **Within five minutes,** she'd ask if we're dating. |
| 中-13 | **B1-32** L7 | ...not something I can **carry into work**. | 米語は `bring to work` | Definitely not something I can **bring to work**. |
| 中-14 | **B1-32** L12 | That's **the kinda maturity** I admire. | 名詞句 `the kind of ~` の中の `kinda` は表記として不自然。読む教材としても TTS としても損 | That's **the kind of maturity** I admire. |
| 中-15 | **B1-34** L12 | **Painful wisdom. Yeah,** but you earned it. | `painful wisdom` はコロケーションが弱い。自分の発言に `Yeah` で応じる形も不自然 | **A painful lesson.** But you earned it. |
| 中-16 | **B1-37** L3 | **That said,** five thousand a month is... | `That said` は通常、自分の直前の発言を受けて譲歩する。相手への反論の切り出しには `Still,` が自然 | **Still,** five thousand a month is ten times your current volume. |
| 中-17 | **B1-37** L12 | Then we have **the shape of a deal**. | 定型句ではない | Then **I think we have the makings of a deal.** |
| 中-18 | **B1-45** L1 | **The dishes really got me.** | `got me` は「一本取られた／だまされた」とも取れて曖昧 | **The food really blew me away.** |
| 中-19 | **B1-48** L11 | **However frustrated her choices make me.** | 文法上は成立するが、ぎこちない | **No matter how much her choices frustrate me.** |
| 中-20 | **B1-49** L10 | You seem calm for **someone's** first press conference. | 目の前の相手に `someone's` は不自然 | You seem **pretty calm for your first** press conference. |
| 中-21 | **B1-50** L5 | What if I **never** wake up tomorrow? | `never` と特定の日時 `tomorrow` は噛み合わない | What if I **don't** wake up tomorrow? |
| 中-22 | **B1-52** L12 | Could we **book next week** to file it properly? | `book next week` は目的語がなく不自然 | Could we **set up a time next week** to file it properly? |
| 中-23 | **B1-53** L12 | I **probably gotta** go see him. | 語順と語調が落ち着かない。しんみりした場面にも合わない | I **should probably** go see him. |
| 中-24 | **B1-58** L8 | **Fewer details from me**, more trust in the team. | 意味が伝わりにくい | **Less micromanaging from me**, more trust in the team. |

---

## 4. 優先度「低」— 任意の磨き上げ

| 話・行 | 現行 | 修正案 | 備考 |
|---|---|---|---|
| B1-12 L5 | I just assumed he'd **know** English. | ...he'd **speak** English. | `speak English` が定型 |
| B1-14 L1 | I'**ve taken** out the trash for months | I'**ve been taking** out the trash for months | 不満の継続には進行形が自然（ナレーションも進行形） |
| B1-14 L8 | I just wore **more coats**. | I just **piled on more layers**. | coats を何枚も重ねるのはやや奇妙 |
| B1-15 L3・L10 | the southern **path** | the southern **route** | L12 の `route` と揃える。旅程の文脈では route |
| B1-19 L2 | I **was back** from a run | I **was just getting back** from a run | ドアに着く前なので「戻りつつあった」 |
| B1-19 L12 | **still smudged, but here.** | **It's a little smudged, but here it is.** | |
| B1-21 L2 | That's kind. | That's **very kind of you**. | 単独の `That's kind.` はやや素っ気ない |
| B1-35 L4 | ...on a whiteboard, **by phone light**. | ...on a whiteboard, **by the light of her phone**. | 圧縮しすぎ |
| B1-35 L13 | ...reference call **of my month**. | ...reference call **I've had all month**. | |
| B1-43 L10 | ...recovering from, **doctor**. | ...recovering from, **Doctor**. | 呼びかけの肩書きは大文字（表記） |
| B1-46 L11 | Pages and pages of **when we were young**. | Pages and pages of **us when we were young**. | |
| B1-47 L7 | The smile **does** a lot of work. | **That smile is doing** a lot of work. | 慣用的には進行形 |
| B1-48 L6 | Wait too long and she **learns** the hard way. | Wait too long, and she**'ll learn** the hard way. | 高-9 と同じ理由 |
| B1-56 L12 | ...to every Sunday **from here**. | ...to every Sunday **to come**. | `from here` だけでは尻切れ |
| B1-57 L12 | **Write** tonight. | **Write him back** tonight. | |
| B1-60 L7 | Every way I **tried it** sounded like a complaint. | Every way I **tried to say it** sounded like a complaint. | |

---

## 5. 口語マーカー（kinda / gotta / Yeah）の運用

Frank の私的場面での `kinda`（9回）・`gotta`（7回）・`Yeah`（13回）は、大半が自然に機能している（例: B1-01 "That's kinda how you find what fits."、B1-18 "Kinda rich, coming from...", B1-36 "Which you kinda skipped."、B1-11 "Then you gotta tell her that."）。

一方、スタイルガイドの「私的場面では口語も可」を満たすために後から足したように見える箇所が数か所ある。

| 話・行 | 現行 | 所見 | 修正案 |
|---|---|---|---|
| B1-22 L10 | That's **kinda** the wisest thing you've said all month. | 最上級を `kinda` でぼかすと据わりが悪い | That **might be** the wisest thing you've said all month. |
| B1-44 L6 | After that, it's **kinda** easy. | 「楽になる」という変化が出ていない | After that, **it gets a lot easier.** |
| B1-32 L12 | the **kinda** maturity | 中-14 参照 | the kind of maturity |
| B1-53 L12 | I probably **gotta** go see him. | 中-23 参照 | I should probably go see him. |
| B1-34 L12 | Painful wisdom. **Yeah**, but... | 中-15 参照 | A painful lesson. But... |

---

## 6. 問題なしと判断した要注意表現

一見気になるが、アメリカ英語として自然なので修正不要と判断したもの。

- B1-01 `carved in stone`: `set in stone` のほうが高頻度だが、米語でも普通に使う。注釈で併記済み。
- B1-02 `get this thing out the door` / `cover letter`: 業務口語として自然。
- B1-08 `ghosted us`、B1-01 `highlight reel`、B1-24 `went sideways`、B1-58 `meetings that could have been emails`: 現代米語の口語として適切。
- B1-26 `one less cup a week`: 規範文法では `fewer` だが、米語の口語では `less` が普通。
- B1-32 `It didn't get the memo yet.`: 米語では `yet` と過去形の組み合わせが許容される。
- B1-38 `Always a brilliant plan.`: 皮肉の `brilliant` は米語でも普通。
- B1-52 `a shoebox of receipts`、B1-16 `participation ribbon`: いかにも米国的な文化背景で、効果的。
- B1-56 `Cheers!`（乾杯）、`burned dinners`: 米語で自然。
- B1-05 `the best call of my week`: 口語として許容範囲。

---

## 7. 範囲外の気づき（英語の自然さ以外）

依頼範囲外だが、通読中に気づいたもの。

1. **B1-58 L4 の計算が合わない**: "A team change delayed the water study by five weeks. Once we adjusted, we finished two weeks early. **Net: three weeks saved.**" 5週間遅れて2週間取り戻したなら、差し引きは「3週間の遅れ」で、節約ではない。数字に厳密な Frank の台詞なので目立つ。修正案: **"Net: three weeks behind, not five."**（和訳「差し引き、遅れは5週間でなく3週間です」）
2. **同じ話者の台詞が連続している箇所**（5話）: B1-06 L3→L4（Tina）、B1-15 L11→L12（Agent）、B1-23 L11→L12（Doyle）、B1-25 L12→L13（Tina）、B1-26 L12→L13（Tina）。意図的な間なら問題ないが、音声化では間の取り方に注意が必要。
3. **B1-02 L8** "I said I'd be home by ten." を Tina へのメッセージの文脈で言うと、同居をほのめかすようにも読める（設定上は同じアパートの別室に住む隣人）。気になる場合は "I told her I'd be back by ten." が無難。
