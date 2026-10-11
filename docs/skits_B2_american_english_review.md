# B2 全60話 アメリカ英語ナチュラルネス検証レポート

検証日: 2026-10-10 ／ 対象: `skits/skits_B2_dialogs_jp.md`（B2-01〜B2-60、台詞778行＋ナレーション60本）
方法: 全60話を1話ずつ通読し、次の5観点で評価した。英国式の綴り・語彙と口語マーカーは機械的にも走査した。

1. 英米差（綴り・語彙・制度名）
2. コロケーションと定型句の形
3. 文法（とくに条件文・仮定法の時制の一貫性）
4. Frankのレジスター切替と口語マーカー（kinda / gonna / wanna / gotta 等）の自然さ
5. 英語だけで意味・オチが通じるか

表の「台詞」は各話内の台詞番号、「行」は確認時点の本文の実ファイル行番号。

> **2026-10-11 追記（適用済み）:** 高・中・低の全件、§5 の口語マーカー3件、§6 の推奨箇所（B2-40 台詞2、B2-51 台詞1、B2-38 台詞3・8・12、B2-46 台詞10）を本文に反映した。§8 の範囲外の気づきは、ユーザーの指示どおり次のように対応した。
> - B2-19 台詞13 は修正案を採用。
> - B2-15 と B2-40 の再生数は意図どおりのため変更なし。
> - B2-06 のリスト名を "Team-Old"／"Team-New" に変更。
> - B2-18 を "Consultation on Elderly Care" に改題。
> - B2-29 のナレーションを差し替え。
>
> 改題（B2-18・B2-29）は `skits_arrangement.md`・`skits_additional_voice_casting.md`・`frank_and_tina_character_memo_for_B2.md` にも同期した。`build/` の JSON と音声用 Markdown は未更新。
>
> 以下の本文は、適用前の検証時点の記録（指摘と修正案）。
> `build/skits_B2.json`・`build/skits_B2_elevenlabs.md` は現行本文より**前の版**から生成されている（例: B2-04 のナレーションと台詞2が現行本文と異なる）。また `audio/B2/` は空。修正を本文に適用しても音声の再合成は発生しない。JSON は修正の有無にかかわらず再生成が必要。

---

## 1. 結論サマリ

**全体として、アメリカ英語として自然な水準にある。全面的な書き直しは不要。** 次のような現代米語の口語・慣用句が場面に合わせて使われている。

- 口語・慣用句: `committed to the bit`、`Thoughts and prayers`、`Who are you and what have you done with Frank?`、`play devil's advocate`、`by the book`、`I'll hold you to that`、`Legal will have to weigh in`、`double-booked`、`Don't you dare`
- 数詞・単位: `two hundred ten`（and を入れない米式）、ドル
- 生活・制度語彙: `semester`、`dorm`、`flyer`、`raffle`、`first-years`、`lease`

Frankのレジスター切替にも違反はない。公的場面（委員会・窓口・面接・パネル等）で `gonna`・`kinda` 等を使った箇所は0件。私的場面の口語も大半は自然に機能している。

ただし、次の4種類の問題が散発的にある。

1. **英国式の綴り・語彙**: `cancelled`／`cancelling`（4か所。A2・B1 は `canceled` で統一済み）、`payslips`、`Full stop`、`Months on`。米国にない制度名（`residence permit`、`status reclassification`）もある。
2. **条件文の時制の不一致**: B2-14、B2-22。条件文を学ぶB2教材としては直したい。
3. **英語だけでは意味やオチが通らない台詞**: B2-50 の決め台詞 `I'm standing on it`、B2-06 `by the wrong list`、B2-03 `the second she looked confused`（状況と矛盾）など。
4. **B2の文法・談話の型の多用**: 文頭の `Having + 過去分詞`（10回）、`Part of me … Part of me`（13回）、B2-38 の wh分裂文（13台詞中7回）。個々は正しいが、頻度が高く、ドリル的・教科書的に響く（§6）。

| 優先度 | 件数 | 内容 |
|---|---|---|
| **高（修正推奨）** | 8 | 英米差、文法の時制不一致、英語でオチが通じない箇所、日本製英語のタイトル |
| **中（改善推奨）** | 32 | 誤りではないが、ネイティブならまず言わない言い回し、指示対象の曖昧さ、状況との齟齬 |
| **低（任意）** | 45 | 今のままでも通じる。より自然にしたい場合の磨き上げ |
| **口語マーカー** | 3 | 私的場面の口語のうち、据わりの悪いもの（§5） |

