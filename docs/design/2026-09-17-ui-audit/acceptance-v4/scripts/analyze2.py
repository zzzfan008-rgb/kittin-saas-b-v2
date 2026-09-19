import json, collections

AUD = "/tmp/gc-uiqa-v4/color-audit"
maps = {t: json.load(open(f"{AUD}/audit-{t}-1280.json")) for t in ("current", "white", "eye")}
keys = set(maps["current"]) & set(maps["white"]) & set(maps["eye"])

def px(w):
    try:
        return float(str(w).replace("px", ""))
    except Exception:
        return 0.0

print("=== 有实宽边框且三主题颜色相同（候选：未 token 化的边框）===")
inv = collections.defaultdict(list)
for k in sorted(keys):
    es = [maps[t][k] for t in ("current", "white", "eye")]
    if px(es[0]["borderTopWidth"]) <= 0 and px(es[0]["borderLeftWidth"]) <= 0:
        continue
    for field in ("borderTop", "borderLeft"):
        vals = {e[field] for e in es}
        if len(vals) == 1 and vals != {"rgba(0, 0, 0, 0)"}:
            inv[field + "=" + next(iter(vals))].append(es[0])
for sig, items in sorted(inv.items(), key=lambda kv: -len(kv[1])):
    e = items[0]
    print(f"  {sig:36s} x{len(items):3d} w={e['borderTopWidth']}/{e['borderLeftWidth']} e.g. <{e['tag']} testid={e['testid']} text={e['text'][:18]!r} cls={e['cls'][:80]!r}>")

print("\n=== 三主题相同且非透明的背景/文字色（排除白/透明/黑白前景）===")
inv2 = collections.defaultdict(list)
for k in sorted(keys):
    es = [maps[t][k] for t in ("current", "white", "eye")]
    for field in ("bg", "color"):
        vals = {e[field] for e in es}
        v = next(iter(vals))
        if len(vals) == 1 and v not in ("rgba(0, 0, 0, 0)", "rgb(255, 255, 255)", "rgb(0, 0, 0)", "rgb(10, 10, 10)"):
            inv2[field + "=" + v].append(es[0])
for sig, items in sorted(inv2.items(), key=lambda kv: -len(kv[1]))[:24]:
    e = items[0]
    print(f"  {sig:30s} x{len(items):3d} e.g. <{e['tag']} testid={e['testid']} text={e['text'][:20]!r} cls={e['cls'][:76]!r}>")

print("\n=== 聚焦环量测（原样） ===")
d = json.load(open("/tmp/gc-uiqa-v4/results-matrix.json"))
for e in d["matrix"]:
    if e["viewport"] != 1280:
        continue
    r = e.get("ringEmptySlot", {})
    c = e.get("chipRing", {})
    print(f"--- {e['theme']}")
    print("   slot:", json.dumps({k: r.get(k) for k in r if k != "cls"}, ensure_ascii=False))
    print("   slot.cls:", (r.get("cls") or "")[:200])
    print("   chip:", json.dumps({k: c.get(k) for k in c if k not in ("cls",)}, ensure_ascii=False))
print("\n=== library 按钮（从素材库选择）hover/静态色 ===")
for e in d["matrix"]:
    if e["viewport"] == 1280:
        print("   ", e["theme"], json.dumps(e.get("libraryButton"), ensure_ascii=False))
