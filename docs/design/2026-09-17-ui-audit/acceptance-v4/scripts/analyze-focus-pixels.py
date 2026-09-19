import json
from PIL import Image

def lum(rgb):
    def f(c):
        c = c / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (f(v) for v in rgb[:3])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

d = json.load(open("/tmp/gc-uiqa-v4/results-focus.json"))
print("=== 缩略图槽聚焦环像素分析（focus-within:ring-2 ring-gold/60）===")
for c in d["clips"]:
    if c["target"] != "thumbSlot":
        continue
    img = Image.open(c["path"]).convert("RGB")
    rect = c["after"]["rect"]
    clip = c["clip"]
    # 元素左边界在 clip 内的 x 偏移；环占据 [x-2, x]
    x_edge = round(rect["x"] - clip["x"])
    y_mid = round(rect["y"] - clip["y"] + rect["height"] / 2)
    strip = [img.getpixel((x, y_mid)) for x in range(max(0, x_edge - 5), min(img.width, x_edge + 5))]
    ring = strip[3] if len(strip) > 3 else None
    outside = strip[0]
    inside = strip[-1]
    print(f"--- {c['theme']}: clip={clip['width']}x{clip['height']} edge_x={x_edge}")
    print(f"    strip(x={x_edge-5}..{x_edge+4}) = {strip}")
    print(f"    环像素 {ring} vs 外侧底色 {outside} → 对比度 {contrast(ring, outside):.2f}:1")
    print(f"    环像素 {ring} vs 槽内底色 {inside} → 对比度 {contrast(ring, inside):.2f}:1")

print()
print("=== chip 提示词板聚焦像素分析（边框是否变化）===")
for c in d["clips"]:
    if c["target"] != "promptChipTextarea":
        continue
    img = Image.open(c["path"]).convert("RGB")
    rect = c["after"]["rect"]
    clip = c["clip"]
    x_edge = round(rect["x"] - clip["x"])
    y_mid = round(rect["y"] - clip["y"] + rect["height"] / 2)
    strip = [img.getpixel((x, y_mid)) for x in range(max(0, x_edge - 4), min(img.width, x_edge + 4))]
    print(f"--- {c['theme']}: strip = {strip}")
    print(f"    边框像素 {strip[3] if len(strip)>3 else None} vs 内部 {strip[-1]} → 对比度 {contrast(strip[3], strip[-1]):.2f}:1")
