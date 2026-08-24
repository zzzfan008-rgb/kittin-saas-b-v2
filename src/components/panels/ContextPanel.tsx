import { useEffect, useRef, useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { HistoryIcon, SlidersHorizontalIcon } from "lucide-react";
import { useFlowStore } from "@/store/flowStore";
import { cn } from "@/lib/utils";
import { InspectorPanel } from "./InspectorPanel";
import { ResultsPanel } from "./ResultsPanel";

type ContextTab = "properties" | "results";

interface ContextPanelProps {
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/**
 * 右侧上下文 Dock：属性和跨项目结果共用一个面板，但两个 Panel
 * 始终 keepMounted，切换 Tab 不会丢失滚动位置、加载状态或详情上下文。
 */
export function ContextPanel({
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  className,
}: ContextPanelProps) {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const selectedResultId = useFlowStore((state) => state.selectedResultId);
  const [activeTab, setActiveTab] = useState<ContextTab>(
    selectedResultId ? "results" : "properties",
  );
  const previousSelection = useRef({ selectedNodeId, selectedResultId });

  useEffect(() => {
    const previous = previousSelection.current;
    if (selectedResultId && selectedResultId !== previous.selectedResultId) {
      setActiveTab("results");
    } else if (selectedNodeId && selectedNodeId !== previous.selectedNodeId) {
      setActiveTab("properties");
    }
    previousSelection.current = { selectedNodeId, selectedResultId };
  }, [selectedNodeId, selectedResultId]);

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(value) => setActiveTab(value === "results" ? "results" : "properties")}
      className={cn("gc-panel flex h-full min-h-0 w-full flex-col bg-[var(--gc-panel)]", className)}
    >
      <Tabs.List
        aria-label="右侧上下文"
        className="relative grid h-10 shrink-0 grid-cols-2 border-b border-[var(--gc-border)] bg-[var(--gc-panel)] p-1"
      >
        <Tabs.Tab
          value="properties"
          className={({ active }) => cn(
            "flex items-center justify-center gap-1.5 rounded-sm text-[10px] font-medium transition-colors",
            active
              ? "bg-[var(--gc-panel-hover)] text-[var(--gc-accent)]"
              : "text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]",
          )}
        >
          <SlidersHorizontalIcon aria-hidden="true" className="size-3.5" />
          属性
        </Tabs.Tab>
        <Tabs.Tab
          value="results"
          className={({ active }) => cn(
            "flex items-center justify-center gap-1.5 rounded-sm text-[10px] font-medium transition-colors",
            active
              ? "bg-[var(--gc-panel-hover)] text-[var(--gc-accent)]"
              : "text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]",
          )}
        >
          <HistoryIcon aria-hidden="true" className="size-3.5" />
          结果 / 记录
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="properties" keepMounted className="min-h-0 flex-1">
        <InspectorPanel view="properties" className="h-full w-full border-0" />
      </Tabs.Panel>
      <Tabs.Panel value="results" keepMounted className="min-h-0 flex-1">
        <div className="flex h-full min-h-0 flex-col">
          <ResultsPanel
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
            className="min-h-40 max-h-[46%] shrink-0 border-b border-[var(--gc-border)]"
          />
          <InspectorPanel view="result" className="min-h-0 w-full flex-1 border-0" />
        </div>
      </Tabs.Panel>
    </Tabs.Root>
  );
}
