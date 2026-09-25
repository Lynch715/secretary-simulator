# 《大秘》· 出图规范 v1.7（头像重出）

> 起因：v1.6 出的 27 张头像拼在一起看，二十三个男人是同一张脸——四十五岁上下、浓密黑发侧分、同一条下颌线、同一个四分之三侧身、同一件深色外套、同一只手在胸口举着东西。贺兰生五十九岁「头发稀白」、邵国栋「剃青头」、邱仲华「全白往后梳」，prompt 里都写了，图上一个也没出来。

## 一、为什么一个样

不是描述写得不够。v1.6 每个人的描述其实够细，问题在**描述放在哪、模型看到了什么**：

1. **每条 prompt 前 250 个词一模一样**（前缀 A + 后缀 B + 对齐锚图那句），人物那一句排在最后。模型按顺序读，前面已经把「一张中国机关干部的钢笔淡彩头像」定死了，最后一句只能在这个模子里微调。二十七次微调出来就是二十七个同一个人。
2. **每次出图都喂了 `p_me` / `p_boss` / `p_mayor` 当参考图。** 参考图里的脸比文字重得多。你让它画贺兰生，同时给它看周维安，它画出来的就是周维安的脸换件毛背心。全套二十三张男的都有书记那条下颌线，就是这么来的。
3. **写的是「不要」。** 「Do not default to a three-quarter view」「no downward gaze」——模型对否定句基本无感，有时候反而照着画。
4. **差异写在了模型分不清的地方。** 「肩线塌一点」「眼下青黑」「发际线后退」这些在 52 像素下本来就看不见，模型也照样忽略。真正能撑开剪影的是：**头发有没有、白不白、脸圆不圆、胖不胖、戴不戴镜、领子什么样、姿势是站是转是低头。**

## 二、改法

**1. 一张图里画六个人，不再一次画一个。** 出「人物线阵图」：一张 1536×1024 的图，3 列 2 行，六个不同的人各占一格。同一张图里模型必须把六个人画得**互相**不像，这个约束比二十七次单独出图强得多。出完用 `art.py --sheet` 切格落盘。33 张头像 = 6 张线阵图。

**2. 人先说，风格后说。** 每格的第一句就是这个人最响的三个特征，风格那段压缩成三行放在整段最后。

**3. 头像不喂任何参考图。** 风格靠文字锁；要喂，只喂 `s_mishu.webp`（场景，里面没有正脸）。**永远不要把别人的头像当参考图。**

**4. 只写「要什么」，不写「不要什么」。** 「Seen in strict profile, nose to the left edge」，不写「not three-quarter」。

**5. 六个人之间的差别先分配再写。** 下面的表按发型、年龄、体型、眼镜、领子、姿势六个维度排过：全套 33 张里**浓密黑发只允许三个人**（吴敬之、白重远、卢志高），花白 / 全白 / 光头 / 稀疏 / 后退各占一份；每张线阵图里六个人的六个维度两两不重。

**6. 尺寸、格式、取景档都不变**：头像 256×336，WebP `quality=88`；`FRAME` 表里的顶框 / 留白多两档照旧由 `art.py` 后期裁。线阵图切出来的格子会存一份 `assets/原图/<id>.source.png`，将来单张返修还能走老流程。

## 三、流程

```
1. 把下面一张线阵图的整段 prompt 贴进出图工具，尺寸选 1536×1024（横向 3:2），不带任何参考图
2. 出来的图存成 assets/原图/线阵N.png
3. python3 art.py --sheet assets/原图/线阵N.png 3x2 <六个id，按格子顺序>
4. 拼一张 contact sheet 眯着眼看：六个人的剪影能不能分开？分不开的那一格单独重出（见第五节）
```

验收标准只有一条：**把全部头像缩到 52×68 拼在一起，不看脸只看外形，能指出谁是谁。**

## 四、六张线阵图

每格的写法：`[格号] 年龄和体型 · 头发 · 脸 · 眼镜 · 衣领 · 手里的东西 · 姿势`。中文是给你看的，英文那段是贴进去的。

**每张线阵图共用的头尾**（已经拼进每段，不用另加）：

```
Character line-up sheet: six different Chinese people (Han Chinese, East Asian features throughout), arranged in a 3 by 2 grid of equal cells, each cell a head-and-shoulders portrait cropped at mid-chest on plain pale paper, no borders, no labels, no numbers. The six must look like six unrelated people: different hairline and hair colour, different age, different build, different collar, different pose. Treat each cell as a separate sitter drawn on a separate day.
...six cells...
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, faces rendered plainly.
```

