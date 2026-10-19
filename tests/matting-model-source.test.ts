// mattingModelSource：模型源常量与错误中文化的纯函数测试（无网络/无 DOM）。
import assert from "node:assert/strict";
import {
  MATTING_PUBLIC_PATH,
  describeMattingResourceError,
} from "../src/lib/mattingModelSource";

console.log("matting-model-source 测试");

// 1. publicPath 指向库官方数据 CDN（非写空的 jsdelivr）。
assert.match(
  MATTING_PUBLIC_PATH,
  /^https:\/\/staticimgly\.com\/@imgly\/background-removal-data\/1\.7\.0\/dist\/$/,
  `publicPath 应为官方 1.7.0 数据 CDN，实际：${MATTING_PUBLIC_PATH}`,
);
assert.ok(!MATTING_PUBLIC_PATH.includes("jsdelivr"), "不应再指向 jsdelivr（其 resources.json 为空）");
console.log("  ✓ publicPath = 官方 staticimgly 1.7.0 数据 CDN");

// 2. 资源缺失 / 404 → 明确中文提示。
assert.match(
  describeMattingResourceError(new Error("Resource metadata not found. Ensure publicPath...")),
  /模型资源缺失|本地模型/,
);
assert.match(
  describeMattingResourceError(new Error("Resource /models/isnet_fp16 not found")),
  /模型资源缺失/,
);
console.log("  ✓ 资源缺失/404 → 明确中文提示");

// 3. 网络失败 → 网络提示。
assert.match(
  describeMattingResourceError(new TypeError("Failed to fetch")),
  /网络/,
);
assert.match(
  describeMattingResourceError(new Error("Network request failed: abort")),
  /网络/,
);
console.log("  ✓ 网络类失败 → 网络提示");

// 4. 其他错误原样透出，不静默、不吞。
{
  const msg = "服务端返回无效的图片 URL";
  assert.equal(describeMattingResourceError(new Error(msg)), msg);
  assert.equal(describeMattingResourceError("裸字符串错误"), "裸字符串错误");
}
console.log("  ✓ 其他错误原样透出（不静默）");

console.log("\n通过 4 项");
