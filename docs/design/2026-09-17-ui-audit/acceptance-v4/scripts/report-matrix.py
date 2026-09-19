import json

d = json.load(open("/tmp/gc-uiqa-v4/results-matrix.json"))
extras = d["extras"]
print("=== extras ===")
for k in ["initialTabs", "tabsAfterPattern", "tabsAfterText", "patternTab", "textTab", "variantInjection", "runCount", "imagesRendered", "dockAfterBind"]:
    print(" ", k, "=", json.dumps(extras.get(k), ensure_ascii=False)[:300])
print("  bindVariant.steps =", json.dumps(extras.get("bindVariant", {}).get("steps"), ensure_ascii=False))
print("  presetReasons =", json.dumps(extras.get("bindVariant", {}).get("presetReasons"), ensure_ascii=False))
print("  afterRunStatus =", json.dumps(extras.get("afterRunStatus"), ensure_ascii=False)[:300])

print("\n=== matrix ===")
for e in d["matrix"]:
    print(f"--- {e['theme']} @ {e['viewport']}  auditNodes={e.get('auditNodes')} imgs={e.get('resultImages')} pageErrors={len(e.get('pageErrors', []))}")
    print("  tokens:", json.dumps(e["tokens"], ensure_ascii=False))
    r = e.get("ringEmptySlot", {})
    print("  ringEmptySlot:", json.dumps({k: r.get(k) for k in ["tag", "cls", "focusWithin", "activeElementIsInside", "focused", "boxShadow", "borderColor"]}, ensure_ascii=False)[:400])
    c = e.get("chipRing", {})
    print("  chipRing:", json.dumps({k: c.get(k) for k in ["tag", "focusWithin", "activeElementIsInside", "boxShadow", "borderColor", "borderLeftColor", "rect"]}, ensure_ascii=False)[:400])
    po = e.get("patternOverflow", {})
    to = e.get("textOverflow", {})
    print(f"  patternOverflow: docSW={po.get('docScrollWidth')} hOverflow={po.get('horizontalOverflow')} vOverflow={po.get('verticalOverflow')} outside={po.get('offenderCountOutside')}")
    print(f"  textOverflow:    docSW={to.get('docScrollWidth')} hOverflow={to.get('horizontalOverflow')} vOverflow={to.get('verticalOverflow')} outside={to.get('offenderCountOutside')}")
    for off in (po.get("offendersOutside") or [])[:4]:
        print("     P-OFF", off["kind"], off["tag"], off["rect"], repr(off["text"][:24]), off["cls"][:60])
    for off in (to.get("offendersOutside") or [])[:4]:
        print("     T-OFF", off["kind"], off["tag"], off["rect"], repr(off["text"][:24]), off["cls"][:60])
    print("  geometry:", json.dumps(e.get("textNodeGeometry"), ensure_ascii=False)[:300])
    if e.get("themeMenu"):
        print("  themeMenu:", json.dumps(e["themeMenu"], ensure_ascii=False)[:300])
    if e.get("dockWidthAfterPanels") is not None:
        print("  dockWidthAfterPanels:", e["dockWidthAfterPanels"])
    if e.get("inspectorText"):
        print("  inspectorText:", e["inspectorText"][:160])
    if e.get("resultsText"):
        print("  resultsText:", e["resultsText"][:160])
    if e.get("assetOverlay"):
        print("  assetOverlay:", e["assetOverlay"][:100])
print()
print("anim no-preference:", json.dumps(extras.get("animNoPreference"), ensure_ascii=False)[:400])
print("anim reduce:", json.dumps(extras.get("animReduce"), ensure_ascii=False)[:300])
