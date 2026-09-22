#!/usr/bin/env python3
"""第三轮：小地图节点色 / emerald 深档候选补测。"""

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
    ("小地图白: rgba(0,0,0,.45) on #f5f5f7", blend('#000000', 0.45, '#f5f5f7'), hx('#f5f5f7')),
    ("小地图白: rgba(0,0,0,.50) on #f5f5f7", blend('#000000', 0.50, '#f5f5f7'), hx('#f5f5f7')),
    ("小地图白: --gc-text-muted #6e6e73 on #f5f5f7", hx('#6e6e73'), hx('#f5f5f7')),
    ("小地图eye: --gc-border-strong #a8c2ac (备查)", hx('#a8c2ac'), hx('#E9F1EA')),
    ("可用态: emerald-600 #059669 on 白", hx('#059669'), hx('#ffffff')),
    ("可用态: emerald-700 #047857 on 白", hx('#047857'), hx('#ffffff')),
    ("可用态: --gc-status-success white #1d7a3e on 白", hx('#1d7a3e'), hx('#ffffff')),
    ("可用态: --gc-status-success eye #1d7a3e on 白", hx('#1d7a3e'), hx('#ffffff')),
]

print(f"{'场景':<52} {'对比度':>7}  3:1 判定")
print('-' * 74)
for desc, fg, bg in CASES:
    r = contrast(fg, bg)
    print(f"{desc:<52} {r:>6.2f}:1  {'PASS' if r >= 3.0 else 'FAIL'}")
