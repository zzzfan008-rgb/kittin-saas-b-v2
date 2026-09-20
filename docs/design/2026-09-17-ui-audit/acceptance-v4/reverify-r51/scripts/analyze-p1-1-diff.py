"""P1-1：登录页三主题截图的像素差异定位（回答「md5 不同是否=换肤」）。"""
import sys
from PIL import Image, ImageChops

OUT = "/tmp/gc-uiqa-r51/shots"
paths = {t: f"{OUT}/p1-1-login-{t}-1280.png" for t in ("current", "white", "eye")}
imgs = {t: Image.open(p).convert("RGB") for t, p in paths.items()}
print("sizes:", {t: im.size for t, im in imgs.items()})

def diff_stats(a, b):
    d = ImageChops.difference(a, b)
    bbox = d.getbbox()
    hist = d.histogram()
    # 统计变化像素数
    px = d.load()
    w, h = d.size
    changed = 0
    maxdelta = 0
    samples = []
    for y in range(h):
        for x in range(w):
            r, g, bl = px[x, y]
            m = max(r, g, bl)
            if m > 0:
                changed += 1
                maxdelta = max(maxdelta, m)
                if len(samples) < 6:
                    samples.append((x, y, (r, g, bl), a.getpixel((x, y)), b.getpixel((x, y))))
    return {"bbox": bbox, "changed_px": changed, "max_channel_delta": maxdelta, "samples": samples}

for pair in (("current", "white"), ("current", "eye"), ("white", "eye")):
    print(pair, diff_stats(imgs[pair[0]], imgs[pair[1]]))

# 关键区域采样：卡底 / 品牌区 / 页面底色
for t, im in imgs.items():
    print(t, "card_bg=", im.getpixel((900, 200)), "page_bg=", im.getpixel((640, 700)), "brand_bg=", im.getpixel((200, 400)))
