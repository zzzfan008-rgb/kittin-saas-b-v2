/**
 * 卡 #61：颜色 chip 正则常量与解析工具。
 *
 * 正文格式：`{{color:#RRGGBB:名称}}`
 *
 * - 解析：提取正文中的所有 color chip。
 * - 验证：COLOR_TOKEN_RE 对非法标记 fail-closed（不渲染 chip、不展开为提示词）。
 * - 机检：ast-grep 禁止组件源码中出现裸 hex（如 `#[0-9a-fA-F]{3,6}` 在 JSX className/text 里）。
 */
import { nearestColorName } from "./chineseColorDictionary";

/** 颜色 chip 标记符全匹配正则（gc）。 */
export const COLOR_TOKEN_RE = /\{\{color:(#[0-9a-fA-F]{6}):([^}]+)\}\}/g;

/** 验证单个 hex 值是否合法（`#RRGGBB` 格式）。 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/i.test(hex);
}

/** 从正文提取所有颜色 chip。 */
export function parseColorChips(text: string): Array<{
  full: string; // 完整匹配，如 `{{color:#FF0000:红}}`
  hex: string;   // #RRGGBB（大写）
  name: string;  // 名称
  index: number; // 在原文中的起始位置
  length: number; // 完整匹配长度
}> {
  const chips: Array<{
    full: string;
    hex: string;
    name: string;
    index: number;
    length: number;
  }> = [];
  let match: RegExpExecArray | null;
  COLOR_TOKEN_RE.lastIndex = 0;
  while ((match = COLOR_TOKEN_RE.exec(text)) !== null) {
    const [, hex, name] = match;
    chips.push({
      full: match[0]!,
      hex: hex!.toUpperCase(),
      name: name!,
      index: match.index,
      length: match[0]!.length,
    });
  }
  return chips;
}

/** 从正文移除指定 index/length 的 chip。 */
export function removeColorChip(
  text: string,
  index: number,
  length: number,
): string {
  return text.slice(0, index) + text.slice(index + length);
}

/** 验证颜色 chip 标记是否合法；非法标记返回 null（fail-closed）。 */
export function validateColorChip(
  hex: string,
  name: string,
): { hex: string; name: string } | null {
  if (!isValidHex(hex)) return null;
  if (!name || name.trim().length === 0) return null;
  return { hex: hex.toUpperCase(), name: name.trim() };
}

/** 生成一个颜色 chip 字符串（用于插入正文）。 */
export function makeColorChip(hex: string, name?: string): string {
  const validated = validateColorChip(hex, name ?? "");
  if (!validated) throw new Error(`无效的 hex: ${hex}`);
  const chipName = name ?? nearestColorName(hex);
  return `{{color:${validated.hex}:${chipName}}}`;
}

/** 给定 hex，从字典就近匹配名称，生成 chip。 */
export function makeColorChipFromHex(hex: string): string {
  const name = nearestColorName(hex);
  return makeColorChip(hex, name);
}
