# 《大秘》· 出图 prompt 总表（按清单 v1.6 装配）

每条已把 **全局前缀 A + 对应后缀 + 对齐锚图那句 + 本条内容** 拼好，整段贴进出图工具即可。
锚图一起喂进去当参考：场景比 `s_mishu.webp`，人物比 `p_me.webp` / `p_boss.webp` / `p_mayor.webp`。

## 出图流程

1. 按下面的 prompt 出图，**一律按标准取景出**，不用管顶框还是留白多。
2. 原图（全尺寸 PNG）存进 `assets/原图/`，文件名是 `<目标文件名去掉.webp>.source.png`，例如 `p_jiwei.source.png`。
3. 在项目根目录跑 `python3 art.py`——尺寸、上下空白带、取景档、WebP 压缩它一次全办了。**不要手工缩图。**

**取景靠后期不靠 prompt**：实测出图工具对「头顶顶框 / 留白多 / 侧背」这类构图指令不敏感，所以差别在 `art.py` 的 `FRAME` 表里裁。标题上标了档的，出图时不用特意去够。
**朝向那一维（侧背、扭头）后期造不出来，出不来就算了**，别为它反复重出——真正让 27 张分得开的是服装和手里那件东西。

---

**待出 31 张**，54 张里 23 张已入库。

## 人物头像（27 张，256×336）

### ~~`p_me.webp`~~　已入库

### ~~`p_boss.webp`~~　已入库

### ~~`p_mayor.webp`~~　已入库

### ~~`p_vice1.webp`~~　已入库

### ~~`p_depsec.webp`~~　已入库

### ~~`p_jiwei.webp`~~　已入库

### ~~`p_zuzhi.webp`~~　已入库

### ~~`p_zhengfa.webp`~~　已入库

> 第 1 批

### `p_xuanchuan.webp`　256×336　· 方静仪 · 宣传部长　〔取景：留白多，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's right, framed loose with space above the head, brows drawn together, eyes down. A woman of 45, narrow shoulders, a blunt ear-length haircut, almost no make-up. A soft beige cardigan over a collared blouse. A newspaper folded in half, held at chest height.
```

### `p_mishuzhang.webp`　256×336　· 邱仲华 · 秘书长，56

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Facing nearly straight on with the eyes turned politely aside, standard framing. A thin man of 56, shoulders that slope, hollow cheeks, grey hair combed straight back. An old suit, immaculately pressed, with a knitted tie. Hands folded together in front of him; an old wristwatch showing at the cuff.
```

### `p_tongzhan.webp`　256×336　· 纪守望 · 统战部长　〔取景：顶框，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's left, head close to the top of the frame, an easy half-smile, eyes on someone just off frame. A man of 50, round face, round shoulders, neatly trimmed hair. A mid-grey jacket open over a collarless shirt. A business card held out between two fingers at chest height.
```

### `p_chengguan.webp`　256×336　· 邵国栋 · 城关区委书记，52　〔取景：顶框，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Facing almost straight on with the eyes turned off to one side, head close to the top edge. A man of 52, broad square face, skin coarsened by weather, short bristly hair, heavy shoulders. A navy padded work coat, zip open, collar standing. A pair of cotton work gloves gripped in one hand at chest height.
```

### `p_gaoxin.webp`　256×336　· 吴敬之 · 高新区委书记，42

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's right, standard framing, leaning slightly forward, eyes quick and fixed on something just past the frame. A lean man of 42, shoulders squared, hair short and deliberately styled. A close-fitted suit, crisp white collar, a narrow tie. A slim laser pointer held at chest height.
```

### `p_gangkou.webp`　256×336　· 崔延平 · 港口区委书记，46（前任秘书）　〔取景：留白多，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Head turned sharply to look out of the frame over his shoulder, framed loose with space above. A man of 46, shadows under the eyes, hair receding at the temples, shoulders drawn up and tense. A white shirt, collar open, no tie, sleeves rolled to the elbow so the rolls read at the shoulder line. An old mobile phone gripped tight at chest height.
```

> 第 2 批

### `p_qingchuan.webp`　256×336　· 马汉江 · 青川县委书记，52

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned well away, a third of the back of the head showing, the face barely visible. A man of 52, broad back and heavy shoulders, coarse hair pressed flat in a ring where a hard hat has been. A dark work jacket zipped to the chin. A yellow hard hat carried in one hand at chest height, not worn.
```

### `p_baisha.webp`　256×336　· 程一鸣 · 白沙县委书记，38　〔取景：顶框，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's left, head close to the top of the frame, eyes level and steady on something off frame. A thin, sun-darkened man of 38, narrow shoulders, hair cut plainly and short. A dark zip-front shell jacket with the checked collar of a shirt showing above it. A rolled plastic document folder held at chest height.
```