### 线阵 1 · 班子（一）

`python3 art.py --sheet assets/原图/线阵1.png 3x2 p_boss,p_mayor,p_vice1,p_depsec,p_jiwei,p_zuzhi`

| 格 | 谁 | 一句话 |
|---|---|---|
| 1 | 周维安 书记 53 | 宽肩、高额头、鬓角灰白往后梳；方脸；不戴镜；深灰西装不打领带；手里一支钢笔；几乎正面，目光越过看图的人 |
| 2 | 陈立群 市长 56 | 微胖红润；**满头白发浓密往后梳**；圆脸；不戴镜；深蓝西装**红领带**（全套唯一）；茶杯举到唇边挡住下巴；笑着看画外 |
| 3 | 高振邦 常务副市长 55 | 高瘦；**地中海**，头顶光、两侧稀；长脸；细金属镜；灰夹克拉链拉到顶；一叠账本；**低头翻页**，只看见头顶和鼻梁 |
| 4 | 罗明川 副书记 50 | 中等身材；**乌黑得过分的染发**，一丝不乱；长脸；不戴镜；黑西装深领带；空手抱臂；**正侧脸剪影**，鼻尖冲画面左边 |
| 5 | 宋自强 纪委书记 54 | 瘦，颧骨高；**花白寸头**；瘦削脸；粗黑框镜；白衬衫扣到顶不穿外套；合着的笔记本；正面，嘴角往下 |
| 6 | 佟建民 组织部长 57 | 矮胖，脖子短；**头发稀疏贴头皮**，发际线退到头顶；浮肿脸；**老花镜推在额头上**；毛背心套衬衫；一份名单；手托腮 |

```
Character line-up sheet: six different Chinese people (Han Chinese, East Asian features throughout), arranged in a 3 by 2 grid of equal cells, each cell a head-and-shoulders portrait cropped at mid-chest on plain pale paper, no borders, no labels, no numbers. The six must look like six unrelated people: different hairline and hair colour, different age, different build, different collar, different pose. Treat each cell as a separate sitter drawn on a separate day.
Cell 1: a broad-shouldered man of 53 with a high forehead and grey temples, hair combed straight back; square face; no glasses; charcoal suit, white shirt, no tie; a fountain pen in one hand; facing almost straight on, eyes looking past the viewer.
Cell 2: a plump ruddy man of 56 with a full head of thick white hair swept back; round face; no glasses; navy suit and a red tie; a teacup raised to his lips hiding his chin; smiling at someone off frame.
Cell 3: a tall thin man of 55, bald on top with sparse grey hair at the sides; long face; thin metal glasses; grey zip jacket zipped to the throat; a stack of ledgers; head bowed as he turns a page, so mostly the top of his head and the bridge of his nose are seen.
Cell 4: a man of 50 of medium build with hair dyed an unnaturally solid black, not one strand loose; long face; no glasses; black suit and dark tie; arms folded, hands empty; in strict profile, nose toward the left edge.
Cell 5: a thin man of 54 with high cheekbones and a salt-and-pepper crew cut; gaunt face; heavy black-framed glasses; white shirt buttoned to the collar, no jacket; a closed notebook; facing front, mouth turned down.
Cell 6: a short heavy man of 57 with a short neck, hair thin and plastered flat, hairline retreated to the crown; puffy face; reading glasses pushed up onto his forehead; knitted vest over a shirt; a single sheet of names; chin resting on his hand.
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, faces rendered plainly.
```

### 线阵 2 · 班子（二）与市委办

`python3 art.py --sheet assets/原图/线阵2.png 3x2 p_zhengfa,p_xuanchuan,p_mishuzhang,p_tongzhan,p_fuzhuren,p_msz_mishu`

