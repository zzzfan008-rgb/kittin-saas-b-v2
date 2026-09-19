import json
from PIL import Image
def lum(rgb):
    def f(c):
        c = c/255
        return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
    r,g,b = (f(v) for v in rgb[:3])
    return 0.2126*r + 0.7152*g + 0.0722*b
def contrast(a,b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la,lb), min(la,lb)
    return (hi+0.05)/(lo+0.05)

img = Image.open("/tmp/gc-uiqa-v4/shots/login-focus-account-1280.png").convert("RGB")
d = json.load(open("/tmp/gc-uiqa-v4/results-probe4.json"))
r = d["loginFocus"]["rect"]
clip_x = max(0, round(r["x"]) - 12)
clip_y = max(0, round(r["y"]) - 12)
edge_local = round(r["x"] - clip_x)
y_mid = round(r["y"] - clip_y + r["height"]/2)
strip = [img.getpixel((x, y_mid)) for x in range(edge_local-4, edge_local+6)]
print("登录页账号输入框左缘像素:", strip)
print("ring halo pixel:", strip[1], "| card bg:", strip[0], "→ 对比度", round(contrast(strip[1], strip[0]),2))
print("border pixel:", strip[4] if len(strip)>4 else None, "| card bg:", strip[0], "→ 对比度", round(contrast(strip[4], strip[0]),2) if len(strip)>4 else None)
