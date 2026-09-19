import json
d = json.load(open("/tmp/gc-uiqa-v4/results-panels.json"))
for e in d["panels"]:
    o = e["inspectorOpenOverflow"]
    print(f"--- {e['theme']}@{e['width']} dockClosed={e['dockClosed']} outside={o['offenderCountOutside']} inside={len(o['offendersInside'])} hOverflow={o['horizontalOverflow']}")
    for off in o["offendersOutside"]:
        print("     OFF", off["kind"], off["tag"], off["rect"], repr(off["text"][:20]), off["cls"][:60])
    print("     inspector:", (e.get("inspectorText") or "")[:100])
    print("     results:  ", (e.get("resultsText") or "")[:100])
    print("     library:  ", (e.get("libraryText") or "")[:100])
    print("     asset:    ", (e.get("assetText") or "None")[:100])
print("errors:", d["errors"])