| 格 | 谁 | 一句话 |
|---|---|---|
| 1 | 韩树声 政法委书记 55 | 粗壮、粗脖子；**黑白参半的板寸**；国字脸；不戴镜；黑皮夹克；**手机贴在耳朵上遮住半张脸**；眼睛看地 |
| 2 | 方静仪 宣传部长 45 | 女，瘦，窄肩；**齐耳短发带卷，额前一缕白**；细框镜；米色开衫套衬衫领；折起的报纸；皱眉看画外 |
| 3 | 邱仲华 秘书长 56 | 佝偻窄肩；**全白稀发往后梳，露头皮**；凹陷长脸；不戴镜；旧西装针织领带；双手交叠露旧手表；正面，眼神礼貌地看别处 |
| 4 | 纪守望 统战部长 50 | 矮胖圆肩；**头发少而卷、发亮**；圆脸；不戴镜；深灰夹克敞开、无领衫；两指递出一张名片；**仰着头眯眼笑** |
| 5 | 施培南 市委办副主任 46 | 肩方、身板挺；头发短、梳得一丝不乱、**两鬓刮青**；端正的脸；不戴镜；只穿雪白衬衫扣到领口；文件夹夹在腋下；下巴微抬 |
| 6 | 冯小舟 秘书长的秘书 32 | 瘦小；**黑发厚、刘海压眉**；圆润光滑的脸；不戴镜；白衬衫外套深色针织背心；带盖保温杯双手捧着；讨好又警觉地看人 |

```
Character line-up sheet: six different Chinese people (Han Chinese, East Asian features throughout), arranged in a 3 by 2 grid of equal cells, each cell a head-and-shoulders portrait cropped at mid-chest on plain pale paper, no borders, no labels, no numbers. The six must look like six unrelated people: different hairline and hair colour, different age, different build, different collar, different pose. Treat each cell as a separate sitter drawn on a separate day.
Cell 1: a thick-necked burly man of 55 with a salt-and-pepper flat-top crew cut; square jaw; no glasses; black leather jacket; a mobile phone pressed to his ear hiding half his face; eyes on the floor.
Cell 2: a thin narrow-shouldered woman of 45 with a wavy ear-length bob and one white lock at the front; thin-rimmed glasses; beige cardigan over a collared blouse; a folded newspaper; frowning at something off frame.
Cell 3: a stooped narrow-shouldered man of 56 with sparse pure-white hair combed back over a visible scalp; hollow long face; no glasses; an old suit with a knitted tie; hands folded showing an old wristwatch; facing front, eyes politely elsewhere.
Cell 4: a short round-shouldered man of 50 with thin, curly, glossy hair; round face; no glasses; dark grey jacket open over a collarless shirt; a business card held out between two fingers; head tilted back, eyes narrowed in a laugh.
Cell 5: an upright square-shouldered man of 46 with short hair combed flat and the sides shaved close; even features; no glasses; only a spotless white shirt buttoned to the collar, no jacket; a slim folder under one arm; chin slightly raised.
Cell 6: a slight young man of 32 with thick black hair and a fringe down to his brows; smooth round face; no glasses; white shirt under a dark knitted vest; a lidded thermos cup cradled in both hands; an eager, watchful look.
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, faces rendered plainly.
```

### 线阵 3 · 区县一把手

`python3 art.py --sheet assets/原图/线阵3.png 3x2 p_chengguan,p_gaoxin,p_gangkou,p_qingchuan,p_baisha,p_meiling`

| 格 | 谁 | 一句话 |
|---|---|---|
| 1 | 邵国栋 城关区委书记 52 | 壮、黝黑；**剃青的光头**；方脸粗眉；不戴镜；藏青棉工装立领拉开；一副棉线手套攥在手里；正面，眼神斜向一边 |
| 2 | 吴敬之 高新区委书记 42 | 精瘦、肩方；**浓密黑发抓过发胶**（允许的三个之一）；脸窄；不戴镜；修身西装、雪白领、窄领带；激光笔；身体前倾指向画外 |
| 3 | 崔延平 港口区委书记 46 | 瘦；**发际线后退、太阳穴凹**，眼下青黑；不戴镜；白衬衫挽到肘；旧手机攥紧；**转过身回头看**，肩膀挡住半张脸 |
| 4 | 马汉江 青川县委书记 52 | 宽背厚肩；**头发被安全帽压出一圈印**，硬而短；不戴镜；黑工装拉到下巴；黄安全帽夹在臂弯；**侧背，只露三分之一脸** |
| 5 | 程一鸣 白沙县委书记 38 | 瘦、晒黑、窄肩；**平头**；不戴镜；冲锋衣拉链露格子衬衫领；卷成筒的塑料文件夹；平视画外 |
| 6 | 贺兰生 梅岭县委书记 59 | 肩塌、瘦；**头发稀而全白**；深眼袋、眼角褶子深；不戴镜；毛背心套软领衬衫；搪瓷缸双手捧；眼半垂 |