---

## 2. 優先度「高」— 修正推奨

| # | 話・台詞（行） | 現行 | 問題 | 修正案 | 和訳 |
|---|---|---|---|---|---|
| 高-1 | **B2-01** 台詞1（18）、**B2-21** ナレーション（696）、**B2-52** 台詞5（1767）・台詞13（1783） | When I **cancelled** our Saturday… / Frank has just **cancelled** their weekend **plan**… / if I hadn't been **cancelling** so often / I'd still be **cancelling** | `cancelled`・`cancelling` は英国式の綴り。米国式は `canceled`・`canceling`。A2・B1 本文は `canceled` で統一されており、シリーズ内で不統一になっている。B2-21 は、予定の意味では複数形 `plans` が普通 | **canceled** / **canceled their weekend plans** / **canceling** / **canceling** | 変更不要 |
| 高-2 | **B2-04** 台詞2（122） | Contract, **payslips**, photos — it's all here. | `payslip` は英国英語。米国では `pay stub` | Contract, **pay stubs**, photos — it's all here. | 変更不要（給与明細） |
| 高-3 | **B2-57** 台詞13（1950） | "We're good friends." **Full stop.** That's the answer. | 「以上、終わり」の意味の `Full stop.` は英国英語。近年は米国の政治家の発言でも聞かれるが、日常の米語では `Period.` が標準 | "We're good friends." **Period.** That's the answer. | 変更不要（以上。） |
| 高-4 | **B2-12** ナレーション（389） | …for international students **just arrived on campus**. | 自動詞の過去分詞 `arrived` は、`just` を付けても名詞を後ろから修飾できない（`students just arrived` は非文）。音声で読み上げるナレーションなので要修正 | …for international students **who just arrived on campus**. ／ …for **newly arrived** international students. | 変更不要 |
| 高-5 | **B2-14** 台詞5（469） | **If we agreed** to your revision, **what changes?** | 条件節が仮定法過去（`agreed`）なのに、帰結節が現在形で、時制が揃っていない | **If we agreed** to your revision, **what would change?** ／ If we **agree**…, what **changes**? | 変更不要 |
| 高-6 | **B2-22** 台詞7（747） | **If someone gets hurt** alone at two a.m., **nobody would know** for hours. | 条件節が現在形なのに、帰結節が `would` で、時制が揃っていない（B1 レポート高-8 と同型） | **If someone got hurt** alone at two a.m., nobody would know for hours. ／ …gets hurt…, nobody **will** know… | 変更不要 |
| 高-7 | **B2-50** 台詞12（1713） | I'd say **I'm standing on it.** Though **I grant** I may be biased. | 「証拠は自分自身だ」という決め台詞のつもりだが、`stand on it` は「（証拠の）上に立っている」「（主張を）堅持する」と読め、オチが英語で成立しない。この意味の定型は `You're looking at it.`。`I grant` も硬く、話し言葉では `I'll admit` | I'd say **you're looking at it.** Though **I'll admit** I may be biased. ／ **It's standing right in front of you.** Though I'll admit I may be biased. | 「証拠なら、いま皆さんの目の前に立っています。もっとも、僕に偏りがあるのは認めますが」（現行訳もほぼ流用可） |
| 高-8 | **B2-29** タイトル（968） | SNS Identity | `SNS` は日本・韓国で使う略語で、米国ではほぼ通じない。米語は `social media`。ただし改題には `skits_arrangement.md`・年表・build 等の同期が必要なので、**判断はお任せ** | **Social Media Identity** | — |

---

## 3. 優先度「中」— 改善推奨

