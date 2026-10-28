/**
 * 逐模型分辨率契约（用户 2026-10-28：不许所有模型公用一套；只保留官方支持的参数）。
 *
 * 数据来源（每家都核实过，标注"实测"的是真实付费调用）：
 * - gemini 系：imageConfig.imageSize = 1K/2K/4K（契约 imageSizes + 谷歌官方）
 * - gpt-image-2.5 系：官方 30 档像素表（docs/ai/apiyi/models/gpt-image-2-vip.md）
 * - flux-3-image：resolution = 1k/1.5k/2k/4k（实测 1k+16:9 出 2736x1536）
 * - seedream 5.0：像素面积 [921600, 4624220]（实测 512x512 / 3072x3072 均被拒）
 * - qwen-image-3.0：像素面积 [262144, 4194304]，`宽*高`（实测 4096*4096 被拒）
 */
import assert from "node:assert/strict";

const {
  modelResolutionTiers,
  defaultResolutionTierFor,
  resolutionModelOptions,
  resolutionTierOf,
  resolutionOptionsInBounds,
  modelSupportsQuality,
  IMAGE_MODEL_IDS,
} = await import("../src/types/imageModels");
const { imageAspectRatioOptions } = await import("../src/types/imageModels");

console.log("逐模型分辨率契约");