```
Character line-up sheet: six different Chinese people (Han Chinese, East Asian features throughout), arranged in a 3 by 2 grid of equal cells, each cell a head-and-shoulders portrait cropped at mid-chest on plain pale paper, no borders, no labels, no numbers. The six must look like six unrelated people: different hairline and hair colour, different age, different build, different collar, different pose. Treat each cell as a separate sitter drawn on a separate day.
Cell 1: a sturdy weather-darkened man of 52 with a shaved head; square face, heavy brows; no glasses; navy padded work coat, standing collar unzipped; a pair of cotton work gloves gripped in one hand; facing front, eyes slid to one side.
Cell 2: a lean square-shouldered man of 42 with thick black hair set with gel; narrow face; no glasses; close-fitted suit, crisp white collar, narrow tie; a laser pointer; leaning forward and pointing out of frame.
Cell 3: a thin man of 46 with a receding hairline, sunken temples and dark circles under the eyes; no glasses; white shirt with sleeves rolled to the elbow; an old phone gripped tight; turned away and looking back over his shoulder, the shoulder hiding half the face.
Cell 4: a broad-backed heavy-shouldered man of 52, coarse short hair pressed flat in a ring where a hard hat has been; no glasses; black work jacket zipped to the chin; a yellow hard hat in the crook of his arm; seen mostly from behind, a third of the face showing.
Cell 5: a thin sun-darkened narrow-shouldered man of 38 with a plain buzz cut; no glasses; zip shell jacket open over a checked shirt collar; a plastic document folder rolled into a tube; level gaze off frame.
Cell 6: a thin slump-shouldered man of 59 with sparse pure-white hair; heavy bags under the eyes, deep creases at the corners; no glasses; knitted wool vest over a soft-collared shirt; an old enamel mug held in both hands; eyes half-lowered.
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, faces rendered plainly.
```

### 线阵 4 · 干部池（一）

`python3 art.py --sheet assets/原图/线阵4.png 3x2 p_cg_quzhang,p_qc_xianzhang,p_keshang,p_bs_fuxian,p_dev_a,p_fagai`

| 格 | 谁 | 一句话 |
|---|---|---|
| 1 | 郑大林 城关区长 51 | 厚肩、宽脸肉多；**头发梳平抹得发亮**，中分；不戴镜；深夹克开领；牛皮纸袋平抱在胸口；转身回头，警惕 |
| 2 | 杜怀远 青川县长 47 | 窄肩；**头发短而稀，露出发旋**；长脸凹陷；细金属镜；深夹克里衬衫扣到顶；双手空握；前倾低头 |
| 3 | 葛守业 综合科长 44 | 软胖、圆肩、疲惫；**头发油腻贴着**；**老花镜挂在鼻尖上**；短袖衬衫口袋鼓、袖口一块墨迹（全套唯一露小臂）；红笔；几乎正面，眼旁移 |
| 4 | 秦振声 白沙常务副县长 56 | 方厚肩、饱经风霜；**浓灰眉、粗硬花白短发**；不戴镜；旧西装无领带、领子敞着；一叠卷边纸夹腋下；侧背三分之一 |
| 5 | 赵总 开发商 55 | 壮、粗脖子、宽脸；**头发剃到头皮、发青**；不戴镜；深色 polo 领子立着；手腕一串佛珠举到胸口；咧嘴笑 |
| 6 | 曹世昌 发改委主任 53 **新** | 高瘦；**花白头发中分**，垂到耳上；金丝镜；深色西装、领带打得很紧；一块平板电脑；侧身四分之三、眼睛看平板 |