| # | 話・台詞（行） | 現行 | 問題 | 修正案 |
|---|---|---|---|---|
| 中-1 | **B2-03** 台詞12（108） | …dropping it **the second she looked confused** would've saved you. | 相手は困惑しておらず、本気にして熱心に語り出した（台詞5）。英語では状況と食い違う | …dropping it **the second she took you seriously** would've saved you.（訳「彼女が本気にした瞬間にやめてれば」） |
| 中-2 | **B2-04** ナレーション（117） | …to renew her **residence permit**. | `residence permit` は欧州・日本の制度名で、米国の制度には存在しない。タイトルも Visa Renewal | …to renew her **visa**.（訳は「ビザ」でも「在留許可」のままでも可） |
| 中-3 | **B2-05** 台詞10（172） | If I'd **known that math** earlier… | 定型のコロケーションは `do the math`。`know the math` は不自然 | If I'd **done the math** earlier, I'd have worn it months ago. |
| 中-4 | **B2-06** 台詞6（198） | The email did what it was told — **by the wrong list.** | 「間違ったリストによって命令された」と読め、意味が崩れている | Nobody lied. The email did exactly what it was told. **It just went to the wrong list.**（訳「宛先のリストが違っていただけです」） |
| 中-5 | **B2-08** 台詞1（256） | **Having read your proposal, I'll start simple.** | 分詞構文の内容（読んだ）と主節（簡単な質問から始める）に因果がなく、話し言葉としても硬い（§6 参照） | **I've read your proposal, so let me start simple.** |
| 中-6 | **B2-08** 台詞5（264） | **Your biggest line.** | 予算の費目は `line item`。`line` 単独では通じにくい | **It's your biggest line item.** |
| 中-7 | **B2-08** 台詞6（266） | It looks expensive **until you compare it.** One lab night costs more than one tracker for two years. | 何と比べるのかが示されていない。`one lab night` も圧縮しすぎ | It looks expensive **until you compare it to a sleep lab. One night in a lab** costs more than one tracker for two years. |
| 中-8 | **B2-09** 台詞5（298） | The other said she laughed, **but heard complaints.** | 「他の人の苦情を耳にした」とも読める。意図は「投稿が愚痴に聞こえた」 | The other said she laughed, **but it read like a complaint.**（訳「もう一人は、笑ったけど愚痴に読めたって」） |
| 中-9 | **B2-09** 台詞6（300） | …your joke and her three weeks of planning **were in the same room.** | 投稿はネット上なので `in the same room` の比喩が具体に結びつかず、一聴で絵にならない | To be fair, **she spent three weeks planning that meeting, and your joke landed right on top of it.** |
| 中-10 | **B2-11** 台詞5（366） | …while I want to be **somewhere alive.** | 場所について `alive` 単独は不自然。米語は `lively` | …while I want to be **somewhere lively.** |
| 中-11 | **B2-14** 台詞6（471） | **The price stays fair:** fifty samples as before… | `stay fair` は価格について言わない。言いたいのは「基本料金は据え置き」 | **The base price stays the same:** fifty samples as before, and anything above that is billed per sample. |
| 中-12 | **B2-14** 台詞10（479） | Per-sample billing **solves it once.** | 定型は `once and for all` | Per-sample billing **solves it once and for all.** |
| 中-13 | **B2-18** 台詞10（615） | **All of them,** politely. | 質問は単数の `What exactly is he refusing?` なので、`them` の指す複数名詞がない | **Everything,** politely. A visiting nurse, a stair rail, moving the study down. |
| 中-14 | **B2-20** 台詞3（669） | What exactly leaked, **from their side?** | `from their side` が「研究者の言い分では」とは読みにくい | **And what exactly leaked, according to them?** |
| 中-15 | **B2-21** 台詞9（717） | …won't even send **the dog picture I have open.** | 「（画面に）開いている犬の写真」は英語として据わりが悪い | …won't even send **the dog picture I was about to send you.**（訳「送ろうとしてた犬の写真」） |
| 中-16 | **B2-22** 台詞10（753） | **Safety gets its answer;** the night crew keeps working. | `safety gets its answer` は擬人化が強く、意味が取りにくい | **The safety concern is covered,** and the night crew keeps working. |
| 中-17 | **B2-23** 台詞12（793） | I'm not. **Friend, not anything else** — but not alone. | 主語のない名詞の羅列で、誰が友達なのかが一聴で取れない | I'm not. **He's a friend, nothing more — but I'm not alone.** That's the part that matters. |
| 中-18 | **B2-24** 台詞4（811） | **The stories start themselves.** | 定型は `The stories tell themselves.`（話は自然と出てくる） | **The stories tell themselves.** |
| 中-19 | **B2-24** 台詞6（815） | **I moved far, and young.** | 副詞の圧縮で、意味は分かるが英語として不自然 | **I moved a long way from home when I was young.** |
| 中-20 | **B2-33** 台詞6（1121） | **Part of me has obligations** tied to this exact week. | 「心の一部が義務を負う」は成立しない（Part of me は感情・意向に使う） | Part of me wants to go right now. **The other part knows I've got commitments this week that I can't move.** |
| 中-21 | **B2-36** 台詞6（1223） | **You don't rehearse where you belong.** | 「帰属する場所を練習しない」と誤って構文解析されやすい | **Where you belong, you don't have to rehearse.** |
| 中-22 | **B2-38** 台詞10（1299） | …whether travel a few weeks after that is realistic — **would that be a safe assumption?** | `assumption` の中身が先に述べられていない | He's also wondering **if it's safe to assume he could travel a few weeks after that.**（訳「その数週間後なら渡航できると考えて大丈夫か」） |
| 中-23 | **B2-38** 台詞13（1305） | And **bring him back** for the next one. **Your questions** did half my job. | 1台詞の中で聞き手が研究者→Frankに切り替わり、音声だけでは `him`／`your` が誰か分からない | And **bring Frank next time — his questions** did half my job. |
| 中-24 | **B2-41** 台詞9（1401） | **I'm not claiming your experience of it.** | `claim one's experience` は英語として通じない | **I'm not saying I hear it the way you do.** I just — felt something too. |
| 中-25 | **B2-44** ナレーション（1484） | …following up on **a status reclassification.** | 米国の制度用語ではない。在留資格の変更は `change of status` | …following up on **her change-of-status application.** |
| 中-26 | **B2-46** 台詞4（1561） | What I'm less sure about **is phrasing the gap**… | 「どう書くか」が抜けており、動名詞だけでは収まりが悪い | What I'm less sure about **is how to explain the gap** between her papers so it doesn't read as an excuse. |
| 中-27 | **B2-48** 台詞5（1631） | Could I have gotten more time, **if I'd known sooner the review skipped it?** | `known sooner the review…` の語順がぎこちなく、`that` もない | **If I'd known sooner that the review skipped that section,** could I have gotten more time? |
| 中-28 | **B2-48** 台詞7（1635） | **I feel left without** what I need to move forward. | `feel left without` は定型ではない | **I feel stuck. I don't have** what I need to move forward. |
| 中-29 | **B2-50** 台詞8（1705） | Watch what it does **when nobody assigned the task.** | 時制と冠詞がぎこちない | Watch what it does **when nobody has given it a task.** |
| 中-30 | **B2-53** 台詞12（1816） | **I hope it outlasts** all of us. | 直前の Dr. Chen の `That`（スピーチ）や賞を指すようにも聞こえ、`it` が曖昧。式典の締めの台詞なので明示したい | **I hope that culture outlasts** all of us.（訳「その文化が、僕たちの誰よりも長く続くことを願っています」） |
| 中-31 | **B2-57** 台詞7（1938） | …and **it still never survives actual strangers.** | 「決めた答えが他人に通用しない」の意味が `survive` では伝わりにくい | …and **it still falls apart with real strangers.** |
| 中-32 | **B2-58** ナレーション（1957） | **Months on,** Frank and Tina have spoken… | `months on` は英国寄り・報道文体。米語の語りでは `months later` | **Months later,** Frank and Tina have spoken on another belonging panel. |

---

## 4. 優先度「低」— 任意の磨き上げ

| 話・台詞（行） | 現行 | 修正案 | 備考 |
|---|---|---|---|
| B2-01 台詞5（26） | I **invented** ten problems. | I **came up with** ten different problems. | `invent` は発明の響き |
| B2-02 台詞7（64） | Volunteers sign it without **reading.** | …sign it without **reading it.** | 目的語を補う |
| B2-02 台詞11（72） | Send us both versions by Friday — **in writing.** | Send us both versions by Friday. | 書類を送るので `in writing` は重複 |
| B2-04 台詞9（136） | **So I see.** | **I can see that.** | 現行も可だが、やや古風 |
| B2-05 台詞8（168） | …and made my coffee. **The usual one.** | …and made **my usual.** | 定型は `the usual` / `my usual` |
| B2-06 台詞8（202） | I wasn't **copied on** that conversation. | I wasn't **part of** that conversation. | `copied on` はメールのCC。上司への報告は口頭 |
| B2-06 台詞9（204） | we need **this not to happen** again | we need to **make sure this doesn't happen** again | 定型の言い方 |
| B2-06 台詞10（206） | One list, **one truth.** | One list, **one source of truth.** | IT業務の定型 `single source of truth` |
| B2-07 台詞6（232） | **Is the mystery in your way?** | **Has the mystery gotten in your way?** | 「邪魔になったことがあるか」を問う文脈 |
| B2-08 台詞8（270） | That's why I **invite** forty extra people. | That's why I'**m recruiting** forty extra people. | 計画を表す進行形 |
| B2-08 台詞13（280） | **Two weeks** — and try to sleep until then. | **You'll hear from us in two weeks** — try to get some sleep until then. | `Two weeks` 単独では何が2週間か不明 |
| B2-10 台詞11（344） | we can treat it as **a breach.** | we can treat it as **a lease violation.** | 米国の賃貸で一般的な言い方。現行も可 |
| B2-12 台詞9（408） | People hold **a door**… **further** back… | People hold **the door**… **farther** back… | 定型は `hold the door`。物理的距離は米語では `farther` が規範的 |
| B2-14 台詞4（467） | Four times **the number** isn't variation. | Four times **the agreed number** isn't variation. | 何の4倍かを明示 |
| B2-16 台詞11（549） | That's **the version** I'm proud of. | That's **the version of us** I'm proud of. | 何の version かを補う |
| B2-17 台詞5（571） | **Having reviewed** for three journals, I know… | **I've reviewed** for three journals, **so** I know… | §6 参照 |
| B2-17 台詞11（583） | …and the sample **holds.** | …and the sample **will hold up.** | 「（批判に）持ちこたえる」は `hold up` |
| B2-17 台詞13（587） | **budget more cookies** | **budget for more cookies** | `budget for ~` |
| B2-18 台詞6（607） | He **calls downstairs** "more practical." | He **says downstairs is** "more practical." | 現行は「1階に電話する」とも読める |
| B2-18 台詞13（621） | we'll **look together.** | we'll **look at the options together.** | 目的語を補う |
| B2-19 ナレーション（628） | Tina **calls back instead of replying.** | Tina **calls him instead of texting back.** | `call back` は折り返し電話の意味 |
| B2-19 台詞5（639） | **Let me rephrase:** nothing you said bothered me. | **To be clear:** nothing you said bothered me. | 言い直す元の発言が弱い（§6 参照） |
| B2-20 ナレーション（662） | **The communications head** | **The head of communications** | 肩書きの語順 |
| B2-21 台詞4（707） | you can still **rescue** the day | you can still **salvage** the day | `salvage the day` が定型 |
| B2-22 台詞5（743） | Frank, is **the** one person you? | Frank, is **that** one person you? | 指示詞のほうが自然 |
| B2-24 台詞12（827） | Your dorms **house forty nationalities** | Your dorms **have students from forty countries** | 口頭の面接で `house ~ nationalities` は硬い |
| B2-28 台詞5（949） | It went past everyone. | It went **right** past everyone. | `right` で慣用句らしくなる |
| B2-30 台詞4（1015） | Mrs. Okada knitted **three.** | Mrs. Okada knitted **three scarves.** | 台詞8の `Your scarves` が初出になるため、ここで出す |
| B2-32 台詞12（1099） | Let me **call them** and see. | Let me **call home** and see if they can come. | `them` が子どもたちを指し、幼い子に電話するように聞こえる |
| B2-33 ナレーション（1108） | caught **in the middle of** two things she loves | caught **between** two things she loves | 定型 |
| B2-36 台詞2（1215） | left it by the **kettle** | left it by the **coffee maker** | 米国の職場の定番は電気ケトルよりコーヒーメーカー |
| B2-41 ナレーション（1382） | Her laptop has been **playing** on the table | Her laptop has been **playing music** on the table | 目的語を補う |
| B2-41 台詞6（1395） | **That's the composer** who only writes about distance. | **That's by the composer** who only writes about distance. | 曲＝作曲家になっている |
| B2-42 台詞13（1443） | **We'll be watching for it.** | **We'll hold you to that.** | `it` の指示対象が曖昧 |
| B2-43 台詞12（1475） | Separate from who's **holding it out.** | Separate from who's **offering it.** | |
| B2-44 台詞5（1495） | I **may not be able to** share details | I **can't** share the details | 担当者が自分の権限を推量する形は不自然 |
| B2-44 台詞8（1501） | I understood a decision **follows** within ten days | I **was told** a decision **would follow** within ten days | 時制の一致 |
| B2-45 台詞4（1527） | **Look down my finger.** | **Follow my finger.** | 定型 |
| B2-46 台詞1（1555） | You're **doing Leila's reference?** | You're **writing Leila's recommendation letter?** | 米国の学術推薦状は `letter of recommendation`。`reference` 単独は推薦者本人や電話照会を指しやすい |
| B2-47 台詞11（1609） | where the line **sits** | where the line **is** | |
| B2-48 台詞12（1645） | I'll make sure **this gap doesn't happen** again. | I'll make sure **this doesn't happen** again. | `gap` と `happen` のコロケーションが弱い |
| B2-51 ナレーション（1722） | the **faculty board** | the **faculty committee** | `Faculty Board` は英国の大学の機関名 |
| B2-51 台詞6（1735） | each breakdown **loses us** two days | each breakdown **costs us** two days | 米語では `cost` が普通 |
| B2-52 台詞8（1773） | **That was true.** | **That's true.** | 相手の発言への同意は現在形 |
| B2-59 台詞13（2018） | I want it to **hold**, too. | I want it to **last**, too. | 関係が「続く」は `last` |

---

## 5. 口語マーカー（kinda / gonna / wanna / gotta / Yeah 等）の運用

**レジスター切替は守られている。** Frankの口語マーカーは全12か所（kinda 5、wanna 2、gonna・gotta・sorta・lemme・'Cause 各1。`Yeah` 4回は別に数える）。すべてTinaと二人きりの私的場面で、公的場面での違反はない。大半は自然に機能している。

- B2-27 `What kinda thing?`
- B2-31 `A floor plan, sorta`
- B2-45 `'Cause you carry it with you.` / `I'm not gonna start now.`（button として効果的）
- B2-55 `Lemme try again.`
- B2-25 `I kinda don't have anything like that`

