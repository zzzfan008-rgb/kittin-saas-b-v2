// mattingCompositor 的 alpha 边缘羽化纯函数测试（无 DOM，不碰库/网络）。
// 不直接测 canvas/toBlob（需 jsdom/canvas 环境，仓库没有）；这里锁住：
// ① 模糊只动 alpha（对纯黑/纯白 RGB 的语义由调用保证）；
// ② 半透明硬边在羽化后形成中间过渡（边缘不再是 0/255 阶跃）；
// ③ 半径 0 不调用（调用层短路）；完全不透明/全透明区域保持。
import assert from "node:assert/strict";
import { gaussianBlurAlpha } from "../src/lib/mattingCompositor";

console.log("matting-compositor：alpha 边缘羽化纯函数测试");

// 4x1：[0, 255, 255, 0] —— 一个 2px 的硬边前景。
{
  const alpha = Uint8ClampedArray.from([0, 255, 255, 0]);
  const blurred = gaussianBlurAlpha(alpha, 4, 1, 2);
  // 两侧原本 0 的像素会被渗入（羽化），中间像素略降——边缘过渡出现。
  assert.ok(blurred[0] > 0, `左外缘应被羽化渗入（>0），实际 ${blurred[0]}`);
  assert.ok(blurred[3] > 0, `右外缘应被羽化渗入（>0），实际 ${blurred[3]}`);
  assert.ok(blurred[1] > 0 && blurred[1] < 255, `内缘应为中间值，实际 ${blurred[1]}`);
  assert.ok(blurred[2] > 0 && blurred[2] < 255, `内缘应为中间值，实际 ${blurred[2]}`);
  console.log("  ✓ 硬边（0/255 阶跃）羽化后产生中间过渡，两侧渗入");
}

// 2x2 全不透明：任何位置都应保持 255（均匀区域不被削弱）。
{
  const alpha = Uint8ClampedArray.from([255, 255, 255, 255]);
  const blurred = gaussianBlurAlpha(alpha, 2, 2, 4);
  for (let i = 0; i < 4; i += 1) {
    assert.equal(blurred[i], 255, `全不透明区域 [${i}] 不应被削弱`);
  }
  console.log("  ✓ 全不透明均匀区域保持 255");
}

// 2x2 全透明：保持 0。
{
  const alpha = Uint8ClampedArray.from([0, 0, 0, 0]);
  const blurred = gaussianBlurAlpha(alpha, 2, 2, 4);
  for (let i = 0; i < 4; i += 1) {
    assert.equal(blurred[i], 0, `全透明区域 [${i}] 不应被抬升`);
  }
  console.log("  ✓ 全透明均匀区域保持 0");
}

// 垂直边缘（3x3，中间一列前景）：模糊后中间列两侧列 alpha>0。
{
  // 行主序，列：背景 / 前景 / 背景
  const alpha = Uint8ClampedArray.from([
    0, 255, 0,
    0, 255, 0,
    0, 255, 0,
  ]);
  const blurred = gaussianBlurAlpha(alpha, 3, 3, 2);
  // 取中间行的左、中、右
  assert.ok(blurred[3] > 0, "左列应渗入");
  assert.ok(blurred[5] > 0, "右列应渗入");
  assert.ok(blurred[4] > 0, "中列应仍有主体 alpha");
  console.log("  ✓ 垂直边缘两侧渗入（横向 box 通道生效）");
}

// 输出长度与输入一致，且每个值在 [0,255]。
{
  const alpha = Uint8ClampedArray.from([0, 128, 255, 64, 0, 200]);
  const blurred = gaussianBlurAlpha(alpha, 3, 2, 3);
  assert.equal(blurred.length, alpha.length, "长度必须不变");
  for (const v of blurred) {
    assert.ok(v >= 0 && v <= 255, `alpha 越界：${v}`);
  }
  console.log("  ✓ 输出定长且值域 [0,255]");
}

console.log("\n通过 5 项");
