// 几何核对：缩略图槽 focus 截图的扫描线（确认环的实际像素位置与宽度）。
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire("/Users/lionfan/dev/kittin-saas-v2/package.json".replace("kittin-saas-v2", "kittin-saas-b-v2"));
const sharp = require("sharp");
const MEAS = "/tmp/gc-uiqa-r51/measurements";
const SHOTS = "/tmp/gc-uiqa-r51/shots";
const data = JSON.parse(readFileSync(join(MEAS, "p1-3-focus.json"), "utf8"));

for (const theme of ["current", "white", "eye"]) {
  const target = data.pattern.themes[theme].targets.find((t) => t.name === "thumbSlot");
  console.log(`\n== ${theme} clip=${JSON.stringify(target.clip)} rect=${JSON.stringify(target.after.rect)}`);
  for (const kind of ["after", "before"]) {
    const p = join(SHOTS, `p1-3-${kind === "after" ? "focus" : "blur"}-thumbSlot-${theme}-1280.png`);
    const { data: buf, info } = await sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const at = (x, y) => { const i = (y * info.width + x) * 3; return [buf[i], buf[i + 1], buf[i + 2]]; };
    const ex0 = Math.round(target.after.rect.x - target.clip.x);
    const y = Math.round((target.after.rect.y - target.clip.y) + target.after.rect.height / 2);
    const row = [];
    for (let x = Math.max(0, ex0 - 10); x <= Math.min(info.width - 1, ex0 + 6); x += 1) row.push(`${x - ex0}:${at(x, y).join(",")}`);
    console.log(`  ${kind} size=${info.width}x${info.height} ex0=${ex0} y=${y}`);
    console.log(`    ${row.join(" | ")}`);
  }
}