```
Character line-up sheet: six different Chinese people (Han Chinese, East Asian features throughout), arranged in a 3 by 2 grid of equal cells, each cell a head-and-shoulders portrait cropped at mid-chest on plain pale paper, no borders, no labels, no numbers. The six must look like six unrelated people: different hairline and hair colour, different age, different build, different collar, different pose. Treat each cell as a separate sitter drawn on a separate day.
Cell 1: a thick-shouldered fleshy-faced man of 51 with hair combed flat and glossy with oil, parted in the middle; no glasses; dark jacket open at the collar; a fat kraft envelope held flat against his chest; turning to look back, wary.
Cell 2: a narrow-shouldered man of 47 with short thin hair showing the crown; long hollow face; thin metal glasses; dark jacket over a shirt buttoned to the top; hands clasped and empty; leaning forward with head bowed.
Cell 3: a soft heavy round-shouldered man of 44 with greasy hair stuck flat; reading glasses sitting on the tip of his nose; short-sleeved office shirt with a bulging breast pocket and an ink stain at the cuff, bare forearms; a red pen; almost facing front, eyes slid aside.
Cell 4: a square heavy-shouldered deeply weathered man of 56 with thick grey eyebrows and coarse bristly grey hair; no glasses; an old suit jacket over a shirt with the collar open, no tie; a sheaf of dog-eared papers under one arm; seen mostly from behind, a third of the face showing.
Cell 5: a thick-necked wide-faced heavy man of 55 with hair clipped down to the scalp; no glasses; dark polo shirt with the collar standing up; a string of prayer beads on the wrist raised to chest height; a broad open grin.
Cell 6: a tall thin man of 53 with grey hair parted in the middle and falling to the tops of his ears; gold-rimmed glasses; dark suit, tie pulled tight; a tablet computer; three-quarter turn, eyes on the tablet.
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, faces rendered plainly.
```

### 线阵 5 · 干部池（二）

`python3 art.py --sheet assets/原图/线阵5.png 3x2 p_zhujian,p_caizheng,p_gongan,p_guazhi,p_gk_fuquzhang,p_me`

| 格 | 谁 | 一句话 |
|---|---|---|
| 1 | 卢志高 住建局长 50 **新** | 矮壮、皮肤黑；**浓密黑发侧分**（允许的三个之一）；不戴镜；棕色皮夹克；一卷图纸筒扛在肩上；正面，眉毛挑着 |
| 2 | 阮学文 财政局长 54 **新** | 清瘦；**白发多过黑发，剪得很短**；不戴镜；灰毛衣露衬衫领；一只旧计算器；侧脸四分之三，嘴抿着 |
| 3 | 童大勇 公安局长 52 **新** | 粗壮、肩宽；**黑色板寸**；方脸；不戴镜；深蓝夹克拉到胸口；对讲机拿在手里；**双臂抱胸正面**，下巴收着 |
| 4 | 白重远 挂职副市长人选 41 **新** | 高、挺拔；**浓密黑发**（允许的三个之一），发型规整；无框镜；修身深西装、浅蓝衬衫；黑色公文包提手露在画面下沿；侧脸，看向远处 |
| 5 | 蒋明礼 港口区常务副区长 49 **新** | 微胖；**头发稀，前额光**；不戴镜；黑色羽绒马甲套衬衫；一串钥匙拎在手里；**背对，扭头** |
| 6 | 刘峥 你 29 | 清瘦；黑短发普通；不戴镜；白衬衫、领口第一颗扣子解开；厚文件夹抱在胸口；正面偏侧，眼神清醒。**这一格照现有 `p_me` 出**，只是让它跟另外五个人在同一张纸上 |

```
Character line-up sheet: six different Chinese people (Han Chinese, East Asian features throughout), arranged in a 3 by 2 grid of equal cells, each cell a head-and-shoulders portrait cropped at mid-chest on plain pale paper, no borders, no labels, no numbers. The six must look like six unrelated people: different hairline and hair colour, different age, different build, different collar, different pose. Treat each cell as a separate sitter drawn on a separate day.
Cell 1: a short stocky dark-skinned man of 50 with thick black side-parted hair; no glasses; brown leather jacket; a roll of drawings carried on his shoulder; facing front, one eyebrow raised.
Cell 2: a lean man of 54 whose short-cropped hair is more white than black; no glasses; grey sweater with a shirt collar showing; an old desk calculator; three-quarter turn, lips pressed together.
Cell 3: a burly broad-shouldered man of 52 with a black flat-top crew cut; square face; no glasses; dark blue jacket zipped to the chest; a handheld radio; arms folded across the chest, facing front, chin tucked.
Cell 4: a tall upright man of 41 with thick, neatly cut black hair; rimless glasses; slim dark suit, light blue shirt; the handle of a black briefcase showing at the bottom edge; in profile, looking into the distance.
Cell 5: a slightly plump man of 49 with thin hair and a bare forehead; no glasses; black down vest over a shirt; a bunch of keys dangling from his hand; seen from behind, head turned back.
Cell 6: a slim young man of 29 with ordinary short black hair; no glasses; white shirt with the top button undone; a thick document folder held against his chest; facing slightly to one side, eyes clear and alert.
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, faces rendered plainly.
```

