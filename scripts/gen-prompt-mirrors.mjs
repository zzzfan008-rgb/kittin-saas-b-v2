/**
 * 提示词镜像生成器（唯一手写源 = server/lib/promptPresetsFrozen.ts）。
 *
 * 背景（2026-10-28 用户拍板方案 A）：改一句提示词原本要手工同步 3 份文本
 * （服务端冻结表、客户端迁移镜像、客户端预设目录），改一次要动 4 个文件并重算
 * 3 组测试快照。现改为「一个手写源 + 两份生成物」：
 *
 *   手写源   server/lib/promptPresetsFrozen.ts  （PRESET_TEMPLATE_TEXTS 等）
 *   生成物①  src/lib/promptPresetsFrozenClient.ts （v8→v9 客户端迁移镜像）
 *   生成物②  src/lib/promptPresets.ts             （文字节点预设目录，UI 下拉）
 *
 * 生成物文件带 AUTO-GENERATED 头，**不要手改**——改手写源后跑：
 *   npm run gen:presets
 *
 * 漂移防护仍由 tests/prompt-presets-catalog.test.ts 逐字锁定；若有人手改了生成物
 * 而没重跑本脚本，那条测试会红。
 *
 * 为什么必须生成而不是运行时共享：src/ 与 server/ 由 depcruise 强制隔离，
 * 客户端不能 import 服务端模块。
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { PRESET_TEMPLATE_TEXTS, FROZEN_PRESET_FAMILY_IDS } = await import(
  "../server/lib/promptPresetsFrozen.ts"
);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * 预设目录（文字节点下拉）的成员与显示名。
 * 只有出现在这里的 family 才会进 UI 下拉；顺序即下拉顺序。
 * 显示名是纯 UI 概念，服务端没有对应字段，故在此维护。
 */
const CATALOG_ENTRIES = [
  { id: "fashion-lookbook", name: "写实穿搭", key: "fashion-lookbook:generate" },
  { id: "upscale", name: "高清放大", key: "upscale:edit" },
  { id: "print-extract", name: "印花提取", key: "print-extract:edit" },
  { id: "print-mutate", name: "印花变体", key: "print-mutate:edit" },
  { id: "fabric-recolor", name: "面料换色", key: "fabric-recolor:edit" },
];

/** 可选 polish 条目（独立导出，不进 v1 目录）。 */
const OPTIONAL_POLISH = { id: "prompt-polish", name: "提示词精修", key: "prompt-polish:edit" };

function textOf(key) {
  const entry = PRESET_TEMPLATE_TEXTS[key];
  if (!entry) throw new Error(`冻结表缺少条目 ${key}，无法生成客户端镜像`);
  return entry.text;
}

const HEADER = (target) =>
  `/**\n * AUTO-GENERATED — 不要手改。\n *\n * 由 scripts/gen-prompt-mirrors.mjs 从 server/lib/promptPresetsFrozen.ts 生成，\n * 落到 ${target}。\n * 改提示词请改服务端冻结表，然后跑：npm run gen:presets\n *\n * 客户端不能 import server/（depcruise 强制隔离），故以生成副本形式共享同一份文本。\n */\n`;

// ---------- 生成物①：客户端迁移镜像 ----------

function buildFrozenClient() {
  const entries = Object.entries(PRESET_TEMPLATE_TEXTS).map(([key, value]) => {
    return `  ${JSON.stringify(key)}: { familyId: ${JSON.stringify(value.familyId)}, mode: ${JSON.stringify(value.mode)}, text: ${JSON.stringify(value.text)} },`;
  });

  return `${HEADER("src/lib/promptPresetsFrozenClient.ts")}import type { ImageOperationMode } from "@/types/imageOperations";

export interface FrozenPromptBinding {
  familyId: string;
  mode: ImageOperationMode;
  /** 预设模板正文 = 服务端 PRESET_TEMPLATE_TEXTS 的 text（生成时逐字复制）。 */
  text: string;
}

/** 全量冻结绑定表（键 = \`\${familyId}:\${mode}\`）。 */
export const FROZEN_PROMPT_BINDING_MAP: Readonly<Record<string, FrozenPromptBinding>> = {
${entries.join("\n")}
};

/**
 * variantId 格式：\`\${familyId}.\${modelId}.\${mode}.v1\`
 * familyId: 小写字母+连字符；modelId: 小写字母/数字/点/连字符；mode: generate | edit | mask-edit
 */
const VARIANT_ID_PATTERN = /^([a-z-]+)\\.([a-z0-9.-]+)\\.(generate|edit|mask-edit)\\.v1$/;

/**
 * 按 variantId 解析冻结预设绑定（v8→v9 迁移消费）。
 * 未知 familyId / mode / 格式 → undefined（调用方丢弃绑定，fail-closed 不猜）。
 */
export function frozenPromptBindingForVariantId(variantId: string): FrozenPromptBinding | undefined {
  const match = VARIANT_ID_PATTERN.exec(variantId);
  if (!match) return undefined;
  return FROZEN_PROMPT_BINDING_MAP[\`\${match[1]}:\${match[3]}\`];
}

/** 取某 family+mode 的冻结 prompt 正文；无对应项返回 undefined。 */
export function frozenPromptText(familyId: string, mode: ImageOperationMode): string | undefined {
  return FROZEN_PROMPT_BINDING_MAP[\`\${familyId}:\${mode}\`]?.text;
}

/** 全量族列表（与服务端 FROZEN_PRESET_FAMILY_IDS 同序同值）。 */
export const FROZEN_PROMPT_FAMILY_IDS = [
${FROZEN_PRESET_FAMILY_IDS.map((id) => `  ${JSON.stringify(id)},`).join("\n")}
] as const;

/** 冻结表条目数。 */
export const FROZEN_PROMPT_ENTRY_COUNT = Object.keys(FROZEN_PROMPT_BINDING_MAP).length;
`;
}

