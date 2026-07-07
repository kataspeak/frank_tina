# スキット配置設計＋新採番＋ID対応表

本書は、Formal/Unique の大分類配置を廃止し、**学習者が飽きない配置**へ並べ替えた上で
**各レベル通し番号**に改番するための正本。時系列は `docs/frank_and_tina_timeline.md` のスパインに従う。

---

## 1. 新採番スキーム

- 形式：`<LEVEL>-NN`（ゼロ埋め2桁）。例：`A1-01 … A1-60`、`A2-01 …`、`B1-01 …`、`B2-01 …`。
- 番号＝**プレイ順（カリキュラム順）**。旧 F-/U- 接頭辞は廃止（カテゴリ概念を持たせない）。
- レベルをまたぐ callback は新IDで参照（例：B2 から `A1-01` を参照）。
- 各レベル内の自然な前後参照は配置順で維持。**レベル横断参照のみ**が改番の要注意点。

## 2. 配置（インターリーブ）ルール

1. **時系列維持**：年表§1スパインの前後関係を逆行させない。節目は固定位置：
   - A1：冒頭＝初対面、終盤＝別れ。A2：冒頭＝再会、終盤＝年末の感謝。
   - B1：終盤＝初めての本気の喧嘩。B2：終盤＝フィナーレ（旧U-30 *Stitched Together*）。
2. **種類を交互に**：実用回（旧Formal）とキャラ回（旧Unique）が**ブロックで固まらない**よう散らす。
   実用の窓口応答が3連続以上続かないこと。
3. **緩急を交互に**：重い回（agency／喧嘩／博士／ホームシック）と軽い回（コント）を交互に。とくにB1は重テーマ連続を割る。
4. **モチーフの初出順を守る**：ピンク・星図・博士・コーヒー等は初出→再登場の順序を崩さない。

## 3. A1 配置・対応表（パイロット：確定提案）

新ID＝プレイ順。種別：[実]＝実用フレーズ回（要・小事件化）／[キ]＝キャラ回／[節]＝節目。