### 线阵 6 · 家里和那两个人

`python3 art.py --sheet assets/原图/线阵6.png 3x1 p_wife,p_sister,p_her`

三个女性单独一张，3 列 1 行，尺寸 1536×512。三个人年龄相近，差别全靠头发和衣服：一个扎紧、一个别耳后、一个松松束在脑后。

| 格 | 谁 | 一句话 |
|---|---|---|
| 1 | 周雪 爱人 30 | 瘦；**头发扎得很紧、贴着头皮**；不戴镜；淡蓝护士服，胸前别倒着的怀表；空手；疲惫地看向一边 |
| 2 | 刘敏 妹妹 27 | 瘦小；**及肩直发别在一只耳朵后**；圆脸；不戴镜；浅色西装外套套素色衬衫；文件夹双手抱胸；正面，眼睛看向窗那边 |
| 3 | 林岫 宣传部借调 30 | 纤细；**头发松松束在脑后，几缕散着**；不戴镜；软领衬衫；指尖搭着一只刚放下的玻璃杯；半转身像要走，只留侧后脸 |

```
Character line-up sheet: three different Chinese women (Han Chinese, East Asian features throughout), arranged in a single row of three equal cells, each cell a head-and-shoulders portrait cropped at mid-chest on plain pale paper, no borders, no labels. The three must read as three unrelated people through hair and dress alone.
Cell 1: a thin woman of 30 with hair pulled back tight and flat to the skull; no glasses; pale blue nurse's scrubs with a fob watch pinned upside down at the chest; empty hands; looking wearily to one side.
Cell 2: a slight woman of 27 with straight shoulder-length hair tucked behind one ear; round face; no glasses; light-coloured office blazer over a plain blouse; a folder hugged to her chest with both hands; facing front, eyes toward a window off frame.
Cell 3: a slender woman of 30 with hair loosely gathered at the back, a few strands loose; no glasses; a blouse with a soft collar; fingertips resting on a glass of hot water just set down; half turned away as if leaving, face in lost profile.
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, faces rendered plainly.
```

## 四之二、第一轮结果（2026-09-25 上午）

六张线阵图出完，33 张头像拼在一起看：**千篇一律的问题解决了**。发型、年龄、体型、姿势全拉开了，眯着眼能分出人。

暴露了一个新问题：prompt 里没写「中国人」，有 9 张画成了白人或南亚人——阮学文、施培南、林岫、邱仲华、纪守望、周雪、方静仪、韩树声、卢志高。v1.6 那句「Chinese reportage illustration」被去掉之后，模型就没有任何理由把人画成中国人。上面的头尾已经补了「Chinese, East Asian features」，这九个人按下面这一张 3×3 补出：

`python3 art.py --sheet assets/原图/线阵7.png 3x3 p_caizheng,p_fuzhuren,p_her,p_mishuzhang,p_tongzhan,p_wife,p_xuanchuan,p_zhengfa,p_zhujian`

尺寸 1536×1536。

```
Character line-up sheet: nine different Chinese people (Han Chinese, East Asian features throughout, black or grey hair only), arranged in a 3 by 3 grid of equal cells, each cell a head-and-shoulders portrait cropped at mid-chest on plain pale paper, no borders, no labels, no numbers. The nine must look like nine unrelated people: different hairline and hair colour, different age, different build, different collar, different pose. Treat each cell as a separate sitter drawn on a separate day.
Cell 1: a lean Chinese man of 54 whose short-cropped hair is more white than black; no glasses; grey sweater with a shirt collar showing; an old desk calculator; three-quarter turn, lips pressed together.
Cell 2: an upright square-shouldered Chinese man of 46 with short black hair combed flat and the sides shaved close; even features; no glasses; only a spotless white shirt buttoned to the collar, no jacket; a slim folder under one arm; chin slightly raised.
Cell 3: a slender Chinese woman of 30 with black hair loosely gathered at the back, a few strands loose; no glasses; a blouse with a soft collar; fingertips resting on a glass of hot water just set down; half turned away as if leaving, face in lost profile.
Cell 4: a stooped narrow-shouldered Chinese man of 56 with sparse pure-white hair combed back over a visible scalp; hollow long face; no glasses; an old suit with a knitted tie; hands folded showing an old wristwatch; facing front, eyes politely elsewhere.
Cell 5: a short round-shouldered Chinese man of 50 with thin, slightly wavy, glossy black hair; round face; no glasses; dark grey jacket open over a collarless shirt; a business card held out between two fingers; head tilted back, eyes narrowed in a laugh.
Cell 6: a thin Chinese woman of 30 with black hair pulled back tight and flat to the skull; no glasses; pale blue nurse's scrubs with a fob watch pinned upside down at the chest; empty hands; looking wearily to one side.
Cell 7: a thin narrow-shouldered Chinese woman of 45 with a black ear-length bob and one white lock at the front; thin-rimmed glasses; beige cardigan over a collared blouse; a folded newspaper; frowning at something off frame.
Cell 8: a thick-necked burly Chinese man of 55 with a salt-and-pepper flat-top crew cut; square jaw; no glasses; black leather jacket; a mobile phone pressed to his ear hiding half his face; eyes on the floor.
Cell 9: a short stocky dark-skinned Chinese man of 50 with thick black side-parted hair; no glasses; brown leather jacket; a roll of drawings carried on his shoulder; facing front, one eyebrow raised.
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, faces rendered plainly.
```