// ---------- 生成物②：客户端预设目录 ----------

function buildCatalog() {
  const items = CATALOG_ENTRIES.map((entry) => `  {
    id: ${JSON.stringify(entry.id)},
    name: ${JSON.stringify(entry.name)},
    frozenKey: ${JSON.stringify(entry.key)},
    text: ${JSON.stringify(textOf(entry.key))},
  },`).join("\n");

  return `${HEADER("src/lib/promptPresets.ts")}import type { ImageOperationMode } from "@/types/imageOperations";

export interface TextPresetTemplate {
  /** 稳定 id（family id），下拉 value 用。 */
  id: string;
  /** 下拉显示名称。 */
  name: string;
  /** 冻结表键 \`\${familyId}:\${mode}\`，一致性测试锁定用。 */
  frozenKey: string;
  /** 模板正文（与服务端 PRESET_TEMPLATE_TEXTS 同源同值）。 */
  text: string;
}

/** 文字节点预设目录（下拉顺序即此顺序）。 */
export const TEXT_PROMPT_PRESETS: readonly TextPresetTemplate[] = [
${items}
];

/** 可选 polish 条目（独立导出，不进 v1 目录）。 */
export const OPTIONAL_PROMPT_POLISH_PRESET: TextPresetTemplate = {
  id: ${JSON.stringify(OPTIONAL_POLISH.id)},
  name: ${JSON.stringify(OPTIONAL_POLISH.name)},
  frozenKey: ${JSON.stringify(OPTIONAL_POLISH.key)},
  text: ${JSON.stringify(textOf(OPTIONAL_POLISH.key))},
};

const presetById = new Map(TEXT_PROMPT_PRESETS.map((p) => [p.id, p]));

/** 获取目录全部模板（不含可选 polish）。 */
export function listTextPresetTemplates(): readonly TextPresetTemplate[] {
  return TEXT_PROMPT_PRESETS;
}

/** 按 id 查找模板（目录内查找，不含 polish）。 */
export function getTextPresetTemplate(id: string): TextPresetTemplate | undefined {
  return presetById.get(id);
}

// 类型占位：保持 ImageOperationMode 在本文件可见（目录与冻结模式共用同一枚举）。
export type { ImageOperationMode };
`;
}

const targets = [
  ["src/lib/promptPresetsFrozenClient.ts", buildFrozenClient()],
  ["src/lib/promptPresets.ts", buildCatalog()],
];

// --check：只比对不写入，生成物与手写源不一致即退出码 1（CI / 门禁用）。
const checkOnly = process.argv.includes("--check");
const drift = [];

for (const [rel, content] of targets) {
  const abs = path.join(ROOT, rel);
  if (checkOnly) {
    let current = "";
    try {
      current = readFileSync(abs, "utf8");
    } catch {
      current = "";
    }
    if (current !== content) drift.push(rel);
    continue;
  }
  writeFileSync(abs, content);
  console.log(`  写入 ${rel}`);
}

if (checkOnly) {
  if (drift.length > 0) {
    console.error(`✗ 以下生成物与 server/lib/promptPresetsFrozen.ts 不一致，请跑 npm run gen:presets：`);
    for (const rel of drift) console.error(`    ${rel}`);
    process.exit(1);
  }
  console.log(`✓ 提示词镜像与手写源一致（${targets.length} 个生成物）`);
} else {
  console.log(`✓ 提示词镜像已生成（${Object.keys(PRESET_TEMPLATE_TEXTS).length} 条文本 / ${CATALOG_ENTRIES.length} 个目录项）`);
}
