import glob, hashlib, json, os, shutil
from PIL import Image

SRC = "/tmp/gc-uiqa-v4/shots"
DST = "/Users/lionfan/dev/kittin-saas-b-v2/docs/design/2026-09-17-ui-audit/acceptance-v4/shots"

SKIP_PREFIX = ("debug-", "cta-node-")
SKIP_EXACT = {
    "ring-slot-current-1024.png", "ring-slot-white-1024.png", "ring-slot-eye-1024.png",
    "ring-slot-current-1440.png", "ring-slot-white-1440.png", "ring-slot-eye-1440.png",
}

def bucket(name):
    if name.startswith("login"):
        return "login"
    if name.startswith("canvas-") or name.startswith("00-"):
        return "canvas"
    if name.startswith("slot-") or name.startswith("ring-slot-") or name.startswith("focus-"):
        return "focus-ring"
    if name.startswith("cta-"):
        return "cta"
    if name.startswith("panel-") or name.startswith("theme-menu"):
        return "panels"
    return "misc"

index = []
if os.path.isdir(DST):
    shutil.rmtree(DST)
for path in sorted(glob.glob(f"{SRC}/*.png")):
    name = os.path.basename(path)
    if name.startswith(SKIP_PREFIX) or name in SKIP_EXACT:
        continue
    b = bucket(name)
    os.makedirs(f"{DST}/{b}", exist_ok=True)
    out = f"{DST}/{b}/{name}"
    img = Image.open(path)
    img.save(out, optimize=True)
    size = os.path.getsize(out)
    md5 = hashlib.md5(open(out, "rb").read()).hexdigest()
    index.append({"file": f"shots/{b}/{name}", "bytes": size, "md5": md5, "size": img.size})

total = sum(i["bytes"] for i in index)
print(f"staged {len(index)} screenshots, total {total/1e6:.1f} MB")
with open("/tmp/gc-uiqa-v4/shots-index.json", "w") as fh:
    json.dump(index, fh, ensure_ascii=False, indent=1)
# 逐档位去重检查（登录页三主题是否字节相同已单列）
login = [i for i in index if i["file"].startswith("shots/login/login-")]
for w in (1024, 1280, 1440):
    group = [i for i in login if i["file"].endswith(f"-{w}.png")]
    same = len({i["md5"] for i in group}) == 1
    print(f"login @{w}: {len(group)} files, identical={same} md5={group[0]['md5'][:12] if group else '-'}")
