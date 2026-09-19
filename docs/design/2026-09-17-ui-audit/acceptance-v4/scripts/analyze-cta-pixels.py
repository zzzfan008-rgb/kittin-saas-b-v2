import json
from PIL import Image
d = json.load(open("/tmp/gc-uiqa-v4/results-cta.json"))
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
for theme in ("current","white","eye"):
    e = d[theme]
    img = Image.open(e["screenshot"]).convert("RGB")
    btn = [b for b in e["buttons"] if b["text"] == "保存全部到文件夹"][0]
    x,y,w,h = btn["rect"]
    px = img.getpixel((x + w//2, y + h//2))
    canvas = img.getpixel((x + w//2, y + h + 60))
    print(f"{theme:8s} accent={e['accent']:9s} 按钮实测像素={px} 声明背景={btn['bg']} 文字={btn['color']}")
    print(f"         按钮 vs 画布底色({canvas}) 对比度 = {contrast(px, canvas):.2f}:1")
