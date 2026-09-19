import json, glob, os
d = json.load(open("/tmp/gc-uiqa-v4/results-matrix.json"))
for e in d["matrix"]:
    if e.get("assetOverlay") is not None:
        print("harness assetOverlay", e["theme"], e["viewport"], e["assetOverlay"][:120])
p = json.load(open("/tmp/gc-uiqa-v4/results-panels.json"))
for e in p["panels"][:3]:
    print("panel", e["theme"], e["width"], "inspector:", (e.get("inspectorText") or "")[:110])
    print("      results:", (e.get("resultsText") or "")[:110])
    print("      library:", (e.get("libraryText") or "")[:110])
print()
for f in sorted(glob.glob("/tmp/gc-uiqa-v4/shots/*.png")):
    print(os.path.basename(f), os.path.getsize(f))