| 新ID | 旧ID | タイトル | 種別 | 配置意図 |
|---|---|---|---|---|
| A1-01 | F-01 | Beyond the Stars! | 節 | 初対面（シリーズ開幕） |
| A1-02 | F-02 | What's That? | キ | 署名確立（黒コーヒー/ホットチョコ） |
| A1-03 | U-02 | I'm Soooo Hungry | キ | 早めに掛け合いの温度を出す |
| A1-04 | F-03 | The Mountain Village | キ | Frank出自① |
| A1-05 | F-04 | Family Photo | 節 | Frank出自②（博士＝父） |
| A1-06 | U-04 | I Hate Mondays | キ | 重→軽の緩急 |
| A1-07 | F-05 | My Room | キ | 星図初出 |
| A1-08 | F-08 | Going to School | キ | ピンク初出（自転車） |
| A1-09 | U-03 | This Is So Cute! | キ | 性格対比 |
| A1-10 | F-06 | Breakfast Time | 実 | 食の対比（小事件化） |
| A1-11 | F-09 | In the Classroom | 実 | 花の勘違い（小事件化の代表） |
| A1-12 | U-01 | OMG, New Phone! | キ | テンポ転換 |
| A1-13 | F-10 | My Teacher | 実 | 学校日常 |
| A1-14 | F-11 | After School | 実 | テニス/図書館 |
| A1-15 | U-05 | Chill Day | キ | 軽い回 |
| A1-16 | F-12 | At the Library | 実 | マンガvs科学書（小事件） |
| A1-17 | F-13 | At the Supermarket | 実 | 地球の計算ネタ（小事件化の代表） |
| A1-18 | U-06 | Selfie Time! | キ | Frankが笑えないランニングギャグ |
| A1-19 | F-14 | I Want a Pencil | 実 | 文房具（要・小事件化） |
| A1-20 | F-15 | What Do You Like? | 実 | 食/ピンク |
| A1-21 | U-07 | Game Night | キ | 軽い回 |
| A1-22 | F-16 | My Hobby | 実 | 読書vsダンス |
| A1-23 | F-17 | Weekend Plans | 実 | 宇宙人ネタ（home連想） |
| A1-24 | U-08 | Snack Attack | キ | 深夜コント |
| A1-25 | F-18 | Birthday Party | 実 | ピンク（贈り物） |
| A1-26 | F-19 | Today's Weather | キ | ピンクのコート（名場面） |
| A1-27 | U-09 | I'm Bored | キ | 「星から来た少女」の物語（しんみり） |
| A1-28 | F-20 | I Have a Cold | キ | 看病（関係深化） |
| A1-29 | F-21 | At the Hair Salon | 実 | ピンクの髪 |
| A1-30 | U-10 | New Sneakers! | キ | 軽い回 |
| A1-31 | F-22 | Asking Directions | 実 | 道案内（要・小事件化） |
| A1-32 | F-23 | At the Restaurant | 実 | 注文 |
| A1-33 | U-11 | Cafe Time | キ | 二人の定位置（署名再登場） |
| A1-34 | F-24 | Phone Call | 実 | 勉強の約束 |
| A1-35 | U-12 | Test Tomorrow | キ | 試験前 |
| A1-36 | U-13 | I Failed | キ | 支え合い（母へ同行） |
| A1-37 | F-25 | Asking for Help | 実 | 図書館（要・小事件化） |
| A1-38 | F-26 | Lost and Found | 実 | 星のキー（出自モチーフ） |
| A1-39 | U-15 | Gossip Time | キ | 性格対比 |
| A1-40 | F-27 | Shopping for Clothes | 実 | 試着（要・小事件化） |
| A1-41 | U-16 | Crush Talk | キ | Tinaの恋ばな |
| A1-42 | F-32 | Asking About a Job | 実 | カフェ経験（伏線回収） |
| A1-43 | F-33 | A New Neighbor | 実 | 隣人Kate（脇役候補→常連化検討） |
| A1-44 | U-14 | School Trip Plans | キ | 旅行わくわく |
| A1-45 | F-39 | School Festival | 実 | 共有イベント |
| A1-46 | U-17 | Movie Night | キ | 手をつなぐ（名場面） |
| A1-47 | F-36 | Ordering Coffee | 実 | 注文（署名） |
| A1-48 | F-28 | At the Post Office | 実 | 日本へ贈り物（家族モチーフ） |
| A1-49 | U-18 | Karaoke! | キ | Frankの弱さ開示 |
| A1-50 | F-31 | Hotel Check-in | 実 | 静けさ（Frank性格） |
| A1-51 | F-38 | Calling a Doctor | 実 | 受診予約（要・小事件化） |
| A1-52 | F-37 | Buying Souvenirs | 実 | 故郷の友へ（家族モチーフ） |
| A1-53 | U-19 | Late Night Talk | キ | 旅の夜・絆 |
| A1-54 | F-07 | What Time Is It? | 実 | 駅・時間（旅立ち準備の入口） |
| A1-55 | F-29 | Buying a Train Ticket | 実 | 切符（旅立ち準備） |
| A1-56 | F-30 | At the Bank | 実 | 両替（旅立ち準備） |
| A1-57 | U-20 | See You Tomorrow | キ | 不変の日課（別れ前の対比） |
| A1-58 | F-35 | Taking a Taxi | 実 | 新しい街・小さな町出身 |
| A1-59 | F-34 | At the Airport | 節 | 出発（別れの直前） |
| A1-60 | F-40 | Saying Goodbye | 節 | A1フィナーレ（別れ） |

> A1 のレベル横断参照（→B2 U-12 が初対面を、A2 が母のキャンパス案内を回想）について、参照先の旧IDが新ID
> `A1-01` 等に変わる点を B2/A2 改番時に付け替える。

## 4. A2 / B1 / B2 配置・対応表（確定）

A1と同じインターリーブ・ルール（§2）で確定。実用3連なし／重い回は原則非連続（B1-39→40→41＝昇進打診→迷い→退職のキャリア決断ビルド、B1-59→60＝climax build、B2-49→50＝agency私的解→公的決着 のみ意図的に隣接）／節目固定／モチーフ初出→callback順を維持。

