/**
 * 左侧悬浮工具栏配置：4 个带菜单的入口（「添加」+ 3 个工作流）
 * + AI 画板 + 「属性 / 结果」面板入口。
 *
 * 色彩工具入口已按 `docs/design/2026-09-19-workbench-entry-wiring/plan.md` §0.3 / §3
 * 从 Rail 移除，只保留在文本节点内（v8 落在 text 节点工具条，见
 * `docs/design/2026-09-21-five-node-model/plan.md` §5）。
 *
 * 菜单项动作（workflow action）与内置模板的映射在 `src/lib/workflowMenuMapping.ts`。
 */
import type { ReactNode } from "react";
import {
  PaletteIcon,
  PlusIcon,
  ScissorsIcon,
  ShirtIcon,
  SparklesIcon,
  VideoIcon,
} from "lucide-react";

export interface RailMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  /** 「添加」菜单：直接新建的基础节点种类 */
  nodeKind?: "text" | "image" | "video";
  /** 「添加」菜单：需要节点上下文才能打开的资产库入口 */
  needsNodeContext?: boolean;
}
export interface RailEntry {
  id: string;
  label: string;
  icon: ReactNode;
  /** 有菜单的工作流；无菜单的入口点击直接触发 action */
  items?: RailMenuItem[];
  /** 面板入口（属性/结果）：点击开合左侧 Dock，不弹菜单 */
  panel?: "inspector";
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 菜单项内的小图标（线性 16px） */
function ico(path: ReactNode) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...stroke}>
      {path}
    </svg>
  );
}

export const RAIL_ENTRIES: RailEntry[] = [
  {
    id: "add",
    label: "添加",
    icon: <PlusIcon aria-hidden="true" />,
    items: [
      { id: "text", label: "文本", nodeKind: "text", icon: ico(<><path d="M4 6h16v12H4z" /><path d="M8 10h8M8 14h5" /></>) },
      { id: "image", label: "图片", nodeKind: "image", icon: ico(<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 5-4 4 3 3-2 4 3" /></>) },
      { id: "video", label: "视频", nodeKind: "video", icon: ico(<><rect x="3" y="6" width="14" height="12" rx="2" /><path d="m17 10 4-2v8l-4-2z" /></>) },
      { id: "asset", label: "从资产库选择", needsNodeContext: true, icon: ico(<><path d="M3 7h18v13H3z" /><path d="m7 13 3-3 3 2 4-4" /></>) },
    ],
  },
  {
    id: "ai-tryon",
    label: "AI 换装工作流",
    icon: (
      <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" {...stroke}>
        <circle cx="12" cy="7" r="3.2" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
    items: [
      { id: "model-tryon", label: "模特试穿", icon: ico(<><circle cx="12" cy="7" r="3" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>) },
      { id: "pose", label: "摆拍 Pose", icon: ico(<><circle cx="12" cy="7" r="3" /><path d="M6 20l2-6 4 2 4-2 2 6" /><path d="m9 11 3 2 3-2" /></>) },
      { id: "background", label: "更换背景", icon: ico(<><rect x="3" y="4" width="18" height="12" rx="2" /><circle cx="8" cy="8.5" r="1.4" /><path d="m3 14 5-4 4 3 3-3 6 6" /></>) },
      { id: "lookbook", label: "LookBook", icon: ico(<><rect x="3" y="8" width="8" height="11" rx="1.5" /><rect x="13" y="5" width="8" height="14" rx="1.5" /><path d="M7 11.5h.01M17 8.5h.01" /></>) },
      { id: "digital-model", label: "数字模特", icon: ico(<><rect x="4" y="4" width="16" height="16" rx="3" strokeDasharray="3 2.5" /><circle cx="12" cy="9" r="2.5" /><path d="M7 19a5 5 0 0 1 10 0" /></>) },
    ],
  },
  {
    id: "ai-design",
    label: "服装设计工作流",
    icon: <ShirtIcon aria-hidden="true" />,
    items: [
      { id: "print-extract", label: "印花提取", icon: ico(<><circle cx="12" cy="12" r="8" /><path d="M12 4v8l5 3" /></>) },
      { id: "print-mutate", label: "印花裂变", icon: ico(<><path d="M12 3v6M9 6h6M5 12c0 4 3 8 7 8s7-4 7-8" /><path d="M8 14c2 1 6 1 8 0" /></>) },
      { id: "recolor", label: "服装换色", icon: ico(<><path d="M12 11v3" /><path d="m9 17 3 4 3-4" /></>) },
      { id: "fabric", label: "面料更换", icon: ico(<><path d="M4 7c3-2 6-2 8 0s5 2 8 0v9c-3 2-6 2-8 0s-5-2-8 0z" /><path d="M12 7v9" /></>) },
      { id: "sketch-render", label: "线稿图到服装", icon: ico(<><path d="m4 20 4-9 5 4-3 5z" /><path d="M8 11l4-5 8-3-3 8-5 4" /></>) },
      { id: "ai-restyle", label: "AI 改款", icon: ico(<><path d="M6 11v9h12v-9" /><path d="M9 16h6" /></>) },
      { id: "outfit", label: "穿搭推荐", icon: ico(<><circle cx="12" cy="7" r="3" /><path d="M6 20l1-5h10l1 5" /></>) },
      { id: "mannequin", label: "真人转人台", icon: ico(<><circle cx="12" cy="7" r="3" /><path d="M6 20l1-5h10l1 5" /><path d="M9 9l3 3 3-3" /></>) },
    ],
  },
  {
    id: "ai-video",
    label: "视频生成工作流",
    icon: <VideoIcon aria-hidden="true" />,
    items: [
      { id: "runway", label: "服装走秀", icon: ico(<path d="M13 4 7 12h4l-1 8 6-8h-4z" />) },
      { id: "xhs", label: "小红书视频", icon: ico(<><rect x="4" y="3" width="16" height="18" rx="3" /><circle cx="12" cy="14" r="3" /><circle cx="9" cy="7.5" r=".9" /></>) },
      { id: "keyframes", label: "首尾帧", icon: ico(<><rect x="3" y="5" width="7" height="9" rx="1.5" /><rect x="14" y="10" width="7" height="9" rx="1.5" /><path d="M10 9.5h4M14 10l-3 2.5" /></>) },
      { id: "video-clone", label: "视频复刻", icon: ico(<><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /><path d="M7 9.5h.01" /></>) },
    ],
  },
  {
    id: "canvas",
    label: "AI 画板",
    icon: <PaletteIcon aria-hidden="true" />,
  },
  {
    id: "inspector",
    label: "属性 / 结果",
    panel: "inspector",
    icon: (
      <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" {...stroke}>
        <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h13M18 18h2" />
        <circle cx="16" cy="6" r="2.2" />
        <circle cx="10" cy="12" r="2.2" />
        <circle cx="19" cy="18" r="2.2" />
      </svg>
    ),
  },
];

/** 分隔线插入位置：索引前插入（「添加」之后 / 视频生成之后 / 工具组之后） */
export const RAIL_SEPARATOR_BEFORE = [1, 4, 5] as const;

/** 无菜单入口的占位动作用图标（Sparkles 表示功能待接入） */
export const RAIL_PENDING_ICON = <SparklesIcon aria-hidden="true" />;

/** 历史组 */
export const RAIL_HISTORY = [
  { id: "undo", label: "撤销" },
  { id: "redo", label: "重做" },
] as const;

/** 工具类：剪刀（预留） */
export const RAIL_ICON_SCISSORS = <ScissorsIcon aria-hidden="true" />;