let passed = 0;
function ok(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"];

/** 各模型官方档位（改这张表就是改产品契约，必须同步文档）。 */
const EXPECTED_TIERS: Record<string, string[]> = {
  "gemini-nano-banana-2.1": ["1K", "2K", "4K"],
  "gemini-3.1-flash-image": ["1K", "2K", "4K"],
  "gpt-image-2.5-sunburst": ["1K", "2K", "4K"],
  "gpt-image-2.5-flare": ["1K", "2K", "4K"],
  "flux-3-image": ["1K", "1.5K", "2K", "4K"],
  "doubao-seedream-5-0-pro-260628": ["1K", "2K"],
  "doubao-seedream-5-0-lite-260128": ["1K", "2K"],
  "qwen-image-3.0-pro": ["1K", "2K"],
  "qwen-image-3.0": ["1K", "2K"],
};

ok("每个模型的档位与官方能力一致（不是全站一套）", () => {
  for (const modelId of IMAGE_MODEL_IDS) {
    assert.deepEqual(
      [...modelResolutionTiers(modelId)],
      EXPECTED_TIERS[modelId],
      `${modelId} 档位表不符`,
    );
  }
  // 反证：至少存在两组不同档位（否则说明还在共用一套）
  const shapes = new Set(IMAGE_MODEL_IDS.map((id) => modelResolutionTiers(id).join("/")));
  assert.ok(shapes.size >= 3, `档位形态应至少 3 种，实际 ${[...shapes].join(" | ")}`);
});

ok("gpt-image：size 走官方 30 档表（16 倍数 / 边长≤3840 / 像素≤8294400 / 比≤3）", () => {
  const expected: Record<string, string[]> = {
    "1:1": ["1280x1280", "2048x2048", "2880x2880"],
    "3:4": ["960x1280", "1536x2048", "2480x3312"],
    "16:9": ["1280x720", "2048x1152", "3840x2160"],
    "21:9": ["1280x544", "2048x864", "3840x1632"],
  };
  for (const [ratio, sizes] of Object.entries(expected)) {
    const actual = ["1K", "2K", "4K"].map((tier) => resolutionModelOptions("gpt-image-2.5-flare", tier as never, ratio).size);
    assert.deepEqual(actual, sizes, `${ratio} 官方档表不符`);
  }
  for (const ratio of RATIOS) {
    for (const tier of ["1K", "2K", "4K"] as const) {
      const size = String(resolutionModelOptions("gpt-image-2.5-flare", tier, ratio).size);
      const [w, h] = size.split("x").map(Number);
      assert.equal(w % 16, 0, `${ratio}/${tier} 宽必须是 16 倍数`);
      assert.equal(h % 16, 0, `${ratio}/${tier} 高必须是 16 倍数`);
      assert.ok(Math.max(w, h) <= 3840, `${ratio}/${tier} 边长超 3840`);
      assert.ok(w * h <= 8_294_400, `${ratio}/${tier} 像素超上限`);
      assert.ok(Math.max(w, h) / Math.min(w, h) <= 3, `${ratio}/${tier} 比例超 3:1`);
    }
  }
});

ok("seedream：只给 1K/2K，且每个组合都落在官方像素区间 [921600, 4624220]", () => {
  for (const modelId of ["doubao-seedream-5-0-pro-260628", "doubao-seedream-5-0-lite-260128"] as const) {
    for (const ratio of RATIOS) {
      for (const tier of modelResolutionTiers(modelId)) {
        const size = String(resolutionModelOptions(modelId, tier, ratio).size);
        const [w, h] = size.split("x").map(Number);
        const pixels = w * h;
        assert.ok(pixels >= 921_600, `${modelId} ${ratio}/${tier} ${size} 低于下限`);
        assert.ok(pixels <= 4_624_220, `${modelId} ${ratio}/${tier} ${size} 超过上限`);
      }
    }
  }
});

ok("qwen：只给 1K/2K，`宽*高`，落在 [262144, 4194304]", () => {
  for (const tier of modelResolutionTiers("qwen-image-3.0-pro")) {
    for (const ratio of RATIOS) {
      const size = String(resolutionModelOptions("qwen-image-3.0-pro", tier, ratio).size);
      assert.match(size, /^\d+\*\d+$/, "qwen 必须用星号分隔");
      const [w, h] = size.split("*").map(Number);
      const pixels = w * h;
      assert.ok(pixels >= 262_144 && pixels <= 4_194_304, `${ratio}/${tier} ${size} 超界`);
    }
  }
});

ok("gemini：imageSize 关键字 + 画幅不动 size；flux：resolution 关键字", () => {
  assert.deepEqual(resolutionModelOptions("gemini-3.1-flash-image", "4K", "3:4"), { aspectRatio: "3:4", imageSize: "4K" });
  assert.deepEqual(resolutionModelOptions("flux-3-image", "1.5K", "16:9"), { aspect_ratio: "16:9", resolution: "1.5k" });
  assert.deepEqual(resolutionModelOptions("flux-3-image", "1K", "1:1"), { aspect_ratio: "1:1", resolution: "1k" });
});

ok("回显闭环：所有模型 × 所有支持画幅 × 所有档位都能反解回原档", () => {
  for (const modelId of IMAGE_MODEL_IDS) {
    const ratios = imageAspectRatioOptions(modelId);
    for (const ratio of ratios) {
      for (const tier of modelResolutionTiers(modelId)) {
        const options = resolutionModelOptions(modelId, tier, ratio);
        assert.equal(resolutionTierOf(modelId, options), tier, `${modelId} ${ratio}/${tier} 回显不一致`);
      }
    }
  }
});

ok("默认档位：有 2K 用 2K，没有就用该模型最高档", () => {
  assert.equal(defaultResolutionTierFor("gpt-image-2.5-flare"), "2K");
  assert.equal(defaultResolutionTierFor("qwen-image-3.0"), "2K");
});

ok("运行时兜底：旧草稿的非法尺寸被收敛（seedream 3840x3840 → 合法值）", () => {
  const fixed = resolutionOptionsInBounds(
    "doubao-seedream-5-0-pro-260628",
    { size: "3840x3840", response_format: "url" },
    "1:1",
  );
  const [w, h] = String(fixed.size).split("x").map(Number);
  assert.ok(w * h <= 4_624_220, `兜底后仍超限：${fixed.size}`);
  assert.equal(fixed.response_format, "url", "不得动无关参数");
  // 合法自定义尺寸保持原样
  const kept = resolutionOptionsInBounds("doubao-seedream-5-0-pro-260628", { size: "2560x1440" }, "16:9");
  assert.equal(kept.size, "2560x1440");
  // gpt-image 官方档位值原样通过
  const gpt = resolutionOptionsInBounds("gpt-image-2.5-flare", { size: "2048x1152" }, "16:9");
  assert.equal(gpt.size, "2048x1152");
});

ok("画质参数只发给官方支持的模型（gemini/flux/seedream/qwen 不带 quality）", () => {
  for (const modelId of IMAGE_MODEL_IDS) {
    const supported = modelSupportsQuality(modelId);
    const expected = modelId.startsWith("gpt-image-2.5");
    assert.equal(supported, expected, `${modelId} quality 支持判定不符`);
  }
});

console.log(`通过 ${passed} 项`);