### `p_meiling.webp`　256×336　· 贺兰生 · 梅岭县委书记，59　〔取景：留白多，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's right, framed loose with generous space above, eyes half-lowered and calm. A thin man of 59, shoulders fallen in, grey hair gone sparse, deep folds at the eyes. A knitted wool vest over a soft-collared shirt, no jacket. An old enamel tea mug held in both hands at chest height.
```

### `p_cg_quzhang.webp`　256×336　· 郑大林 · 城关区长，51

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned away and then looking back over his shoulder toward the viewer's side of the frame, standard framing, wary. A man of 51, broad fleshy face, hair combed flat and shiny, thick through the shoulders. A dark jacket open over an open collar. A fat kraft envelope clutched flat against his chest.
```

### `p_qc_xianzhang.webp`　256×336　· 杜怀远 · 青川县长，47　〔取景：留白多，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's right, framed loose with space above the head, leaning forward a little, eyes down. A man of 47, long face, hollows under the cheekbones, narrow shoulders. A plain dark jacket over a shirt buttoned to the top. Both hands clasped together at chest height, empty.
```

### `p_keshang.webp`　256×336　· 葛守业 · 综合科科长，44　〔取景：顶框，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Facing almost straight on with the eyes turned aside, head crowding the top of the frame. A soft, heavy-set man of 44, round sloping shoulders, a tired face. A short-sleeved office shirt, breast pocket bulging, an ink stain at the cuff — the only bare forearms in the whole set. Reading glasses pushed up onto the forehead. A red pen held at chest height.
```

> 第 3 批

### `p_fuzhuren.webp`　256×336　· 施培南 · 市委办副主任，46

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's left, standard framing, chin slightly raised, eyes past the viewer. A man of 46, even features, shoulders squared and held, hair carefully combed. A spotless, sharply pressed white shirt buttoned to the collar, no jacket at all. A slim folder tucked flat under one arm against the chest.
```

### `p_msz_mishu.webp`　256×336　· 冯小舟 · 秘书长的秘书，32

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's right, standard framing, pleasant and watchful, eyes on someone just off frame. A young man of 32, round smooth face, neat short hair, slight build. A white shirt buttoned at the wrist under a dark knitted vest. A lidded thermos cup cradled in both hands at chest height.
```

### `p_bs_fuxian.webp`　256×336　· 秦振声 · 白沙常务副县长，56　〔取景：留白多，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned well away with a third of the back of the head showing, framed loose with space above, holding back from things. A man of 56, deeply weathered face, heavy grey brows, coarse short hair, square heavy shoulders. An old suit jacket over a plain shirt, no tie, collar open. A sheaf of dog-eared papers wedged under one arm.
```

### `p_wife.webp`　256×336　· 周雪 · 爱人，护士

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's left, standard framing, eyes off to the side, exhausted. A woman of 30, hair pulled back tight and flat to the skull, no make-up, narrow shoulders. Pale blue nurse's scrubs with the top button undone. A nurse's fob watch pinned upside down at the chest.
```

### `p_sister.webp`　256×336　· 刘敏 · 妹妹，27　〔取景：留白多，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Facing almost straight on with the eyes turned toward the window side, framed loose with space above the head. A young woman of 27, round open face, shoulder-length hair tucked behind one ear, slight build. A light-coloured office blazer over a plain blouse. A folder hugged against her chest with both arms.
```

### `p_dev_a.webp`　256×336　· 赵总 · 开发商　〔取景：顶框，art.py 自动裁〕

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Turned three-quarters to the viewer's right, head crowding the top of the frame, a broad easy smile, eyes on the viewer's side without meeting them. A heavy-set man of 55, thick neck, wide face, hair clipped to the scalp. A dark polo shirt with the collar standing up, no jacket. A string of prayer beads on the wrist, the hand raised to chest height.
```

> 第 4 批

### `p_her.webp`　256×336　· 林岫 · 宣传部借调，30

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Head-and-shoulders portrait, cropped at mid-chest, centred horizontally, on a plain pale paper background that is completely empty — no furniture, no scenery, no other people.
The framing, the direction the figure turns and where the eyes go are specified per character and must be followed exactly. Do not default to a three-quarter view; do not default to a downward gaze. Never a full frontal stare into the viewer's eyes. ("No close-up faces" in the style prefix means no extreme face-filling crop — a head-and-shoulders portrait is correct here.)
Identity must read at 52 pixels wide, so it lives in the SILHOUETTE first: shoulder width, posture, head shape, hair volume, collar shape, glasses or none, zip or tie or open neck. Facial detail is invisible at that size and cannot be relied on to tell two characters apart.
Each character carries one object of their own at chest height. That object is part of the silhouette and must be readable as a shape.
Matching the line weight, wash density and overall lightness of the reference set.
Half turned away as if leaving, one shoulder toward the viewer and the face in lost profile, eyes lowered, standard framing. A woman of 30, quiet even features, hair loosely gathered at the back, slim. A plain blouse with a soft collar. A glass of hot water just set down, still held by the fingertips at chest height.
```

---

## 结局图（10 张，1536×400）

> 第 1 批

### `e_rise.webp`　1536×400　· 随书记高升

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
Two men walking side by side toward a provincial government building, the younger one half a step behind carrying documents. Morning.
```

