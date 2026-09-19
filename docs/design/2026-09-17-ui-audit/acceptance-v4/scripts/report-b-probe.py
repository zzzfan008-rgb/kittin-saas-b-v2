import json
d = json.load(open("/tmp/gc-uiqa-v4/results-b-probe.json"))
print("B1 启用态按钮:", json.dumps(d["b1"], ensure_ascii=False))
for t, v in d["themes"].items():
    h = v.get("handle") or {}
    print(f"--- {t} handle.background:", (h.get("background") or "")[:150])
    print(f"    {t} handle.boxShadow:", (h.get("boxShadow") or "")[:150])
    print(f"    {t} selection:", json.dumps(v.get("selection"), ensure_ascii=False))
    print(f"    {t} connection.stroke:", (v.get("connection") or {}).get("stroke"))
dev = d["develop"]
print("develop gridlines:", (dev.get("gridlines") or {}).get("backgroundImage", "")[:120])
print("develop scanline:", (dev.get("scanline") or {}).get("background", "")[:120])
print("develop hexHits count:", len(dev.get("hexHits") or []))
for h in (dev.get("hexHits") or [])[:6]:
    print("   ", h["cls"], "|", h["value"][:90])

def lum(rgb):
    def f(c):
        c = c/255
        return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
    r,g,b = (f(v) for v in rgb)
    return 0.2126*r + 0.7152*g + 0.0722*b
def contrast(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi+0.05)/(lo+0.05)
print()
print("B1 前景/背景对比度核对（计算值）：")
print("  #0a0a0a on #B7F35A(当前曜黑实测 bg) =", round(contrast((10,10,10),(183,243,90)),2))
print("  #0a0a0a on #0071e3(简白 accent)   =", round(contrast((10,10,10),(0,113,227)),2))
print("  #0a0a0a on #0B7A43(护眼 accent)   =", round(contrast((10,10,10),(11,122,67)),2))
print("  对比：token --gc-accent-cta-ink=#ffffff on #0071e3 =", round(contrast((255,255,255),(0,113,227)),2), "| on #0B7A43 =", round(contrast((255,255,255),(11,122,67)),2))