其余 24 张头像和两张结局图（`e_yunzhou` `e_struck`）都过了，不动。

## 五、单张返修

线阵图里哪一格不像，单独重出那一个。单张 prompt 的结构和线阵图一样：**人在前，风格在后，不带参考图**。

```
A head-and-shoulders portrait cropped at mid-chest on plain pale paper, one Chinese sitter only (Han Chinese, East Asian features):
<把那一格的英文原样贴在这里>
Drawn as pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent at most, quiet documentary mood, face rendered plainly.
```

出来存成 `assets/原图/p_<id>.source.png`，跑 `python3 art.py p_<id>` 落盘。

出来还是那张脸，先看两条：是不是又带了参考图；是不是把风格那段挪到前面去了。

## 六、两张新结局图（1536×400）

拔钉子加了两个结局，结局图跟着补。场景和结局图的老规矩不变（后缀 C、上下顶边、30% 留白），只把内容那句挪到最前面。

### `e_yunzhou.webp` · 云州是他的了

```
Two men walking away from the viewer along the path across a municipal party committee courtyard at dusk, twenty metres apart, the older one in front with his hands behind his back, the younger following with a folder; the big camphor tree by the gate; a single lit window in the office block behind them.
Wide panoramic composition filling the frame edge to edge, drawing running all the way to the top and bottom edges. At least 30% bare pale paper that belongs to the scene (sky, wall, ground). Even soft light, no glow.
Pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent, quiet documentary mood. No legible text.
```

### `e_struck.webp` · 他们先动了手

```
A plain talking room on the third floor of a guesthouse, window facing north with flat grey light, a table with a glass of water, a man seen from behind sitting on the near side, two empty chairs on the far side, a closed door with a strip of daylight under it.
Wide panoramic composition filling the frame edge to edge, drawing running all the way to the top and bottom edges. At least 30% bare pale paper that belongs to the scene (wall, floor). Even soft light, no glow.
Pen-and-ink line with light watercolor wash on warm off-white paper, thin uniform line, flat washes, ink black / warm grey / ochre with one small vermilion accent, quiet documentary mood. No legible text.
```

## 七、场景横幅：这轮不重出

十六张场景拼在一起看，问题不大：外景各是各的。室内那几张（办公室、秘书办公室、深夜、招待所、档案室）共用同一套家具——软包皮门、绿植、三人沙发、挂画——这是同一栋楼，本来就该像。将来要动，只改一条：室内每张指定一样别处没有的东西（档案室的铁皮柜、招待所的热水瓶、深夜的台灯），别再写「office interior」。

## 八、清单变化

| | v1.6 | v1.7 |
|---|---|---|
| 头像 | 27 | **33**（加曹世昌、卢志高、阮学文、童大勇、白重远、蒋明礼；拔钉子之后这六个人露面多了） |
| 结局图 | 10 | **12**（加 `e_yunzhou` `e_struck`） |
| 场景 | 16 | 16 |
| 封面 | 1 | 1 |
| 出图方式 | 一张一张 | 头像走线阵图，六张出完 |
| 参考图 | 每张都喂 | 头像一律不喂 |

拔钉子里接手的人（范平、陆文光、温从周、周斌、沈慧、韩一鸣）没有 id，界面上不画头像，不用出。
