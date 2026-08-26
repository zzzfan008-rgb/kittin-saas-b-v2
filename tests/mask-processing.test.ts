import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  compositeMaskedEdit,
  prepareMaskForGeneration,
} from "../server/lib/maskProcessing";
import { normalizeMaskCompositeMode } from "../src/types/workflow";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

async function solidImage(
  width: number,
  height: number,
  color: { r: number; g: number; b: number },
): Promise<string> {
  const buffer = await sharp({ create: { width, height, channels: 3, background: color } }).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function rectangularMask(
  width: number,
  height: number,
  rectangle: { left: number; top: number; width: number; height: number },
): Promise<string> {
  const pixels = Buffer.alloc(width * height * 4, 255);
  for (let y = rectangle.top; y < rectangle.top + rectangle.height; y += 1) {
    for (let x = rectangle.left; x < rectangle.left + rectangle.width; x += 1) {
      pixels[(y * width + x) * 4 + 3] = 0;
    }
  }
  const buffer = await sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function transparentPatch(
  width: number,
  height: number,
  rectangle: { left: number; top: number; width: number; height: number },
  color: { r: number; g: number; b: number },
): Promise<string> {
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = rectangle.top; y < rectangle.top + rectangle.height; y += 1) {
    for (let x = rectangle.left; x < rectangle.left + rectangle.width; x += 1) {
      const offset = (y * width + x) * 4;
      pixels[offset] = color.r;
      pixels[offset + 1] = color.g;
      pixels[offset + 2] = color.b;
      pixels[offset + 3] = 255;
    }
  }
  const buffer = await sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function rawImage(dataUrl: string) {
  return sharp(Buffer.from(dataUrl.split(",")[1], "base64"))
    .raw()
    .toBuffer({ resolveWithObject: true });
}

function pixel(
  image: Awaited<ReturnType<typeof rawImage>>,
  x: number,
  y: number,
): { r: number; g: number; b: number; a?: number } {
  const offset = (y * image.info.width + x) * image.info.channels;
  return {
    r: image.data[offset],
    g: image.data[offset + 1],
    b: image.data[offset + 2],
    ...(image.info.channels === 4 ? { a: image.data[offset + 3] } : {}),
  };
}

function assertRgbNear(
  actual: ReturnType<typeof pixel>,
  expected: { r: number; g: number; b: number; a?: number },
  tolerance = 4,
): void {
  assert.ok(Math.abs(actual.r - expected.r) <= tolerance, `red ${actual.r} != ${expected.r}`);
  assert.ok(Math.abs(actual.g - expected.g) <= tolerance, `green ${actual.g} != ${expected.g}`);
  assert.ok(Math.abs(actual.b - expected.b) <= tolerance, `blue ${actual.b} != ${expected.b}`);
  if (expected.a !== undefined) assert.equal(actual.a, expected.a);
}

console.log("蒙版合成回归测试");

const width = 128;
const height = 128;
const source = await solidImage(width, height, { r: 35, g: 92, b: 165 });
const mask = await rectangularMask(width, height, { left: 40, top: 40, width: 48, height: 48 });

await test("保持原图模式只叠加透明修改层，不改变选区内未生成区域的底色", async () => {
  const patch = await transparentPatch(
    width,
    height,
    { left: 52, top: 52, width: 24, height: 24 },
    { r: 225, g: 42, b: 48 },
  );
  const output = await compositeMaskedEdit(source, mask, patch, { mode: "preserve" });
  const decoded = await rawImage(output);
  assertRgbNear(pixel(decoded, 64, 64), { r: 225, g: 42, b: 48, a: 255 });
  assert.deepEqual(pixel(decoded, 44, 64), { r: 35, g: 92, b: 165, a: 255 });
  assert.deepEqual(pixel(decoded, 8, 8), { r: 35, g: 92, b: 165, a: 255 });
});

await test("保持原图模式拒绝整块不透明返回，避免污染原图底色", async () => {
  const opaque = await solidImage(width, height, { r: 225, g: 42, b: 48 });
  await assert.rejects(
    () => compositeMaskedEdit(source, mask, opaque, { mode: "preserve" }),
    /透明修改层|整块不透明选区/,
  );
});

await test("模型蒙版自动增加安全过渡区，核心边缘外仍可生成完整内容", async () => {
  const providerMask = await prepareMaskForGeneration(source, mask);
  const decoded = await rawImage(providerMask);
  assert.equal(pixel(decoded, 40, 64).a, 0, "核心选区必须继续可编辑");
  assert.equal(pixel(decoded, 37, 64).a, 0, "核心选区外应增加可编辑安全区");
  assert.equal(pixel(decoded, 30, 64).a, 255, "远离选区的位置必须继续受保护");
});

await test("旧项目默认迁移到保持原图模式，显式替换模式保持不变", () => {
  assert.equal(normalizeMaskCompositeMode(undefined), "preserve");
  assert.equal(normalizeMaskCompositeMode("preserve"), "preserve");
  assert.equal(normalizeMaskCompositeMode("replace"), "replace");
});

await test("节点同时展示两种处理方式及简约说明", () => {
  const sourceCode = fs.readFileSync(path.join(REPO_ROOT, "src/components/nodes/MaskRedrawNode.tsx"), "utf8");
  assert.match(sourceCode, /保持原图/);
  assert.match(sourceCode, /添加印花、刺绣或装饰，保留底色与光影/);
  assert.match(sourceCode, /替换选区/);
  assert.match(sourceCode, /改色、去除或重做，选区内容可能整体变化/);
});

console.log(`\n${passed} 项蒙版合成测试全部通过`);
