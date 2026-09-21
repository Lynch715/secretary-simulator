#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《大秘》美术流水线：assets/原图/*.source.png  →  assets/*.webp

干三件事：
  1. 按清单 v1.6 的尺寸出图（头像 256×336、场景 1536×200、结局 1536×400、封面 1120×320）
  2. 场景/结局/封面自动裁掉上下空白带（出图工具爱留，不裁的话画幅白费四成）
  3. 头像按 FRAME 表做取景——出图工具对「顶框 / 留白多」这类指令不敏感，
     统一按标准取景出，落盘前在这里裁出差别。标准档不动原图。

用法：
  python3 art.py            只处理 assets/ 里还没有的
  python3 art.py --force    全部重做
  python3 art.py p_jiwei    只做这一个
"""
import sys, os, glob
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(ROOT, 'assets', '原图')
OUT  = os.path.join(ROOT, 'assets')
Q    = dict(quality=88, method=6)

SIZE = {'p': (256, 336), 's': (1536, 200), 'e': (1536, 400), 'c': (1120, 320)}

# 取景档：(缩放, 头顶留白占画面高的比例)。缩放越小 = 裁得越紧 = 人越大
TIER = {'顶框': (0.84, 0.045), '标准': None, '留白多': (1.00, 0.17)}

# 谁是哪一档——照清单 v1.6 的分配，没列出来的一律标准档（不动）
FRAME = {
    '顶框':   ['jiwei', 'tongzhan', 'chengguan', 'baisha', 'keshang', 'dev_a'],
    '留白多': ['vice1', 'xuanchuan', 'meiling', 'gangkou', 'qc_xianzhang',
               'bs_fuxian', 'sister'],
}
TIER_OF = {i: t for t, ids in FRAME.items() for i in ids}


def live_rows(im, thr=3.0):
    """返回内容的上下边界（整行标准差小于 thr 视为纯底）"""
    a = np.asarray(im.convert('L'), dtype=float)
    sd = a.std(axis=1)
    t = 0
    while t < len(sd) and sd[t] < thr:
        t += 1
    b = len(sd)
    while b > t and sd[b - 1] < thr:
        b -= 1
    return t, b


def live_cols(im, thr=3.0):
    a = np.asarray(im.convert('L'), dtype=float)
    sd = a.std(axis=0)
    l = 0
    while l < len(sd) and sd[l] < thr:
        l += 1
    r = len(sd)
    while r > l and sd[r - 1] < thr:
        r -= 1
    return l, r


def do_banner(im, size):
    """场景/结局/封面：以内容为中心按目标比例取一条，顶到边"""
    W, H = im.size
    t, b = live_rows(im)
    band = int(round(W * size[1] / size[0]))
    cy = (t + b) // 2
    y0 = max(0, min(H - band, cy - band // 2))
    return im.crop((0, y0, W, y0 + band)).resize(size, Image.LANCZOS), (t, b)


def do_face(im, size, tier):
    """头像：标准档原样缩放；顶框/留白多按头顶留白重新取景"""
    if TIER.get(tier) is None:
        return im.resize(size, Image.LANCZOS), None
    scale, head = TIER[tier]
    W, H = im.size
    t, _ = live_rows(im)          # 头顶
    l, r = live_cols(im)
    h = int(H * scale)
    w = int(round(h * size[0] / size[1]))
    y0 = int(round(t - head * h))
    y0 = max(0, min(H - h, y0))
    cx = (l + r) // 2
    x0 = max(0, min(W - w, cx - w // 2))
    return im.crop((x0, y0, x0 + w, y0 + h)).resize(size, Image.LANCZOS), \
           (tier, 'scale %.2f  头顶留白 %.0f%%' % (scale, head * 100))


def main():
    only = [a for a in sys.argv[1:] if not a.startswith('-')]
    force = '--force' in sys.argv
    srcs = sorted(glob.glob(os.path.join(SRC, '*.source.png')))
    if not srcs:
        print('assets/原图/ 里没有 *.source.png'); return
    print('%-22s %-10s %-9s %s' % ('输出', '类', '尺寸', '取景 / 活动区'))
    print('-' * 74)
    n = skip = 0
    for s in srcs:
        base = os.path.basename(s).replace('.source.png', '')
        if only and base not in only:
            continue
        dst = os.path.join(OUT, base + '.webp')
        if os.path.exists(dst) and not force and not only:
            skip += 1; continue
        k = 'p' if base.startswith('p_') else \
            's' if base.startswith('s_') else \
            'e' if base.startswith('e_') else 'c'
        im = Image.open(s).convert('RGB')
        if k == 'p':
            tier = TIER_OF.get(base[2:], '标准')
            out, info = do_face(im, SIZE[k], tier)
            note = ('%s · %s' % info) if info else '标准（原样，不动）'
        else:
            out, (t, b) = do_banner(im, SIZE[k])
            note = '活动区 %d–%d / %d' % (t, b, im.size[1])
        out.save(dst, 'WEBP', **Q)
        n += 1
        print('%-22s %-10s %-9s %s' % (base + '.webp',
              {'p': '头像', 's': '场景', 'e': '结局', 'c': '封面'}[k],
              '%dx%d' % SIZE[k], note))
    print('-' * 74)
    print('出 %d 个%s' % (n, ('，跳过 %d 个（已存在，加 --force 重做）' % skip) if skip else ''))


if __name__ == '__main__':
    main()