一方、次の3か所は据わりが悪い。

| 話・台詞（行） | 現行 | 所見 | 修正案 |
|---|---|---|---|
| B2-11 台詞6（368） | If we hadn't both started from the extremes, **we'd kinda see** the overlap. | 混合条件文の帰結節に `kinda` を挟むと、後から足したように響く。`started from the extremes` もやや不自然 | If we hadn't both started **at opposite extremes**, **we'd already see** the overlap. |
| B2-37 台詞12（1269） | That's all **it's gotta be.** | 米語の `it's gotta be ~` は「〜に違いない」（推量）の意味で使うことが多く、「それだけでいい」とは取りにくい | That's all **it needs to be.** |
| B2-59 台詞6（2004） | **Having spent** the last few years mostly focused inward, I think I **wanna** be more visible. | 書き言葉的な分詞構文と `wanna` が同じ文に同居し、レジスターが衝突している | **I've spent** the last few years mostly looking inward. **Now** I think I wanna be more visible. |

---

## 6. B2の型の多用（文体上の注意）

以下は**どれも文法的に正しく、単独では自然**。ただ頻度が高いため、通しで聞くと「型の練習」に聞こえる。B2の談話機能を見せる意図は理解できるので、全廃ではなく数か所の言い換えを推奨する。

| 型 | 回数 | 出現話 | 所見と推奨 |
|---|---|---|---|
| `Part of me … Part of me …` | 13回／8話 | B2-23, 30, 31, 33, 39, 40, 53, 60 | 特に **B2-40 は1話に3回**（台詞2・10）。台詞2を `Honestly, harder than I expected. **I seriously thought about taking it down.**` にすると、台詞10の対句が生きる。B2-33 台詞6は中-20を参照 |
| 文頭の `Having + 過去分詞` | 10回／7話 | B2-02, 08, 17, 39, 42(×3), 51, 59 | 委員長・教授・学部長が `Having read your proposal/draft/report, I…` と同じ型で切り出す回が3つある（B2-08・17・51）。口頭では `I've read your report, and I have one big question.` が自然。B2-08 台詞1（中-5）、B2-17 台詞5（低）、B2-51 台詞1、B2-59 台詞6（§5）の言い換えを推奨。B2-02 台詞6（Frankの公的口調）、B2-39 台詞4、B2-42 の聴聞会の型は残してよい |
| wh分裂文 `What X is …` | B2-38 で13台詞中7回、B2-25 で4回 | B2-38, 25 ほか | B2-38 は医師・Frank・研究者の全員が `What we're recommending is… / What he'd like to know is… / What matters most is… / What I want to avoid is… / What he's also asking is… / What concerns me is… / What I'd like is…` と同じ構文で話し、ドリルに聞こえる。例として台詞3 `**The main thing is to get it done** within the next two months.`、台詞8 `**My concern is** the recovery time —`、台詞12 `**Could I get** a written summary to take home?` の3つを崩すとよい |
| `I would argue` / `I'd argue` | 8回／8話 | B2-02, 14, 17, 34, 36, 42, 46, 50 | 公的な議論では自然。親しい先輩との相談（B2-46 台詞10）では硬いので、`I think one honest sentence **beats** leaving them to guess.` 程度でよい |
| `Are you saying …?` | 8回／8話 | B2-18, 20, 31, 35, 38, 40, 50, 58 | 含意確認の機能として自然。変更不要 |
| `To be fair` / `That said` / `Even so` / `Let me rephrase` | 各5〜6回 | — | 大半は適切。`Let me rephrase` は B2-19 で2回（台詞5は言い直す元の発言が弱いので低ランクで指摘済み） |

