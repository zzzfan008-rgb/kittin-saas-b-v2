/**
 * 卡 #61：内置中文颜色字典。
 *
 * 自定义色从本字典就近匹配最近的预设色名；字典按 hex 规范化存储（大写 #RRGGBB）。
 * 匹配策略：欧几里得距离在 RGB 空间取最近邻。
 *
 * 来源参考：CSS 颜色关键词 + 中文常用色名（服装/设计行业）。
 * 每个条目：`{ hex, name }`，hex 规范化为 `#RRGGBB`（大写）。
 */

export interface ColorEntry {
  hex: string; // #RRGGBB 大写
  name: string; // 中文名称
}

/** 内置中文颜色字典（≈ 200 色，覆盖服装/设计常用色）。 */
export const CHINESE_COLOR_DICTIONARY: readonly ColorEntry[] = [
  // ── 无彩色 ──────────────────────────────────────────────────────────
  { hex: "#FFFFFF", name: "白" },
  { hex: "#F5F5F5", name: "浅灰" },
  { hex: "#E0E0E0", name: "银灰" },
  { hex: "#C0C0C0", name: "灰色" },
  { hex: "#A9A9A9", name: "暗灰" },
  { hex: "#808080", name: "灰" },
  { hex: "#696969", name: "深灰" },
  { hex: "#505050", name: "炭灰" },
  { hex: "#333333", name: "墨灰" },
  { hex: "#1A1A1A", name: "炭黑" },
  { hex: "#000000", name: "黑" },

  // ── 暖色系 ──────────────────────────────────────────────────────────
  { hex: "#FF4500", name: "橙红" },
  { hex: "#FF6347", name: "番茄红" },
  { hex: "#FF5722", name: "朱红" },
  { hex: "#FF4D00", name: "橙红" },
  { hex: "#FF3D00", name: "鲜红" },
  { hex: "#E53935", name: "中国红" },
  { hex: "#D32F2F", name: "红" },
  { hex: "#C62828", name: "深红" },
  { hex: "#B71C1C", name: "暗红" },
  { hex: "#880E4F", name: "枣红" },
  { hex: "#FFEB3B", name: "明黄" },
  { hex: "#FDD835", name: "金黄" },
  { hex: "#F9A825", name: "橙黄" },
  { hex: "#F57F17", name: "土黄" },
  { hex: "#FF8F00", name: "琥珀" },
  { hex: "#F57C00", name: "橙" },
  { hex: "#EF6C00", name: "深橙" },
  { hex: "#E65100", name: "赭石" },
  { hex: "#FF7043", name: "珊瑚" },
  { hex: "#FF5722", name: "朱砂" },
  { hex: "#BF360C", name: "棕红" },
  { hex: "#8D6E63", name: "棕" },
  { hex: "#6D4C41", name: "深棕" },
  { hex: "#5D4037", name: "咖啡" },
  { hex: "#4E342E", name: "巧克力" },
  { hex: "#3E2723", name: "栗色" },

  // ── 黄/米色系 ──────────────────────────────────────────────────────
  { hex: "#FFFDE7", name: "月白" },
  { hex: "#FFF9C4", name: "鹅黄" },
  { hex: "#FFF59D", name: "淡黄" },
  { hex: "#FFEE58", name: "黄" },
  { hex: "#FDD835", name: "金黄" },
  { hex: "#FBC02D", name: "明黄" },
  { hex: "#F9A825", name: "土黄" },
  { hex: "#F57F17", name: "赭黄" },
  { hex: "#FFF8E1", name: "米色" },
  { hex: "#FFE0B2", name: "杏色" },
  { hex: "#FFCC80", name: "蜜色" },
  { hex: "#FFB74D", name: "焦糖" },
  { hex: "#FFA726", name: "橙棕" },
  { hex: "#FF9800", name: "橙" },
  { hex: "#FFB300", name: "金" },
  { hex: "#FFA000", name: "深金" },
  { hex: "#FF6F00", name: "琥珀" },
  { hex: "#EF6C00", name: "深琥珀" },
  { hex: "#E65100", name: "酱色" },
  { hex: "#D84315", name: "酱红" },
  { hex: "#F5F5DC", name: "米白" },
  { hex: "#FAFAD2", name: "浅月黄" },
  { hex: "#FFFFE0", name: "淡黄" },
  { hex: "#FAEBD7", name: "浅杏" },
  { hex: "#F5DEB3", name: "麦色" },
  { hex: "#DEB887", name: "驼色" },
  { hex: "#D2B48C", name: "浅驼" },
  { hex: "#C19A6B", name: "卡其" },
  { hex: "#BDB76B", name: "橄榄" },
  { hex: "#F0E68C", name: "淡绿黄" },
  { hex: "#EEE8AA", name: "淡金黄" },

  // ── 绿色系 ──────────────────────────────────────────────────────────
  { hex: "#F1F8E9", name: "浅青" },
  { hex: "#DCEDC8", name: "浅绿" },
  { hex: "#C5E1A5", name: "淡绿" },
  { hex: "#AED581", name: "薄荷" },
  { hex: "#9CCC65", name: "浅绿" },
  { hex: "#8BC34A", name: "草绿" },
  { hex: "#7CB342", name: "绿" },
  { hex: "#689F38", name: "深绿" },
  { hex: "#558B2F", name: "墨绿" },
  { hex: "#33691E", name: "翠绿" },
  { hex: "#1B5E20", name: "松绿" },
  { hex: "#E8F5E9", name: "浅薄荷" },
  { hex: "#C8E6C9", name: "粉绿" },
  { hex: "#A5D6A7", name: "淡薄荷" },
  { hex: "#81C784", name: "薄荷绿" },
  { hex: "#66BB6A", name: "青绿" },
  { hex: "#4CAF50", name: "绿" },
  { hex: "#43A047", name: "深青" },
  { hex: "#388E3C", name: "松石绿" },
  { hex: "#2E7D32", name: "深绿" },
  { hex: "#1B5E20", name: "森林绿" },
  { hex: "#004D40", name: "墨松绿" },
  { hex: "#004D40", name: "深松绿" },
  { hex: "#B2DFDB", name: "淡青" },
  { hex: "#80CBC4", name: "青" },
  { hex: "#4DB6AC", name: "薄荷青" },
  { hex: "#26A69A", name: "蓝绿" },
  { hex: "#009688", name: "青绿" },
  { hex: "#00897B", name: "深青" },
  { hex: "#00796B", name: "苔绿" },
  { hex: "#00695C", name: "深苔绿" },
  { hex: "#004D40", name: "墨绿" },

  // ── 蓝/青色系 ──────────────────────────────────────────────────────
  { hex: "#E3F2FD", name: "浅蓝" },
  { hex: "#BBDEFB", name: "淡蓝" },
  { hex: "#90CAF9", name: "天蓝" },
  { hex: "#64B5F6", name: "蓝" },
  { hex: "#42A5F5", name: "海蓝" },
  { hex: "#2196F3", name: "蓝" },
  { hex: "#1E88E5", name: "深蓝" },
  { hex: "#1976D2", name: "钴蓝" },
  { hex: "#1565C0", name: "靛蓝" },
  { hex: "#0D47A1", name: "深靛" },
  { hex: "#E8EAF6", name: "浅靛" },
  { hex: "#C5CAE9", name: "淡靛" },
  { hex: "#9FA8DA", name: "紫蓝" },
  { hex: "#7986CB", name: "石蓝" },
  { hex: "#5C6BC0", name: "靛青" },
  { hex: "#3F51B5", name: "靛蓝" },
  { hex: "#3949AB", name: "深靛" },
  { hex: "#303F9F", name: "藏青" },
  { hex: "#283593", name: "深藏青" },
  { hex: "#1A237E", name: "墨蓝" },
  { hex: "#E1F5FE", name: "极浅蓝" },
  { hex: "#B3E5FC", name: "天青" },
  { hex: "#81D4FA", name: "湖蓝" },
  { hex: "#4FC3F7", name: "水蓝" },
  { hex: "#29B6F6", name: "钴青" },
  { hex: "#03A9F4", name: "天蓝" },
  { hex: "#039BE5", name: "深天蓝" },
  { hex: "#0288D1", name: "湖青" },
  { hex: "#0277BD", name: "蓝青" },
  { hex: "#01579B", name: "深湖青" },
  { hex: "#80DEEA", name: "浅青" },
  { hex: "#4DD0E1", name: "青色" },
  { hex: "#26C6DA", name: "青" },
  { hex: "#00BCD4", name: "青" },
  { hex: "#00ACC1", name: "深青" },
  { hex: "#0097A7", name: "蓝绿青" },
  { hex: "#00838F", name: "深青" },
  { hex: "#006064", name: "墨青" },

  // ── 紫/粉色系 ──────────────────────────────────────────────────────
  { hex: "#FCE4EC", name: "浅粉" },
  { hex: "#F8BBD0", name: "淡粉" },
  { hex: "#F48FB1", name: "粉" },
  { hex: "#F06292", name: "桃粉" },
  { hex: "#EC407A", name: "玫瑰粉" },
  { hex: "#E91E63", name: "粉红" },
  { hex: "#D81B60", name: "深粉" },
  { hex: "#C2185B", name: "玫红" },
  { hex: "#AD1457", name: "深玫红" },
  { hex: "#880E4F", name: "品红" },
  { hex: "#F3E5F5", name: "浅紫" },
  { hex: "#E1BEE7", name: "淡紫" },
  { hex: "#CE93D8", name: "薰衣草" },
  { hex: "#BA68C8", name: "紫" },
  { hex: "#AB47BC", name: "洋紫" },
  { hex: "#9C27B0", name: "紫" },
  { hex: "#8E24AA", name: "深紫" },
  { hex: "#7B1FA2", name: "葡萄紫" },
  { hex: "#6A1B9A", name: "深葡萄" },
  { hex: "#4A148C", name: "墨紫" },
  { hex: "#EDE7F6", name: "浅紫藤" },
  { hex: "#D1C4E9", name: "淡藤紫" },
  { hex: "#B39DDB", name: "藤紫" },
  { hex: "#9575CD", name: "藕荷" },
  { hex: "#7E57C2", name: "紫藤" },
  { hex: "#673AB7", name: "深紫藤" },
  { hex: "#5E35B1", name: "黛紫" },
  { hex: "#512DA8", name: "深黛紫" },
  { hex: "#4527A0", name: "群青" },
  { hex: "#311B92", name: "墨紫藤" },
  { hex: "#FFF0F5", name: "浅玫瑰" },
  { hex: "#FFD1DC", name: "淡玫瑰" },
  { hex: "#FFB7C5", name: "玫瑰" },
  { hex: "#FF9CAD", name: "深玫瑰" },
  { hex: "#FF7485", name: "胭脂" },
  { hex: "#FF6B6B", name: "珊瑚红" },
  { hex: "#FF69B4", name: "粉红" },
  { hex: "#EE82EE", name: "紫红" },
  { hex: "#DA70D6", name: "兰花粉" },
  { hex: "#EE9A9A", name: "浅莲" },
  { hex: "#E8A0A0", name: "淡莲" },

  // ── 大地/服装色 ────────────────────────────────────────────────────
  { hex: "#FFF3E0", name: "浅杏" },
  { hex: "#FFE0B2", name: "杏" },
  { hex: "#FFCCBC", name: "藕粉" },
  { hex: "#FFCCBC", name: "肉色" },
  { hex: "#D7CCC8", name: "浅灰褐" },
  { hex: "#BCAAA4", name: "灰褐" },
  { hex: "#A1887F", name: "棕褐" },
  { hex: "#8D6E63", name: "可可" },
  { hex: "#795548", name: "深棕" },
  { hex: "#6D4C41", name: "咖啡色" },
  { hex: "#5D4037", name: "摩卡" },
  { hex: "#4E342E", name: "焦糖棕" },
  { hex: "#3E2723", name: "深可可" },
  { hex: "#8BC34A", name: "草绿" },
  { hex: "#689F38", name: "苔绿" },
  { hex: "#558B2F", name: "松石" },
  { hex: "#33691E", name: "墨绿" },
  { hex: "#F44336", name: "正红" },
  { hex: "#E91E63", name: "粉红" },
  { hex: "#9C27B0", name: "紫" },
  { hex: "#673AB7", name: "深紫" },
  { hex: "#3F51B5", name: "靛" },
  { hex: "#2196F3", name: "蓝" },
  { hex: "#00BCD4", name: "青" },
  { hex: "#009688", name: "青绿" },
  { hex: "#4CAF50", name: "绿" },
  { hex: "#8BC34A", name: "浅绿" },
  { hex: "#CDDC39", name: "酸橙" },
  { hex: "#FFEB3B", name: "黄" },
  { hex: "#FFC107", name: "琥珀" },
  { hex: "#FF9800", name: "橙" },
  { hex: "#FF5722", name: "深橙" },
  { hex: "#795548", name: "棕" },
  { hex: "#9E9E9E", name: "灰" },
  { hex: "#607D8B", name: "蓝灰" },
];

/** hex → RGB 三元组 */
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/** 欧几里得距离 */
function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * 给定 hex，在字典中找到中文名称最近的条目。
 * 字典按 hex 规范化（大写 #RRGGBB）存储。
 */
export function nearestColorName(hex: string): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return "未知色";
  const upper = hex.toUpperCase();
  const target = hexToRgb(upper);
  let best: ColorEntry = CHINESE_COLOR_DICTIONARY[0]!;
  let bestDist = Infinity;
  for (const entry of CHINESE_COLOR_DICTIONARY) {
    const dist = colorDistance(target, hexToRgb(entry.hex));
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }
  return best.name;
}
