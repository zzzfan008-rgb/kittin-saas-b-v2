import json, re, collections

AUD = "/tmp/gc-uiqa-v4/color-audit"
maps = {}
for t in ("current", "white", "eye"):
    maps[t] = json.load(open(f"{AUD}/audit-{t}-1280.json"))

keys = set(maps["current"]) & set(maps["white"]) & set(maps["eye"])
print("elements present in all three themes:", len(keys), "| per theme:",
      {t: len(maps[t]) for t in maps})

GOLD = "183, 243, 90"

def norm(v):
    return (v or "").strip()

def interesting(v):
    v = norm(v)
    if not v:
        return False
    if v in ("rgba(0, 0, 0, 0)", "none", "normal"):
        return False
    return True

invariants = collections.defaultdict(list)
for k in sorted(keys):
    a, b, c = (maps[t][k] for t in ("current", "white", "eye"))
    for field in ("color", "bg", "borderTop", "borderLeft", "fill"):
        va, vb, vc = norm(a[field]), norm(b[field]), norm(c[field])
        if va == vb == vc and interesting(va):
            invariants[field + "=" + va].append((k, a))
print("\n=== 三主题完全相同的取值（按字段） top 30 ===")
for sig, items in sorted(invariants.items(), key=lambda kv: -len(kv[1]))[:30]:
    sample = items[0][1]
    print(f"  {sig:52s} x{len(items):3d}  e.g. <{sample['tag']} testid={sample['testid']} cls={sample['cls'][:70]!r}>")

print("\n=== 白/护眼主题中仍出现「曜黑荧光绿 rgb(183,243,90)」的元素 ===")
for t in ("current", "white", "eye"):
    hits = []
    for k, e in maps[t].items():
        blob = " | ".join(norm(e[f]) for f in ("color", "bg", "borderTop", "borderLeft", "boxShadow", "fill"))
        if GOLD in blob:
            hits.append((k, e, blob))
    print(f"--- {t}: {len(hits)} 个元素")
    for k, e, blob in hits[:14]:
        fields = {f: norm(e[f]) for f in ("color", "bg", "borderTop", "borderLeft", "fill") if GOLD in norm(e[f])}
        shaded = "boxShadow" if GOLD in norm(e["boxShadow"]) else ""
        print(f"    <{e['tag']} testid={e['testid']} cls={e['cls'][:76]!r}> {fields} {shaded}")

print("\n=== 白/护眼主题里颜色未随主题变化的可见文本色（前 20）===")
for t in ("white", "eye"):
    ctr = collections.Counter()
    ex = {}
    for k, e in maps[t].items():
        cur = maps["current"].get(k)
        if not cur:
            continue
        if norm(e["color"]) == norm(cur["color"]) and e["text"]:
            ctr[e["color"]] += 1
            ex.setdefault(e["color"], e)
    print(f"--- {t}: {len(ctr)} 种与曜黑相同的文字色")
    for color, n in ctr.most_common(12):
        e = ex[color]
        print(f"    {color:24s} x{n:3d} e.g. <{e['tag']} testid={e['testid']} text={e['text'][:18]!r} cls={e['cls'][:60]!r}>")
