/**
 * Curated preview covers for built-in workflows. Keeping this map in code
 * gives the launcher and project center one consistent visual story without
 * changing the template API contract or relying on stale stored thumbnails.
 *
 * 不变量（R-97）：key 必须是 `server/routes/templates.ts` `builtinTemplates()` 里现役的 v8
 * 模板 id（同表见 `src/lib/workflowMenuMapping.ts`）。模板 id 退役或改名时这里必须同步改名，
 * 否则命中不到 key、该模板静默落到 `thumbnail ?? flowPreviewImage(flow)` 通用兜底，
 * 且不会有任何报错 —— R-97 修的正是这个：6 个 key 全是已退役的 v7 id。
 * 没有专属封面资源的模板继续走兜底，不新增设计资产。
 */
export const BUILTIN_TEMPLATE_COVERS: Record<string, string> = {
  // 线稿图到服装（封面：草图输入 → 效果图渲染 → 高清放大）
  "builtin-sketch-to-garment": "/assets/project-center/templates/sketch-upscale.webp",
  // 穿搭推荐（纯文生图；封面：生成提示词 → 生成结果）
  "builtin-outfit-recommend": "/assets/project-center/templates/text-to-image.webp",
  // AI 改款（封面第三格即「AI 改款 | 调整廓形与细节」）
  "builtin-ai-restyle": "/assets/project-center/templates/sketch-recolor.webp",
  // 服装换色（封面：文字描述 → 主款效果 → 多配色 | 保持款式批量换色）
  "builtin-garment-recolor": "/assets/project-center/templates/text-recolor.webp",
  // 面料更换（封面：原始图案 + 参考风格 → 图案自然迁移到成衣）
  "builtin-fabric-swap": "/assets/project-center/templates/pattern-style-transfer.webp",
  // 更换背景（封面：人物主体 + 场景参考 → 融合画面）
  "builtin-background-swap": "/assets/project-center/templates/person-scene-transfer.webp",
};
