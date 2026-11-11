import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

/**
 * 项目本地 shadcn 开关（base-ui，style: base-nova）。
 * 与 Checkbox 同源：一律组合 primitive，不手搓控件；尺寸走 `--gc-*` 主题 token。
 */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group/switch peer inline-flex h-4 w-7 shrink-0 items-center rounded-full border border-input bg-transparent p-0.5 transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:border-transparent data-checked:bg-gold",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "block size-3 rounded-full bg-foreground/70 transition-transform",
          "data-checked:translate-x-3 data-checked:bg-[var(--gc-accent-cta-ink)]",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
