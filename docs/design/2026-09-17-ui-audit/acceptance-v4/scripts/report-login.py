import json, sys
p = "/tmp/gc-uiqa-v4/results-login.json"
data = json.load(open(p))
for r in data:
    o = r["overflow"]
    t = r["themeProbe"]
    print(f"{r['theme']:8s} {r['viewport']:5d} docSW={o['docScrollWidth']:5d} vw={o['viewport'][0]:5d} hOverflow={o['horizontalOverflow']} outside={o['offenderCountOutside']} inside={len(o['offendersInsideCanvas'])} errors={len(r['errors'])}")
    print(f"   tokens theme={t.get('dataTheme')} accent={t['tokens']['accent']} colorGold={t['tokens']['colorGold']} shell={t['tokens']['shell']} panel={t['tokens']['panel']}")
    if t["card"]:
        rect = t["card"]["rect"]
        print(f"   card rect x={rect['x']:.0f} y={rect['y']:.0f} w={rect['width']:.0f} h={rect['height']:.0f} right={rect['x']+rect['width']:.0f} bottom={rect['y']+rect['height']:.0f} bg={t['card']['backgroundColor']} backdrop={t['card']['backdropFilter']}")
    if t["brand"]:
        rect = t["brand"]["rect"]
        print(f"   brand rect x={rect['x']:.0f} w={rect['width']:.0f} right={rect['x']+rect['width']:.0f} bg={t['brand']['backgroundColor']}")
    for off in o["offendersOutsideCanvas"][:8]:
        print(f"   OFF {off['kind']} {off['tag']} testid={off['testid']} rect={off['rect']} text={off['text']!r} cls={off['cls'][:70]}")
    for off in o["offendersInsideCanvas"]:
        print(f"   (canvas) {off['kind']} {off['tag']} rect={off['rect']} cls={off['cls'][:60]}")
    for e in r["errors"][:3]:
        print("   PAGEERROR", e)
