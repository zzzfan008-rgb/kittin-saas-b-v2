import json

d = json.load(open("/tmp/gc-uiqa-v4/results-focus.json"))
print("errors:", d["errors"])
print("uploaded images visible:", d.get("uploadedImageVisible"))
print()
for e in d["deltas"]:
    if "error" in e:
        print(e["theme"], e["target"], "ERROR", e["error"]); continue
    b, a = e["before"], e["after"]
    changed = []
    for f in ("borderTopColor", "borderLeftColor", "boxShadow", "outline", "backgroundColor"):
        if b[f] != a[f]:
            changed.append(f"{f}: {b[f]} -> {a[f]}")
    print(f"[{e['theme']}] {e['target']:20s} focused={e['focused']} focusVisible={e['focusVisible']} changed={len(changed)}")
    for c in changed[:4]:
        print("      ", c[:180])
    if not changed:
        print(f"       (无变化) border={a['borderTopColor']} shadow={a['boxShadow'][:60]!r} outline={a['outline']}")
    print("       rect:", {k: round(v) for k, v in a["rect"].items()})
print()
print("clips:", json.dumps([{k: c[k] for k in ("theme", "target")} for c in d["clips"]], ensure_ascii=False))
fs = d.get("filledSlotDelta")
if fs and "after" in fs:
    print("filled slot (uploaded img) before/after border:", fs["before"]["borderTopColor"], "->", fs["after"]["borderTopColor"], "| shadow:", fs["after"]["boxShadow"][:80])
