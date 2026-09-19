// shots-index：截图的 md5 + 字节数（可核验未被二次修改）
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const SHOTS = process.argv[2] ?? "/tmp/gc-uiqa-r51/shots";
const out = readdirSync(SHOTS)
  .filter((f) => f.endsWith(".png"))
  .sort()
  .map((f) => {
    const p = join(SHOTS, f);
    const buf = readFileSync(p);
    return { file: f, bytes: statSync(p).size, md5: createHash("md5").update(buf).digest("hex") };
  });
writeFileSync(join(process.argv[3] ?? "/tmp/gc-uiqa-r51/measurements", "shots-index.json"), JSON.stringify(out, null, 2));
console.log(`indexed ${out.length} shots, total ${out.reduce((a, b) => a + b.bytes, 0)} bytes`);
