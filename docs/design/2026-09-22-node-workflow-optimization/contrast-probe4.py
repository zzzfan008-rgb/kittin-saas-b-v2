#!/usr/bin/env python3
"""第四轮：曜黑小地图节点色候选 + eye/white 最终候选定值验证。"""

def srgb_to_lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def lum(rgb):
    return 0.2126 * srgb_to_lin(rgb[0]) + 0.7152 * srgb_to_lin(rgb[1]) + 0.0722 * srgb_to_lin(rgb[2])

def contrast(fg, bg):
    l1, l2 = sorted((lum(fg), lum(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)

def hx(s):
    s = s.lstrip('#')
    return tuple(int(s[i:i+2], 16) for i in (0, 2, 4))

def blend(fg, alpha, bg):
    f, b = hx(fg), hx(bg)
    return tuple(round(f[i] * alpha + b[i] * (1 - alpha)) for i in range(3))

CASES = [
    ("曜黑 现状 --gc-border #33373f on #16181d", hx('#33373f'), hx('#16181d')),
    ("曜黑 候选 --gc-border-strong #454a53 on #16181d", hx('#454a53'), hx('#16181d')),
    ("曜黑 候选 --gc-text-muted #9ba1a9 on #16181d", hx('#9ba1a9'), hx('#16181d')),
    ("曜黑 候选 --gc-edge #B7F35A 25% 合成 on #16181d", blend('#B7F35A', 0.25, '#16181d'), hx('#16181d')),
    ("eye 最终候选 --gc-border-strong→text-muted #47685A on #E9F1EA", hx('#47685A'), hx('#E9F1EA')),
    ("eye 备选 #6d8d7c on #E9F1EA", hx('#6d8d7c'), hx('#E9F1EA')),
    ("white 最终候选 rgba(0,0,0,.45) 合成 on #f5f5f7", blend('#000000', 0.45, '#f5f5f7'), hx('#f5f5f7')),
    ("white 备选 --gc-text-muted #6e6e73 on #f5f5f7", hx('#6e6e73'), hx('#f5f5f7')),
    ("white 边框不变 rgba(0,0,0,.16) 合成 (对照)", blend('#000000', 0.16, '#f5f5f7'), hx('#f5f5f7')),
    ("RefOrdinalBadge 白边 1.5px on 黑底徽章 rgba(0,0,0,.62)合成于白卡", blend('#000000', 0.62, '#ffffff'), hx('#ffffff')),
]

print(f"{'场景':<58} {'对比度':>7}  3:1 判定")
print('-' * 80)
for desc, fg, bg in CASES:
    r = contrast(fg, bg)
    print(f"{desc:<58} {r:>6.2f}:1  {'PASS' if r >= 3.0 else 'FAIL'}")