---

## 7. 問題なしと判断した要注意表現

一見気になるが、アメリカ英語として自然なので修正不要と判断したもの。

- B2-02 `ethics committee`: 米国の研究現場の正式名は `IRB`（Institutional Review Board）だが、学習者には `ethics committee` のほうが分かりやすく、米国でも通じる。
- B2-03 `committed to the bit`、B2-09 `Thoughts and prayers`、B2-05 `Who are you and what have you done with Frank?`: 現代米語の口語・ネットスラングとして適切で、笑いの仕組みにも合っている。
- B2-14 `two hundred ten`: `and` を入れない米式の読み方で正しい。
- B2-37 `the better half`、`He does talk in paragraphs`、`I'm invoicing him`: 自然で効果的。
- B2-42 `Briefed, consented, anonymized`: 被験者を目的語にとる `consent` の他動詞用法は、米国の臨床・研究現場の業界語として実在する。
- B2-46 `To play devil's advocate`、B2-42 `by the book`、B2-44 `I'll hold you to that`、B2-34 `Legal will have to weigh in — I'll flag it today.`: 業務口語として自然。
- B2-16・21 `till`、B2-26 `If all the other volunteers show`（show up の省略）: 米語の口語で普通。
- B2-17 `You already planned that?`: 米語では `already` と過去形の組み合わせが許容される。
- B2-36 `first-years`: 米国の大学でも `freshmen` に代わる中立的な語として広く使われる。
- B2-45 `'Cause you carry it with you.`: 相手の発言を受けて `'Cause` で始める応答は自然な口語。

