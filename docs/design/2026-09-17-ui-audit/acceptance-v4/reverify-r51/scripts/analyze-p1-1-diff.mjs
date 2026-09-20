// P1-1：登录页三主题截图的像素差异定位（回答「md5 不同是否=换肤」）。sharp 逐像素比对。
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire("/Users/lionfan/dev/kittin-saas-b-v2/package.json");
const sharp = require("sharp");

const OUT = "/tmp/gc-uiqa-r51/shots";
const themes = ["current", "white", "eye"];

async function raw(theme) {
  const img = sharp(join(OUT, `p1-1-login-${theme}-1280.png`)).removeAlpha();
  const meta = await img.metadata();
  const buf = await img.raw().toBuffer();
  return { meta, buf };
}

const data = {};
for (const t of themes) data[t] = await raw(t);
console.log("size:", data.current.meta.width, "x", data.current.meta.height);

function diff(a, b) {
  const w = a.meta.width;
  const h = a.meta.height;
  let changed = 0;
  let maxDelta = 0;
  const bbox = { minX: w, minY: h, maxX: -1, maxY: -1 };
  const samples = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 3;
      const d = Math.max(
        Math.abs(a.buf[i] - b.buf[i]),
        Math.abs(a.buf[i + 1] - b.buf[i + 1]),
        Math.abs(a.buf[i + 2] - b.buf[i + 2]),
      );
      if (d > 0) {
        changed += 1;
        if (d > maxDelta) maxDelta = d;
        bbox.minX = Math.min(bbox.minX, x);
        bbox.minY = Math.min(bbox.minY, y);
        bbox.maxX = Math.max(bbox.maxX, x);
        bbox.maxY = Math.max(bbox.maxY, y);
        if (samples.length < 5) {
          samples.push({
            xy: [x, y],
            a: [a.buf[i], a.buf[i + 1], a.buf[i + 2]],
            b: [b.buf[i], b.buf[i + 1], b.buf[i + 2]],
          });
        }
      }
    }
  }
  return {
    changedPx: changed,
    totalPx: w * h,
    percent: Number(((changed / (w * h)) * 100).toFixed(4)),
    maxChannelDelta: maxDelta,
    bbox: bbox.maxX < 0 ? null : [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
    samples,
  };
}

const pairs = [["current", "white"], ["current", "eye"], ["white", "eye"]];
const out = {};
for (const [x, y] of pairs) {
  out[`${x}-vs-${y}`] = diff(data[x].buf ? data[x] : data[x], data[y]);
  console.log(`${x} vs ${y}:`, JSON.stringify(out[`${x}-vs-${y}`]).slice(0, 400));
}

// 关键区域采样（卡底 / 页面底 / 品牌区）
const at = (buf, w, x, y) => {
  const i = (y * w + x) * 3;
  return [buf[i], buf[i + 1], buf[i + 2]];
};
for (const t of themes) {
  const { buf, meta } = data[t];
  out[`sample_${t}`] = {
    card: at(buf, meta.width, 900, 200),
    pageBottom: at(buf, meta.width, 640, 700),
    brand: at(buf, meta.width, 200, 400),
  };
  console.log(t, JSON.stringify(out[`sample_${t}`]));
}
