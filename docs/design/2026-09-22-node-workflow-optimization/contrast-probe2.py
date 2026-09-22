#!/usr/bin/env python3
"""补充探针：小地图节点候选色 / amber-500 / 状态语义色 on 白与 eye 画布。"""

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
    ("小地图候选: 曜黑 --gc-border #33373f on #16181d", hx('#33373f'), hx('#16181d')),
    ("小地图候选: 白 rgba(0,0,0,.30) 合成 on #f5f5f7", blend('#000000', 0.30, '#f5f5f7'), hx('#f5f5f7')),
    ("小地图候选: 白 rgba(0,0,0,.35) 合成 on #f5f5f7", blend('#000000', 0.35, '#f5f5f7'), hx('#f5f5f7')),
    ("小地图候选: eye #6d8d7c on #E9F1EA", hx('#6d8d7c'), hx('#E9F1EA')),
    ("小地图候选: eye #47685A(--gc-text-muted) on #E9F1EA", hx('#47685A'), hx('#E9F1EA')),
    ("可用态候选: --gc-status-success dark #34d399 on 白", hx('#34d399'), hx('#ffffff')),
    ("不可用态候选: amber-500 #f59e0b on 白", hx('#f59e0b'), hx('#ffffff')),
    ("不可用态候选: --gc-warn-text eye #92600a on 白", hx('#92600a'), hx('#ffffff')),
    ("不可用态候选: --gc-warn-text white #b45309 on 白", hx('#b45309'), hx('#ffffff')),
    ("参照: --gc-status-retry white #ea8a00 on 白（B5 同源先例）", hx('#ea8a00'), hx('#ffffff')),
]

print(f"{'场景':<52} {'对比度':>7}  3:1 判定")
print('-' * 74)
for desc, fg, bg in CASES:
    r = contrast(fg, bg)
    print(f"{desc:<52} {r:>6.2f}:1  {'PASS' if r >= 3.0 else 'FAIL'}")
