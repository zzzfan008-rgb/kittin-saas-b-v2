/**
 * 抠图服务契约测试（源码级，不启动服务、不碰网络）。
 *
 * 锁定 2026-10-23 的架构决策：抠图从浏览器本地（@imgly/background-removal，
 * 每次要下载 170MB 模型）改为服务端 Python rembg 服务。
 *
 * 这些断言存在的意义：防止有人以后把 imgly 那条链路加回来 —— 那会让用户
 * 重新背上「每次清缓存都要下 170MB」的负担，而这个问题从 UI 上完全看不出来。
 */
import assert from "node:assert/strict";
import fs from "node:fs";

console.log("抠图服务：服务端 rembg 取代浏览器端 imgly 契约测试");

const root = new URL("..", import.meta.url).pathname;

// ---------- 1) 前端不再依赖 @imgly ----------
const mattingDialog = fs.readFileSync(
  `${root}src/components/panels/MattingDialog.tsx`,
  "utf8",
);
assert.doesNotMatch(
  mattingDialog,
  /from\s+["']@imgly\/background-removal["']/,
  "MattingDialog 不得再 import @imgly/background-removal（抠图已改服务端）",
);
assert.doesNotMatch(
  mattingDialog,
  /removeBackground\(/,
  "MattingDialog 不得再调用 removeBackground（浏览器端推理已移除）",
);
assert.doesNotMatch(
  mattingDialog,
  /staticimgly\.com|MATTING_PUBLIC_PATH/,
  "MattingDialog 不得再引用境外模型 CDN（用户端零下载是本改造的核心目标）",
);

// ---------- 2) 改调服务端 route ----------
assert.match(
  mattingDialog,
  /fetch\(\s*["']\/api\/matting["']/,
  "MattingDialog 必须调 POST /api/matting",
);
assert.match(
  mattingDialog,
  /model:\s*MODEL_BY_QUALITY\[quality\]/,
  "必须把画质档映射成服务端模型名传给 route",
);

// ---------- 3) package.json 已移除 imgly ----------
const pkg = JSON.parse(fs.readFileSync(`${root}package.json`, "utf8")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
assert.equal(
  pkg.dependencies?.["@imgly/background-removal"],
  undefined,
  "package.json 的 dependencies 不得再含 @imgly/background-removal",
);

// ---------- 4) 旧模型源文件已删除 ----------
assert.equal(
  fs.existsSync(`${root}src/lib/mattingModelSource.ts`),
  false,
  "src/lib/mattingModelSource.ts 必须已删除（其唯一职责是配 CDN）",
);
assert.equal(
  fs.existsSync(`${root}tests/matting-model-source.test.ts`),
  false,
  "旧测试 tests/matting-model-source.test.ts 必须已删除",
);

// ---------- 5) Node route 存在且行为正确 ----------
const route = fs.readFileSync(`${root}server/routes/matting.ts`, "utf8");
assert.match(route, /mattingRouter\.post\(/, "必须有 POST 处理器");
assert.match(route, /mattingRouter\.get\(\s*["']\/health["']/, "必须有 /health 供诊断");
assert.match(
  route,
  /process\.env\.MATTING_SERVICE_URL/,
  "服务地址必须可由环境变量配置（部署时指向常驻服务）",
);
assert.match(
  route,
  /AbortSignal\.timeout\(/,
  "必须设请求超时，否则 Python 服务挂死会把 Node 请求一起挂住",
);
assert.match(
  route,
  /saveNormalizedUploadDataUrl/,
  "抠图结果必须走既有落库链路（不是只返回 dataUrl）",
);
// 服务端不信任客户端传的任意模型名
assert.match(route, /ALLOWED_MODELS\.has\(body\.model\)/, "model 参数必须走白名单校验");

// ---------- 6) route 已挂载 ----------
const index = fs.readFileSync(`${root}server/index.ts`, "utf8");
assert.match(
  index,
  /app\.use\(\s*["']\/api\/matting["']\s*,\s*mattingRouter\s*\)/,
  "server/index.ts 必须挂载 /api/matting",
);
assert.doesNotMatch(
  index,
  /app\.post\(\s*["']\/api\/matting["'][\s\S]{0,80}aiRateLimit/,
  "抠图不消耗 AI 配额（本地推理），不得套 aiRateLimit",
);

// ---------- 7) Python 服务侧关键约束 ----------
const py = fs.readFileSync(`${root}rembg-service/app.py`, "utf8");
assert.match(py, /isnet-general-use/, "默认模型必须是 isnet-general-use");
assert.match(
  py,
  /_load_model|new_session\(MODEL_NAME\)/,
  "必须在启动时预加载模型（A+C 决策），否则第一个用户要等下载",
);
assert.match(
  py,
  /127\.0\.0\.1/,
  "README/启动命令必须只监听回环地址（Python 服务不对外暴露）",
);
// 安全阀：未预置模型必须快速失败，不得触发 170MB 下载把请求挂死
assert.match(
  py,
  /模型文件不存在/,
  "未预置的模型必须明确报错，不得让 rembg 触发 170MB 下载把请求挂 8 分钟",
);

// ---------- 8) 羽化仍在本地（服务端只出 alpha） ----------
const compositor = fs.readFileSync(`${root}src/lib/mattingCompositor.ts`, "utf8");
assert.match(
  compositor,
  /export async function featherStoredImageUrl/,
  "必须提供「取回服务端结果 → 本地羽化」的封装",
);
assert.match(
  mattingDialog,
  /featherStoredImageUrl/,
  "MattingDialog 必须调本地羽化（羽化是用户可调参数，不能每调一次都重新推理）",
);

console.log("  ✓ 前端不再 import @imgly，改调 /api/matting");
console.log("  ✓ package.json 已移除 @imgly/background-removal");
console.log("  ✓ mattingModelSource.ts 及其测试已删除");
console.log("  ✓ route 有超时、白名单、落库、/health");
console.log("  ✓ 抠图不套 aiRateLimit");
console.log("  ✓ Python 侧启动预加载 + 未预置模型快速失败");
console.log("  ✓ 羽化保留在本地");
console.log("抠图服务契约测试通过");