### A2（新→旧）
| 新 | 旧 | Title | | 新 | 旧 | Title |
|---|---|---|---|---|---|---|
| A2-01 | F-01 | Welcome Back | | A2-31 | U-13 | TikTok Famous |
| A2-02 | F-02 | New Apartment | | A2-32 | F-11 | Changing Reservation |
| A2-03 | U-01 | Have You Seen It? | | A2-33 | U-14 | Roommate Problems |
| A2-04 | F-03 | Lab Interview Practice | | A2-34 | F-20 | Workplace Training |
| A2-05 | U-05 | I'm Stuffed! | | A2-35 | U-15 | Too Much Screen Time |
| A2-06 | F-12 | Talking About Hometown | | A2-36 | F-21 | Recommending a Book |
| A2-07 | F-06 | Renting a Car | | A2-37 | F-22 | Library Late Fee |
| A2-08 | U-02 | I've Been There | | A2-38 | U-16 | Hangover |
| A2-09 | F-10 | Booking a Restaurant | | A2-39 | F-23 | Fixing a Bike |
| A2-10 | U-03 | New Hairstyle | | A2-40 | U-17 | Awkward Moment |
| A2-11 | F-13 | Showing Photos | | A2-41 | F-25 | Pharmacy Advice |
| A2-12 | F-14 | At the Gym | | A2-42 | U-18 | I Need Caffeine |
| A2-13 | U-04 | No Reply | | A2-43 | F-24 | Internet Setup |
| A2-14 | F-16 | Cooking Class | | A2-44 | U-19 | Workout Buddy |
| A2-15 | U-06 | Concert Tickets | | A2-45 | F-26 | Donating Clothes |
| A2-16 | F-09 | Complaining About Noise | | A2-46 | U-20 | Online Shopping Fails |
| A2-17 | U-07 | Group Chat Problem | | A2-47 | F-27 | Vet Visit |
| A2-18 | F-17 | Computer Trouble | | A2-48 | U-21 | Crying at Movies |
| A2-19 | U-08 | Pulling an All-Nighter | | A2-49 | F-28 | Asking for Time Off |
| A2-20 | F-15 | Book Club Meeting | | A2-50 | U-22 | New Tattoo |
| A2-21 | F-18 | Volunteer Work | | A2-51 | F-31 | School Application |
| A2-22 | U-09 | Fashion Disaster | | A2-52 | U-23 | Cancelled Plans |
| A2-23 | F-19 | Asking Neighbors | | A2-53 | F-32 | Phone Plan Change |
| A2-24 | U-10 | Crush Update | | A2-54 | U-24 | Late to Class Again |
| A2-25 | F-05 | Travel Insurance | | A2-55 | F-33 | Reporting a Theft |
| A2-26 | U-11 | Lost My Phone | | A2-56 | F-04 | Doctor's Visit |
| A2-27 | F-07 | Lost Luggage | | A2-57 | U-25 | End of Semester |
| A2-28 | U-12 | Mom's Calling | | A2-58 | F-34 | Fitness Goals |
| A2-29 | F-30 | Hosting a Guest | | A2-59 | F-29 | Train Delay Announcement |
| A2-30 | F-08 | Asking for Refund | | A2-60 | F-35 | Year-End Greeting |

### B1（新→旧）
| 新 | 旧 | Title | | 新 | 旧 | Title |
|---|---|---|---|---|---|---|
| B1-01 | F-09 | Crisis at Work | | B1-31 | F-22 | Apartment Renovation |
| B1-02 | U-04 | Quarter-Life Crisis | | B1-32 | U-11 | Office Crush |
| B1-03 | F-06 | After the Lecture | | B1-33 | F-20 | Wine Tasting |
| B1-04 | U-01 | I Wish I Had Studied | | B1-34 | U-08 | Job Interview Disaster |
| B1-05 | F-16 | Tech Support Call | | B1-35 | F-24 | Job Reference Call |
| B1-06 | U-03 | Failing Adulting | | B1-36 | U-19 | Stuck in Traffic |
| B1-07 | F-02 | Visa Application | | B1-37 | F-11 | Negotiating a Contract |
| B1-08 | U-12 | Group Project Hell | | B1-38 | U-22 | Hangover Regrets |
| B1-09 | F-21 | Public Transport Complaint | | B1-39 | F-01 | Job Promotion Talk |
| B1-10 | U-05 | The Ex Saga | | B1-40 | U-17 | Career Change Talk |
| B1-11 | F-13 | Tina's Mother Calls | | B1-41 | F-17 | Resigning from a Job |
| B1-12 | U-07 | Lost in Translation | | B1-42 | U-20 | Diet Failures |
| B1-13 | F-05 | Investment Consultation | | B1-43 | F-12 | Hospital Discharge |
| B1-14 | U-13 | Roommate Problems Pt.2 | | B1-44 | U-21 | Quitting Social Media |
| B1-15 | F-14 | Travel Itinerary Planning | | B1-45 | F-23 | Restaurant Review |
| B1-16 | U-10 | Sibling Rivalry | | B1-46 | U-24 | Reunion After Years |
| B1-17 | F-03 | Doctor's Diagnosis | | B1-47 | F-25 | Counselling Session |
| B1-18 | U-02 | If I Won the Lottery | | B1-48 | U-23 | Friend's Bad Decision |
| B1-19 | F-10 | Court Witness | | B1-49 | F-26 | Press Conference |
| B1-20 | U-14 | Apartment Hunt | | B1-50 | U-25 | Late Night Existential Crisis |
| B1-21 | F-08 | Interview With a Writer | | B1-51 | U-26 | Stars and Stitches |
| B1-22 | U-15 | First Salary | | B1-52 | F-27 | Tax Advice |
| B1-23 | F-04 | Real Estate Tour | | B1-53 | U-27 | Frank Actually Cries |
| B1-24 | U-09 | First Date Rewind | | B1-54 | F-15 | Charity Event Speech |
| B1-25 | F-18 | Booking a Cruise | | B1-55 | U-28 | The Outfit Intervention |
| B1-26 | U-16 | Financial Planning | | B1-56 | F-28 | Speech at a Wedding |
| B1-27 | F-07 | Couples Counselling | | B1-57 | F-30 | A Letter from the Doctor |
| B1-28 | U-18 | Friend Drama | | B1-58 | F-29 | Year-End Review Meeting |
| B1-29 | F-19 | Insurance Claim | | B1-59 | F-31 | Tina's Homesick Morning |
| B1-30 | U-06 | Awkward Family Dinner | | B1-60 | U-29 | The First Real Fight |

