// 从 p1-3-focus.json 打印需要细看的分支：boxShadow 全文、firstInput/assetPickerButton 的类名与上下文。
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("/tmp/gc-uiqa-r51/measurements/p1-3-focus.json", "utf8"));
for (const [phase, pd] of Object.entries(data)) {
  if (phase === "url") continue;
  console.log("###", phase, "inventory:", JSON.stringify(pd.inventory).slice(0, 700));
  for (const [theme, entry] of Object.entries(pd.themes)) {
    for (const t of entry.targets) {
      if (!["thumbSlotFallback", "promptChipTextarea", "firstInput", "assetPickerButton"].includes(t.name)) continue;
      console.log(`-- ${phase}/${theme}/${t.name} tag=${t.tag} focusable=${t.focusableTag}`);
      console.log("   cls:", t.cls);
      console.log("   fcls:", t.focusableCls);
      console.log("   shadow before:", t.before.boxShadow);
      console.log("   shadow after :", t.after.boxShadow);
      console.log("   before rect:", JSON.stringify(t.before.rect), "after rect:", JSON.stringify(t.after.rect));
    }
  }
}
