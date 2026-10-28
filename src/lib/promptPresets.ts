/**
 * AUTO-GENERATED — 不要手改。
 *
 * 由 scripts/gen-prompt-mirrors.mjs 从 server/lib/promptPresetsFrozen.ts 生成，
 * 落到 src/lib/promptPresets.ts。
 * 改提示词请改服务端冻结表，然后跑：npm run gen:presets
 *
 * 客户端不能 import server/（depcruise 强制隔离），故以生成副本形式共享同一份文本。
 */
import type { ImageOperationMode } from "@/types/imageOperations";

export interface TextPresetTemplate {
  /** 稳定 id（family id），下拉 value 用。 */
  id: string;
  /** 下拉显示名称。 */
  name: string;
  /** 冻结表键 `${familyId}:${mode}`，一致性测试锁定用。 */
  frozenKey: string;
  /** 模板正文（与服务端 PRESET_TEMPLATE_TEXTS 同源同值）。 */
  text: string;
}

/** 文字节点预设目录（下拉顺序即此顺序）。 */
export const TEXT_PROMPT_PRESETS: readonly TextPresetTemplate[] = [
  {
    id: "fashion-lookbook",
    name: "写实穿搭",
    frozenKey: "fashion-lookbook:generate",
    text: "写实穿搭生成。按正文描述的场合、风格、身材与服装，生成一位模特穿着相应服装的单人全身品牌 Lookbook：平视机位、中远景、约 50mm 视角，人物完整入镜、主体居中并留呼吸空间；动作自然，可有轻微行走或衣摆运动，但不得摆拍僵硬。\n服装的版型、颜色、分割线、图案、缝线、褶皱、垂坠与真实面料按正文描述呈现，不与正文冲突；柔和自然光，克制中性背景，真实肤质和可信的小瑕疵。\n不生成文字、Logo、水印、多余人物、随机配饰、错误肢体或服装结构变形，不裁切手脚，不使用过度磨皮或塑料质感。\n用户补充要求（如为空则忽略本行）：",
  },
  {
    id: "upscale",
    name: "高清放大",
    frozenKey: "upscale:edit",
    text: "将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变",
  },
  {
    id: "print-extract",
    name: "印花提取",
    frozenKey: "print-extract:edit",
    text: "印花提取。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的印花来源。\n把参考图1衣服上的印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影、透视变形和穿着效果；印花的比例、细节与色彩与原始印花保持一致，边缘干净，适合作为印花素材复用。\n不新增、不改写、不重绘印花元素。\n用户补充要求（如为空则忽略本行）：",
  },
  {
    id: "print-mutate",
    name: "印花变体",
    frozenKey: "print-mutate:edit",
    text: "印花裂变。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=原始印花，是唯一的风格与配色来源。\n基于参考图1生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图、疏密与组合方式，纯白背景，图案完整不裁切，适合作为印花素材复用。\n不引入与原印花无关的新题材，不改动原有单元素的造型语言。\n用户补充要求（如为空则忽略本行）：",
  },
  {
    id: "fabric-recolor",
    name: "面料换色",
    frozenKey: "fabric-recolor:edit",
    text: "服装换色。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源与唯一的版型来源。\n保持参考图1的版型、款式细节、分割线、缝线、褶皱走向、构图和光线完全不变，仅将面料配色替换为正文指定的配色；配色只作用于面料主体，保留原面料的织法、光泽与明暗层次，不改变服装结构与背景。\n无文字、无 Logo、无水印。\n用户补充要求（如为空则忽略本行）：",
  },
];

/** 可选 polish 条目（独立导出，不进 v1 目录）。 */
export const OPTIONAL_PROMPT_POLISH_PRESET: TextPresetTemplate = {
  id: "prompt-polish",
  name: "提示词精修",
  frozenKey: "prompt-polish:edit",
  text: "你是一位服装视觉提示词编辑。请将用户输入的意图润色为一段结构化、可直接用于文生图模型的中文提示词。\n要求：\n1. 保留用户原意的核心服装品类、款式、颜色、面料、目标人群与场景。\n2. 补充合理的构图、光线、背景与质感描述，但不臆造用户未提及的关键元素。\n3. 使用中文输出，避免英文术语堆砌；句法简洁、可读性强。\n4. 不要生成任何解释、Markdown 标题或列表符号；只输出一段连续正文。",
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
