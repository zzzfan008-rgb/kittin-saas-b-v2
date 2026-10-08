import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

type SliderProps = Omit<
  SliderPrimitive.Root.Props<number[]>,
  "defaultValue" | "value"
> & {
  defaultValue?: number[]
  value?: number[]
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  onValueChange,
  onValueCommitted,
  ...props
}: SliderProps) {
  // R-85 受控回写契约：base-ui 1.7.0 在「单 Thumb 受控」场景下，onValueChange
  // 实际发出的 payload 是标量 number（而非 d.ts 声明的 number[]）。调用方按
  // 声明类型取 value[0] 会得到 undefined，受控 setState 被守卫挡掉，表现为
  // 真实鼠标拖动完全不生效（键盘/原生通道正常）。这里在原语层把标量/数组
  // 两种 payload 归一化为 number[] 再向上抛出，修复所有受控调用方。
  const normalizePayload = (payload: number[] | number): number[] =>
    Array.isArray(payload) ? payload : [payload]

  const handleValueChange = React.useCallback(
    (payload: number[] | number, details: unknown) => {
      onValueChange?.(normalizePayload(payload) as number[], details as never)
    },
    [onValueChange],
  )
  const handleValueCommitted = React.useCallback(
    (payload: number[] | number, details: unknown) => {
      onValueCommitted?.(normalizePayload(payload) as number[], details as never)
    },
    [onValueCommitted],
  )

  // 受控/非受控二选一：受控时不得同时把 defaultValue 传给 Root
  // （useControlled 首帧锁定模式，双传会遮蔽真实缺陷）。
  const controlled = value !== undefined
  // 按数值记忆化 value/defaultValue，保证「内容不变 => 引用稳定」，
  // 避免调用方每次渲染新建数组触发不必要的 Root 内部同步。
  const source = value ?? defaultValue
  const sourceKey = source ? source.map((v) => Number(v)).join("|") : ""
  const normalized = React.useMemo(
    () => (source ? source.map((v) => Number(v)) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceKey],
  )
  const values = React.useMemo(() => normalized ?? [min], [normalized, min])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      aria-label={ariaLabel}
      defaultValue={controlled ? undefined : normalized}
      value={controlled ? normalized : undefined}
      min={min}
      max={max}
      onValueChange={handleValueChange}
      onValueCommitted={handleValueCommitted}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center py-2 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:px-2 data-[orientation=vertical]:py-0">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[var(--gc-border)] data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5">
          <SliderPrimitive.Indicator className="h-full rounded-full bg-[var(--gc-accent)] data-[orientation=vertical]:w-full" />
        </SliderPrimitive.Track>
        {values.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            index={index}
            aria-label={ariaLabel}
            className="block size-3.5 rounded-full border border-[var(--gc-accent)] bg-[var(--gc-panel)] shadow-sm outline-none transition-[color,box-shadow] hover:ring-4 hover:ring-[color-mix(in_srgb,var(--gc-accent)_20%,transparent)] focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--gc-accent)_28%,transparent)] data-disabled:pointer-events-none"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
