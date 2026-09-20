// 打印 p1-3b 的身份信息与槽/按钮焦点明细（head 部分在终端被截断，这里完整取回）。
import { readFileSync } from "node:fs";

const d = JSON.parse(readFileSync("/tmp/gc-uiqa-r51/measurements/p1-3b-focus.json", "utf8"));
for (const [label, phase] of Object.entries(d.phases)) {
  console.log("###", label);
  console.log("identity:", JSON.stringify(phase.identity, null, 1).slice(0, 1800));
  for (const [theme, targets] of Object.entries(phase.targets)) {
    for (const [name, t] of Object.entries(targets)) {
      if (t.missing) { console.log(`  ${theme}/${name}: MISSING`); continue; }
      if (!["slot", "assetPicker", "hexInput"].includes(name)) continue;
      console.log(`  ${theme}/${name} tag=${t.tag} focusable=${t.focusableTag}/${t.focusableType} owner=${t.nodeOwner} size=${JSON.stringify(t.focusableSize)} changed=[${t.changed.join("|")}]`);
      console.log(`      afterShadow=${String(t.after.boxShadow).slice(0, 130)}`);
      console.log(`      ancestorRing=${JSON.stringify(t.ancestorRing).slice(0, 260)}`);
    }
  }
}
