import { isLocalImageReference } from "./imageValidation";

const PREFIX = "/api/files/";
// 与 isLocalImageReference 同口径：只认单段文件名的四种图片扩展。
export const LOCAL_IMAGE_REF_RE = /\/api\/files\/[A-Za-z0-9_-]{1,128}\.(?:png|jpe?g|webp|gif)/g;

/** 递归收集 value 中所有合法的本地图片引用（/api/files/xxx.(png|jpg…)）。 */
export function collectLocalImageRefs(value: unknown, output = new Set<string>()): Set<string> {
  if (typeof value === "string") {
    if (value.startsWith(PREFIX) && isLocalImageReference(value)) output.add(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectLocalImageRefs(item, output);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectLocalImageRefs(item, output);
  }
  return output;
}

/**
 * 递归剥除命中的本地引用：数组元素直接移除（如 outputImages），
 * 对象属性置 null（如 mask/maskSourceRef/editInputRef）。返回清除计数。
 * 只处理字符串叶子；对象/数组结构原位保留，避免破坏节点形状。
 */
export function stripLocalImageRefs(
  value: unknown,
  shouldStrip: (ref: string) => boolean,
): { value: unknown; removed: number } {
  let removed = 0;
  const walk = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      const out: unknown[] = [];
      for (const item of input) {
        if (typeof item === "string" && shouldStrip(item)) {
          removed += 1;
          continue;
        }
        out.push(walk(item));
      }
      return out;
    }
    if (input && typeof input === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(input as Record<string, unknown>)) {
        if (typeof item === "string" && shouldStrip(item)) {
          out[key] = null;
          removed += 1;
          continue;
        }
        out[key] = walk(item);
      }
      return out;
    }
    return input;
  };
  return { value: walk(value), removed };
}