---

## 8. 範囲外の気づき（英語の自然さ以外）

依頼範囲外だが、通読中に気づいたもの。

1. **build/ が現行本文と同期していない**: `build/skits_B2.json`・`build/skits_B2_elevenlabs.md` は改稿前の本文から生成されている（例: B2-04 のナレーションが "The process has changed since last time, and an agency prepared part of her paperwork." のまま）。`audio/B2/` は空。
2. **B2-19 台詞13** "I'll **text** you more clearly next time.": すれ違いの原因は対面での表情の読み違い（台詞6〜8）なので、「メッセージを明確に」では噛み合わない。修正案: **"Next time, I'll just tell you when I'm somewhere else."**
3. **B2-15 と B2-40 の再生数**: B2-15 は4万再生、B2-40 の司会は "over two million people"。同じ動画が後に伸びたのか、別の動画なのかが英文から分からない。意図通りか確認を推奨。
4. **B2-06 台詞4** の "Team" と "Team-2024": 音声だけだと、どちらが古いリストか判別しにくい（年号付きを新しい方と取る聞き手も、古い方と取る聞き手もいる）。必要なら "Team-Old" / "Team-New" のように明示する。
5. **B2-18 のタイトル** "Medical Second Opinion": 本文は介護の選択肢の相談で、セカンドオピニオンは扱っていない（セカンドオピニオンは B2-38 に登場）。タイトルの変更には同期作業が伴うので、参考情報として記す。
6. **B2-29 台詞1** は、ナレーションの1文目とほぼ同文。音声化すると同じ文が2回続く。