### `e_outpost.webp`　1536×400　· 外放区县长

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A young official standing alone in front of a county government building on a rainy first day, a small suitcase, staff waiting at the door.
```

### `e_province.webp`　1536×400　· 调省委办

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A tall provincial office building at dusk with many lit windows, a small figure entering the gate carrying three boxes on a trolley.
```

### `e_stay.webp`　1536×400　· 留任升副秘书长

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A small secretary's office now empty and tidy, a new nameplate face down on the desk, a larger office door open beyond, south light.
```

### `e_cold.webp`　1536×400　· 新书记的冷板凳

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A quiet archive room with metal shelves and file boxes, a man sitting at a small desk reading a newspaper under a fluorescent light.
```

### `e_replaced.webp`　1536×400　· 换下秘书

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A man carrying a cardboard box down a staircase in a government building, another young man walking up past him.
```

> 第 2 批

### `e_clear.webp`　1536×400　· 书记落马，你全身而退

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A plain interview room with a table, two chairs, a glass of water, barred light from a window. One chair empty, one person seen from behind.
```

### `e_together.webp`　1536×400　· 书记落马，你一起进去

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
An empty secretary's desk with drawers pulled open, phones unplugged, papers gone, a sealed tape across the inner office door.
```

### `e_self_out.webp`　1536×400　· 你自己出事

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A man standing at a third-floor window at night looking down at a car parked below with its lights on, the office lamp still lit behind him.
```

### `e_report.webp`　1536×400　· 实名举报

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A man in a plain coat walking out of a large grey building gate at dusk, empty-handed, long shadow behind him.
```

---

## 封面（1 张，1120×320）

> 第 1 批

### `cover.webp`　1120×320

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A young man in a white shirt carrying a thick document folder, walking down a long quiet corridor of a municipal party committee building at night, one office door at the end left ajar with warm light spilling out. Seen from behind. Vermilion accent only on a red-header document in his hand.
```

---

## 场景横幅（16 张，1536×200）

### ~~`s_city.webp`~~　已入库

### ~~`s_office.webp`~~　已入库

### ~~`s_mishu.webp`~~　已入库

### ~~`s_changwei.webp`~~　已入库

### ~~`s_door.webp`~~　已入库

### ~~`s_dinner.webp`~~　已入库

### ~~`s_car.webp`~~　已入库

### ~~`s_county.webp`~~　已入库

### ~~`s_chemical.webp`~~　已入库

### ~~`s_oldtown.webp`~~　已入库

### ~~`s_petition.webp`~~　已入库

### ~~`s_night.webp`~~　已入库

### ~~`s_archive.webp`~~　已入库

### ~~`s_hotel.webp`~~　已入库

### ~~`s_hospital.webp`~~　已入库

> 第 1 批

### `s_home.webp`　1536×200　· 家里　**⟵ 需重出**

```
Pen-and-ink line drawing with light watercolor wash, in the style of Chinese reportage illustration. Thin uniform pen line, flat washes, minimal shading, no heavy dark masses, not photorealistic. Light overall value key: the darkest area covers less than 15% of the image. Visible paper texture in warm off-white #F3F2EE, left untouched across large areas. Restrained palette: ink black, warm grey, ochre, one small accent of vermilion red. No text or signage legible, no logos, no real landmarks, no close-up faces. Quiet, documentary mood.
Wide panoramic composition. The drawing must run all the way to the top and bottom edges of the frame — no empty band of background above or below it, no letterboxing, no floating vignette. Fill the full stated aspect ratio edge to edge.
At least 30% of the image is bare untouched pale paper, but that paper is part of the scene (a wall, a floor, the sky), not a margin around it.
Even soft light throughout, no dramatic lighting, no strong glow source.
Matching the line weight, wash density and overall lightness of the reference set.
A small apartment at night: a dining table with dinner covered by plates, a child's drawing on the fridge, one lamp on, the door still closed. The entrance door is a plain steel apartment security door with a peephole and a simple lever handle — NOT the padded leather office door used in the government-building scenes.
```