### B2（新→旧）
| 新 | 旧 | Title | | 新 | 旧 | Title |
|---|---|---|---|---|---|---|
| B2-01 | U-24 | Post-Fight Check-in | | B2-31 | U-18 | The Sketch |
| B2-02 | F-01 | Lab Ethics Review | | B2-32 | F-19 | Community Event |
| B2-03 | U-01 | Sarcasm Fail | | B2-33 | U-16 | Two Homes |
| B2-04 | F-03 | Visa Renewal | | B2-34 | F-20 | Housing Contract |
| B2-05 | U-02 | New Outfit Out | | B2-35 | U-19 | Explaining Without Apologizing |
| B2-06 | F-04 | Workplace Mediation | | B2-36 | F-08 | University Panel |
| B2-07 | U-03 | Shared Calendar | | B2-37 | U-20 | Professionally Misread |
| B2-08 | F-02 | Grant Interview | | B2-38 | F-21 | Medical Consent |
| B2-09 | U-07 | Regrettable Post | | B2-39 | U-22 | Mountain Village |
| B2-10 | F-06 | Apartment Dispute | | B2-40 | F-16 | Podcast Guest |
| B2-11 | U-09 | Travel Values | | B2-41 | U-21 | Playlist Detour |
| B2-12 | F-12 | Cultural Orientation | | B2-42 | F-22 | Research Ethics Hearing |
| B2-13 | U-04 | Homesick Playlist | | B2-43 | U-23 | Family Pressure |
| B2-14 | F-09 | Contract Revision | | B2-44 | F-23 | Immigration Office |
| B2-15 | U-11 | Viral Video Again | | B2-45 | U-25 | Star Map Reading |
| B2-16 | U-12 | Late Night Recall | | B2-46 | F-11 | Reference Letter |
| B2-17 | F-13 | Research Presentation | | B2-47 | U-27 | Tina Explains |
| B2-18 | F-05 | Medical Second Opinion | | B2-48 | F-25 | Complaint Resolution |
| B2-19 | U-13 | Mutual Misreading | | B2-49 | U-26 | Frank's Choice |
| B2-20 | F-10 | Crisis Communication | | B2-50 | F-24 | Panel Discussion |
| B2-21 | U-08 | Alone Day | | B2-51 | F-27 | Annual Report |
| B2-22 | F-14 | Committee Vote | | B2-52 | U-28 | Old Fight Revisited |
| B2-23 | U-10 | Mom Video Call | | B2-53 | F-26 | Award Ceremony |
| B2-24 | F-15 | Scholarship Interview | | B2-54 | F-29 | Doctor's Letter Response |
| B2-25 | U-14 | New Community | | B2-55 | F-28 | Interview Prep |
| B2-26 | F-17 | Volunteer Coordination | | B2-56 | U-05 | Reply to the Doctor |
| B2-27 | U-15 | Boundary Talk | | B2-57 | U-06 | Wedding Question |
| B2-28 | F-18 | Performance Review | | B2-58 | F-30 | Belonging Panel — Coda |
| B2-29 | U-17 | SNS Identity | | B2-59 | U-29 | Future Plans |
| B2-30 | F-07 | Public Apology Draft | | B2-60 | U-30 | Stitched Together |

> 横断 callback（年表§3）の旧→新は上表で確定：母＝A2-28→B1-11→B2-23／agency＝B1-03→B2-49→B2-50／博士の手紙＝B1-57→B2-54→B2-56／ジャケット＝B1-55→B2-05／初対面回想＝A1-01→B2-16／星図ホームシック＝B1-59→B2-13・B2-45。本文はID直接参照を含まないため、付け替えは語・出来事の継続性で担保する。

## 5. 改番時の callback 付け替え手順（チェック）

1. 全レベルで旧 `F-\d+`/`U-\d+` をgrepし、本対応表で新IDに置換。
2. 年表§3の横断スレッド（博士／母＝キャンパス案内／初対面回想／最初の喧嘩／新ジャケット／星図／agency／最初の週）が
   新IDで正しく繋がるか確認。宛先欠落・逆行ゼロを確認。
3. 各レベル新IDの重複・欠番チェック（NN が 01..本数 で連続）。
