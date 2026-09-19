// ui-qa 共用探针：注入到页面的量测函数（字符串化后在浏览器执行）。
export const PROBES = String.raw`
window.__gcKey = function (el) {
  const parts = [];
  let n = el;
  while (n && n !== document.body && n.parentElement) {
    parts.unshift(Array.prototype.indexOf.call(n.parentElement.children, n));
    n = n.parentElement;
  }
  return parts.join(".");
};

window.__gcColorAudit = function () {
  const out = {};
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") continue;
    const k = window.__gcKey(el);
    out[k] = {
      tag: el.tagName,
      testid: el.getAttribute("data-testid"),
      cls: typeof el.className === "string" ? el.className : "",
      text: (el.textContent || "").trim().slice(0, 30),
      color: s.color,
      bg: s.backgroundColor,
      borderTop: s.borderTopColor,
      borderLeft: s.borderLeftColor,
      borderTopWidth: s.borderTopWidth,
      borderLeftWidth: s.borderLeftWidth,
      boxShadow: s.boxShadow,
      backgroundImage: s.backgroundImage === "none" ? "none" : "image",
      fill: s.fill,
      opacity: s.opacity,
    };
  }
  return out;
};

window.__gcOverflow = function () {
  const vw = window.innerWidth, vh = window.innerHeight;
  const de = document.documentElement;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) continue;
    const inFlowCanvas = el.closest(".react-flow__viewport") !== null;
    const overflows = r.right > vw + 0.5 || r.left < -0.5 || r.bottom > vh + 0.5 || r.top < -0.5;
    const textClipped =
      el.childElementCount === 0 &&
      el.scrollWidth > el.clientWidth + 1 &&
      s.overflowX === "hidden";
    if (overflows || textClipped) {
      offenders.push({
        tag: el.tagName,
        testid: el.getAttribute("data-testid"),
        cls: typeof el.className === "string" ? el.className.slice(0, 160) : "",
        text: (el.textContent || "").trim().slice(0, 40),
        rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)],
        kind: overflows ? "overflow" : "clipped",
        inFlowCanvas,
      });
    }
  }
  return {
    viewport: [vw, vh],
    docScrollWidth: de.scrollWidth,
    docScrollHeight: de.scrollHeight,
    horizontalOverflow: de.scrollWidth > vw,
    verticalOverflow: de.scrollHeight > vh,
    offenderCountOutside: offenders.filter((o) => !o.inFlowCanvas).length,
    offendersOutside: offenders.filter((o) => !o.inFlowCanvas).slice(0, 30),
    offendersInside: offenders.filter((o) => o.inFlowCanvas).slice(0, 6),
  };
};

window.__gcTheme = function () {
  const cs = getComputedStyle(document.documentElement);
  const read = (n) => cs.getPropertyValue(n).trim();
  return {
    attr: document.documentElement.getAttribute("data-theme"),
    accent: read("--gc-accent"),
    shell: read("--gc-shell"),
    canvas: read("--gc-canvas"),
    panel: read("--gc-panel"),
    nodeInner: read("--gc-node-inner"),
    text: read("--gc-text"),
    colorGold: read("--color-gold"),
  };
};

window.__gcRing = function (selector) {
  const el = document.querySelector(selector);
  if (!el) return { error: "selector not found: " + selector };
  const focusable = el.matches("input,textarea,button,select") ? el : el.querySelector("input,textarea,button,select");
  if (focusable) {
    focusable.focus({ preventScroll: true });
  } else {
    el.focus({ preventScroll: true });
  }
  const s = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return {
    selector,
    tag: el.tagName,
    cls: typeof el.className === "string" ? el.className : "",
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    boxShadow: s.boxShadow,
    borderColor: s.borderTopColor,
    borderLeftColor: s.borderLeftColor,
    outline: s.outline,
    outlineColor: s.outlineColor,
    focused: document.activeElement ? document.activeElement.tagName + ":" + (document.activeElement.className || "").toString().slice(0, 60) : null,
    focusWithin: el.matches(":focus-within"),
    bg: s.backgroundColor,
    activeElementIsInside: el.contains(document.activeElement),
  };
};

window.__gcAnim = function () {
  window.__gcAnimLog = [];
  document.addEventListener("animationstart", (e) => {
    window.__gcAnimLog.push({ phase: "start", name: e.animationName, target: e.target.tagName + "." + String(e.target.className || "").slice(0, 60) });
  }, true);
  document.addEventListener("animationend", (e) => {
    window.__gcAnimLog.push({ phase: "end", name: e.animationName });
  }, true);
  document.addEventListener("transitionrun", (e) => {
    window.__gcAnimLog.push({ phase: "transition", name: e.propertyName, target: e.target.tagName });
  }, true);
  return "installed";
};
`;

export const MEASURE_HELPERS = `
async function colorAudit(page) {
  return page.evaluate(() => window.__gcColorAudit());
}
`;
