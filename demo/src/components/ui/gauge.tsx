"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

const gaugeVariants = cva("relative inline-flex items-center justify-center", {
  variants: {
    size: {
      sm: "w-16 h-16",
      md: "w-24 h-24",
      lg: "w-32 h-32",
      xl: "w-40 h-40",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface GaugeProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof gaugeVariants> {
  /** Current value (0-100 by default, or within min/max) */
  value: number
  /** Minimum value (default 0) */
  min?: number
  /** Maximum value (default 100) */
  max?: number
  /** Arc sweep in degrees (default 270 — leaves a gap at bottom) */
  sweep?: number
  /** Stroke width of the track/fill arc */
  strokeWidth?: number
  /** Color of the filled arc — smui color name (e.g. "cyan", "terminal") or any CSS color */
  color?: string
  /** Threshold markers: array of { value, color? } drawn as ticks on the arc */
  thresholds?: { value: number; color?: string; label?: string }[]
  /** Show the numeric value in the center */
  showValue?: boolean
  /** Format function for the center label */
  formatValue?: (value: number) => string
  /** Label below the value */
  label?: string
  /** Animate the arc fill on mount / value change */
  animated?: boolean
  /** Children rendered inside the gauge (overrides default value display) */
  children?: React.ReactNode
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function Gauge({
  value,
  min = 0,
  max = 100,
  sweep = 270,
  strokeWidth = 4,
  color,
  thresholds,
  showValue = true,
  formatValue,
  label,
  animated = true,
  size,
  className,
  children,
  ...props
}: GaugeProps) {
  const viewBox = 100
  const cx = viewBox / 2
  const cy = viewBox / 2
  const radius = (viewBox - strokeWidth * 2) / 2 - 2

  // Normalize value to 0-1
  const clamped = Math.max(min, Math.min(max, value))
  const pct = (clamped - min) / (max - min)

  // Arc angles
  const startAngle = -sweep / 2
  const endAngle = sweep / 2
  const fillEndAngle = startAngle + sweep * pct

  // Resolve color to CSS
  const resolvedColor = color
    ? color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl")
      ? color
      : `hsl(var(--smui-${color}))`
    : "hsl(var(--primary))"

  // Animation
  const [animatedPct, setAnimatedPct] = React.useState(animated ? 0 : pct)
  const animFrameRef = React.useRef<number>(0)

  React.useEffect(() => {
    if (!animated) {
      setAnimatedPct(pct)
      return
    }
    const startTime = performance.now()
    const startPct = animatedPct
    const duration = 600

    function tick(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimatedPct(startPct + (pct - startPct) * eased)
      if (t < 1) animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct, animated])

  const currentFillEnd = startAngle + sweep * animatedPct

  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle)
  const fillPath =
    animatedPct > 0.001
      ? describeArc(cx, cy, radius, startAngle, currentFillEnd)
      : ""

  const displayValue = formatValue
    ? formatValue(clamped)
    : Math.round(clamped).toString()

  return (
    <div
      data-slot="gauge"
      data-size={size}
      className={cn(gaugeVariants({ size }), className)}
      {...props}
    >
      <svg
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        className="w-full h-full"
        fill="none"
      >
        {/* Track */}
        <path
          d={trackPath}
          stroke="hsl(var(--smui-surface-2))"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          fill="none"
        />

        {/* Fill */}
        {fillPath && (
          <path
            d={fillPath}
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            fill="none"
          />
        )}

        {/* Threshold ticks */}
        {thresholds?.map((t, i) => {
          const tPct = (Math.max(min, Math.min(max, t.value)) - min) / (max - min)
          const tAngle = startAngle + sweep * tPct
          const inner = polarToCartesian(cx, cy, radius - strokeWidth - 1, tAngle)
          const outer = polarToCartesian(cx, cy, radius + strokeWidth + 1, tAngle)
          const tickColor = t.color
            ? t.color.startsWith("#") || t.color.startsWith("rgb")
              ? t.color
              : `hsl(var(--smui-${t.color}))`
            : "hsl(var(--smui-amber))"
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={tickColor}
              strokeWidth={1.5}
            />
          )
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ?? (
          <>
            {showValue && (
              <span
                className="text-stat font-medium tracking-tight leading-none"
                style={{ color: resolvedColor }}
              >
                {displayValue}
              </span>
            )}
            {label && (
              <span className="text-label text-muted-foreground tracking-[1.5px] uppercase mt-0.5">
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export { Gauge, gaugeVariants }
export type { GaugeProps }
