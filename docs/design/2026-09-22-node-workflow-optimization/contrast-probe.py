#!/usr/bin/env python3
"""design-plan 引用对比度预计算：只读计算，不产出业务代码。"""

def srgb_to_lin(c: float) -> float:
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(r: int, g: int, b: int) -> float:
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)

def contrast(fg, bg) -> float:
    def parse(c):
        if isinstance(c, tuple):
            return c
        c = c.lstrip('#')
        return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))
    l1, l2 = sorted((luminance(*parse(fg)), luminance(*parse(bg))), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)

def blend(fg, alpha, bg):
    # fg hex 叠加 alpha 后与 bg 合成
    f = tuple(int(fg.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    b = tuple(int(bg.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    return tuple(round(f[i] * alpha + b[i] * (1 - alpha)) for i in range(3))

CASES = [
    # (说明, 前景, 背景, 阈值)
    ("白主题小地图节点 rgba(0,0,0,.08) 合成于画布 #f5f5f7",
     blend('#000000', 0.08, '#f5f5f7'), '#f5f5f7', 3.0),
    ("白主题小地图节点改用 --gc-border-strong rgba(0,0,0,.16) 合成",
     blend('#000000', 0.16, '#f5f5f7'), '#f5f5f7', 3.0),
    ("eye 主题小地图节点 = --gc-border #c9dccc on #E9F1EA",
     '#c9dccc', '#E9F1EA', 3.0),
    ("eye 主题小地图节点改 --gc-border-strong #a8c2ac on #E9F1EA",
     '#a8c2ac', '#E9F1EA', 3.0),
    ("参考图列表 不可用 amber-400 #fbbf24 on 白节点卡 #ffffff",
     '#fbbf24', '#ffffff', 3.0),
    ("参考图列表 可用 emerald-500 #10b981 on #ffffff",
     '#10b981', '#ffffff', 3.0),
    ("改 --gc-warn-text white #b45309 on #ffffff",
     '#b45309', '#ffffff', 3.0),
    ("改 --gc-status-success white #1d7a3e on #ffffff",
     '#1d7a3e', '#ffffff', 3.0),
    ("eye 主题 amber-400 #fbbf24 on 白 #ffffff（同样低）",
     '#fbbf24', '#ffffff', 3.0),
    ("曜黑 连线 --gc-edge #B7F35A on 画布 #16181d（现状参照）",
     '#B7F35A', '#16181d', 3.0),
    ("白主题 连线 #0071e3 on 画布 #f5f5f7（现状参照）",
     '#0071e3', '#f5f5f7', 3.0),
]

print(f"{'场景':<58} {'对比度':>7}  {'阈值':>4}  判定")
print('-' * 84)
for desc, fg, bg, th in CASES:
    r = contrast(fg, bg)
    print(f"{desc:<58} {r:>6.2f}:1 {th:>4.1f}  {'PASS' if r >= th else 'FAIL'}")
