import json
AUD = "/tmp/gc-uiqa-v4/color-audit"
maps = {t: json.load(open(f"{AUD}/audit-{t}-1280.json")) for t in ("current", "white", "eye")}
keys = set(maps["current"]) & set(maps["white"]) & set(maps["eye"])

print("=== chip 提示词板 textarea 逐主题计算样式 ===")
for k in sorted(keys):
    e = maps["current"][k]
    if e["tag"] != "TEXTAREA":
        continue
    print(f"path={k} cls={e['cls'][:110]}")
    for t in ("current", "white", "eye"):
        x = maps[t][k]
        print(f"   {t:8s} border {x['borderTopWidth']}/{x['borderLeftWidth']} top={x['borderTop']} left={x['borderLeft']} bg={x['bg']} color={x['color']}")

print("\n=== 所有 bg=gold / gold 边框 的残留（白/护眼）===")
for t in ("white", "eye"):
    print(f"--- {t}")
    for k, e in maps[t].items():
        vals = {f: e[f] for f in ("bg", "borderTop", "borderLeft", "color") if "183, 243, 90" in (e[f] or "")}
        if vals:
            print(f"   <{e['tag']} testid={e['testid']} text={e['text'][:16]!r} cls={e['cls'][:90]!r}> {vals}")

print("\n=== 三主题下带有 gold 类名的元素（源码类 → 实测色）===")
for k in sorted(keys):
    e = maps["current"][k]
    if "gold" not in (e["cls"] or ""):
        continue
    print(f"<{e['tag']} text={e['text'][:14]!r} cls={e['cls'][:100]!r}>")
    for t in ("current", "white", "eye"):
        x = maps[t][k]
        print(f"   {t:8s} bg={x['bg']} color={x['color']} borderTop={x['borderTop']} borderLeft={x['borderLeft']}")
