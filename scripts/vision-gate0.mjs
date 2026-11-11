#!/usr/bin/env node
/**
 * Gate 0：验证网关 chat/completions 是否接受图片输入。
 *
 * 用法（在 app 容器内执行，复用其 node_modules/sharp 与网关环境变量）：
 *   docker exec -i -w /app coin-ai-canvas-app-1 node --input-type=module < scripts/vision-gate0.mjs
 *
 * 也可在装有依赖的环境里直接跑：node scripts/vision-gate0.mjs
 *
 * 判定：能正确说出三色顺序，且同一问题不带图时答错（防止模型靠猜蒙对）。
 * 不产生业务副作用，也不写入任何文件。
 */
import sharp from "sharp";

const BASE = (process.env.GATEWAY_BASE_URL ?? "https://api.ourzhishi.top").replace(/\/+$/, "");
const KEY = process.env.GATEWAY_API_KEY ?? "";
const MODELS = [
  "gemini-3.8-flash",
  "gpt-6-astra",
  "gemini-4-argon",
  "claude-opus-5-5",
];
const QUESTION = "从左到右依次说出图中三个圆形的颜色，只输出三个颜色词，用顿号分隔。";

if (!KEY) {
  console.error("缺少 GATEWAY_API_KEY");
  process.exit(2);
}

/** 白底 + 左(红) 中(绿) 右(蓝) 三个圆。 */
async function makeTestImage() {
  const w = 512;
  const h = 200;
  const circles = [
    { cx: 90, color: "#ff0000" },
    { cx: 256, color: "#00ff00" },
    { cx: 422, color: "#0000ff" },
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="#ffffff"/>
    ${circles.map((c) => `<circle cx="${c.cx}" cy="100" r="64" fill="${c.color}"/>`).join("")}
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

function textFromContent(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((p) => p && typeof p === "object" && p.type === "text" && typeof p.text === "string")
      .map((p) => p.text)
      .join("\n");
  }
  return "";
}

async function call(model, messages, extra = {}, timeoutMs = 60_000) {
  const startedAt = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/v1/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 200,
        stream: false,
        ...extra,
      }),
      signal: ctrl.signal,
    });
    const bodyText = await res.text();
    return { status: res.status, bodyText, elapsedMs: Date.now() - startedAt };
  } catch (error) {
    return {
      status: 0,
      bodyText: `TRANSPORT: ${error instanceof Error ? error.message : String(error)}`,
      elapsedMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

function parse(bodyText) {
  try {
    const json = JSON.parse(bodyText);
    const choice = (json.choices ?? [])[0] ?? {};
    const message = choice.message ?? {};
    return {
      text: textFromContent(message.content),
      finish: choice.finish_reason ?? "",
      refusal: typeof message.refusal === "string" ? message.refusal : "",
      error: json.error ? JSON.stringify(json.error).slice(0, 300) : "",
      usage: json.usage ?? null,
    };
  } catch {
    return { text: "", finish: "", refusal: "", error: `非 JSON: ${bodyText.slice(0, 200)}`, usage: null };
  }
}

const COLOR = /(红|Red)/i;
const GREEN = /(绿|Green)/i;
const BLUE = /(蓝|Blue)/i;

function looksCorrect(text) {
  const r = COLOR.test(text);
  const g = GREEN.test(text);
  const b = BLUE.test(text);
  return r && g && b;
}

/** 图在前、文本在后（Gemini 原生 prefers 这个顺序）。 */
function partsImageUrl(dataUrl, text) {
  return [
    { type: "text", text },
    { type: "image_url", image_url: { url: dataUrl } },
  ];
}

function partsInlineData(dataUrl, text) {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return [
    { role: "user", parts: [{ inline_data: { mime_type: "image/jpeg", data: base64 } }, { text }] },
  ];
}

async function main() {
  const dataUrl = await makeTestImage();
  console.log(`网关：${BASE}`);
  console.log(`测试图：512x200，三色圆（红/绿/蓝），dataURL ${(dataUrl.length / 1024).toFixed(0)}KB\n`);

  const results = [];
  for (const model of MODELS) {
    console.log(`===== ${model} =====`);

    // 形态 A：OpenAI image_url
    const a = await call(model, [{ role: "user", content: partsImageUrl(dataUrl, QUESTION) }]);
    const pa = parse(a.bodyText);
    console.log(`  [image_url] status=${a.status} ${a.elapsedMs}ms text="${pa.text.slice(0, 80).replace(/\n/g, " ")}"`);
    if (a.status !== 200) console.log(`    error: ${pa.error || a.bodyText.slice(0, 200)}`);

    let ok = a.status === 200 && looksCorrect(pa.text);
    let shape = "image_url";

    // 形态 B：Gemini inline_data（A 失败才试）
    if (!ok) {
      const b = await call(model, partsInlineData(dataUrl, QUESTION));
      const pb = parse(b.bodyText);
      console.log(`  [inline_data] status=${b.status} ${b.elapsedMs}ms text="${pb.text.slice(0, 80).replace(/\n/g, " ")}"`);
      if (b.status !== 200) console.log(`    error: ${pb.error || b.bodyText.slice(0, 200)}`);
      if (b.status === 200 && looksCorrect(pb.text)) {
        ok = true;
        shape = "inline_data";
      }
    }

    // 反向对照：不带图，若仍能说出三色则说明在猜
    const control = await call(model, [{ role: "user", content: QUESTION }]);
    const pc = parse(control.bodyText);
    const controlCorrect = control.status === 200 && looksCorrect(pc.text);

    console.log(`  对照(无图) status=${control.status} 答对=${controlCorrect} text="${pc.text.slice(0, 60).replace(/\n/g, " ")}"`);
    const verdict = ok && !controlCorrect ? "✅ 可用" : ok ? "⚠️ 疑似靠猜" : "❌ 不可用";
    console.log(`  结论：${verdict}${ok ? `（形态 ${shape}）` : ""}\n`);
    results.push({ model, ok, shape, controlCorrect, status: a.status, elapsedMs: a.elapsedMs });
  }

  console.log("===== 汇总 =====");
  for (const r of results) {
    console.log(`${r.ok ? "✅" : "❌"} ${r.model}${r.ok ? ` / ${r.shape}` : ""}${r.controlCorrect ? " / 无图也答对(可疑)" : ""}`);
  }
  const usable = results.filter((r) => r.ok && !r.controlCorrect);
  console.log(`\n可用链路：${usable.length ? usable.map((r) => `${r.model}(${r.shape})`).join(" → ") : "无"}`);
  process.exit(usable.length ? 0 : 1);
}

main().catch((error) => {
  console.error("探针异常：", error);
  process.exit(2);
});
