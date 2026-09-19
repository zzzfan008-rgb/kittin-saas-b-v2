import json
from PIL import Image
def lum(rgb):
    def f(c):
        c = c/255
        return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
    r,g,b = (f(v) for v in rgb[:3])
    return 0.2126*r + 0.7152*g + 0.0722*b
def contrast(a,b):
    la,lb = lum(a), lum(b)
    hi,lo = max(la,lb), min(la,lb)
    return (hi+0.05)/(lo+0.05)
d = json.load(open("/tmp/gc-uiqa-v4/results-cta-enabled.json"))
for theme, e in d.items():
    img = Image.open(e["screenshot"]).convert("RGB")
    bx, by, bw, bh = e["runButton"]["rect"]
    nx, ny, nw, nh = e["node"]
    # 截图是节点局部（原点为 node.x-6, node.y-6）
    px = img.getpixel((bx - (nx - 6) + bw//4, by - (ny - 6) + bh//2))
    card = img.getpixel((bx - (nx - 6) + bw//4, by - (ny - 6) - 14))
    left_border = img.getpixel((5, by - (ny - 6) + bh//2))
    print(f"{theme:8s} accent={e['accent']:9s} CTA 实测像素={px} (声明 {e['runButton']['bg']}) 文字={e['runButton']['color']}")
    print(f"         CTA vs 节点卡底色{card} → 对比度 {contrast(px, card):.2f}:1 | 节点卡左边缘像素={left_border}")
    print(f"         截图 {e['screenshot']}  节点卡边框(selected) 期望=accent")
