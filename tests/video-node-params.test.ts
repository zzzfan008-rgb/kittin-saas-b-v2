/**
 * 视频节点参数面板回归（2026-11-18）。
 *
 * 用户反馈「视频节点的参数无法选择，而且画幅弹出的窗口也有问题」。三个独立缺陷：
 *
 * ① `videoAspectRatioOptions()` 读 `aspectRatio.examples`，但视频契约的画幅键是 `ratio`
 *    → 函数恒返回 `[]` → 画幅下拉永远空白。
 * ② `GeneratorParamsPanel` 的 `paramOpts` 只对图片调用 paramsFromContract，视频恒为 `{}`
 *    → `ParamControl options={paramOpts[k] ?? []}` 永远空数组 → 时长/分辨率没有可选项。
 * ③ 视频分支渲染「批次」，但 `runPlan.ts` 写死 video-generator 各 1 → 无效控件。
 *
 * 本文件锁定 ①② 的数据层（③ 为 JSX 结构，由 e2e 覆盖）。
 */
import assert from "node:assert/strict";
import {
  VIDEO_MODEL_IDS,
  videoAspectRatioOptions,
  videoModelRecommendedOptions,
} from "../src/types/videoModels";
import { videoParamsFromContract } from "../src/lib/paramsFromContract";

let passed = 0;
function test(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

console.log("视频节点参数面板回归");

test("veo3.1 已撤下（兔子 video-veo 页：本站未提供可执行生成请求）", () => {
  assert.deepEqual([...VIDEO_MODEL_IDS], ["doubao-seedance-2-5-260628", "MiniMax-H3"]);
  // 已撤下的模型不得再产出任何参数值域（防误配）。
  assert.deepEqual(videoParamsFromContract("veo3.1"), {});
});

test("① 画幅读 ratio.examples，不再恒为空", () => {
  for (const id of VIDEO_MODEL_IDS) {
    const ratios = videoAspectRatioOptions(id);
    assert.ok(ratios.length > 0, `${id} 的画幅选项不得为空（原 bug 恒为 []）`);
    // 值域必须与契约 ratio.examples 严格一致，不允许组件自行发明画幅。
    const declared = videoModelRecommendedOptions(id).ratio?.examples ?? [];
    assert.deepEqual([...ratios], declared.map(String), `${id} 画幅必须等于契约 ratio.examples`);
  }
});

test("① Seedance 画幅为 6 个实测通过值（不含未验证的 adaptive）", () => {
  assert.deepEqual(
    [...videoAspectRatioOptions("doubao-seedance-2-5-260628")],
    ["16:9", "4:3", "1:1", "3:4", "9:16", "21:9"],
  );
  assert.ok(
    !videoAspectRatioOptions("doubao-seedance-2-5-260628").includes("adaptive"),
    "adaptive 未通过实测（当次余额不足未提交成功），不得作为可选项",
  );
});

test("② 视频参数值域不再为空（原 paramOpts 恒 {}）", () => {
  for (const id of VIDEO_MODEL_IDS) {
    const params = videoParamsFromContract(id);
    assert.ok(Object.keys(params).length > 0, `${id} 必须产出参数值域`);
    for (const [key, options] of Object.entries(params)) {
      assert.ok(options.length > 0, `${id}.${key} 必须有可选项（原 bug 为空数组）`);
      // 值域必须来自契约，不允许硬编码。
      const declared = videoModelRecommendedOptions(id)[key]?.examples ?? [];
      assert.deepEqual(
        options.map((o) => o.value),
        [...declared],
        `${id}.${key} 选项必须等于契约 examples`,
      );
    }
  }
});

test("② 画幅键不进入模型参数区（由独立画幅下拉承载，避免重复控件）", () => {
  for (const id of VIDEO_MODEL_IDS) {
    const params = videoParamsFromContract(id);
    assert.ok(!("ratio" in params), `${id} 的 ratio 不得出现在参数区`);
    assert.ok(!("aspectRatio" in params), `${id} 的 aspectRatio 不得出现在参数区`);
  }
});

test("② 单值参数仍返回值域（由 UI 呈现只读文本而非单选项下拉）", () => {
  // 视频时长/分辨率按文档示例值收敛为单档，值域长度必须为 1，
  // 供 ParamControl 的 options.length===1 分支渲染只读文本。
  const seedance = videoParamsFromContract("doubao-seedance-2-5-260628");
  assert.equal(seedance.duration?.length, 1, "Seedance 时长为单档");
  assert.equal(seedance.resolution?.length, 1, "Seedance 分辨率为单档");
  assert.equal(seedance.duration?.[0]?.value, 5);
  assert.equal(seedance.resolution?.[0]?.value, "720p");
});

test("② 未知模型返回空对象（fail-closed，不臆造参数）", () => {
  assert.deepEqual(videoParamsFromContract("invented-video-model"), {});
  assert.deepEqual(videoAspectRatioOptions("invented-video-model" as never), []);
});

console.log(`\n视频节点参数面板回归通过：${passed} 项`);
