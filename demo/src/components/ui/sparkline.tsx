"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

const sparklineVariants = cva("inline-block align-middle", {
  variants: {
    variant: {
      line: "",
      area: "",
      bar: "",
    },
  },
  defaultVariants: {
    variant: "line",
  },
})

interface SparklineProps
  extends Omit<React.ComponentProps<"svg">, "children">,
    VariantProps<typeof sparklineVariants> {
  /** Data points — numbers or {value, color?} objects */
  data: (number | { value: number; color?: string })[]
  /** Width in pixels (default 80) */
  width?: number
  /** Height in pixels (default 24) */
  height?: number
  /** Stroke/fill color — smui color name or CSS color (default primary) */
  color?: string
  /** Stroke width for line variant (default 1.5) */
  strokeWidth?: number
  /** Show a dot at the last data point */
  showEndDot?: boolean
  /** Show a horizontal reference line at this value */
  referenceLine?: number
  /** Reference line color */
  referenceColor?: string
  /** Fill opacity for area variant (default 0.15) */
  fillOpacity?: number
  /** Bar gap for bar variant (default 1) */
  barGap?: number
  /** Animate on mount */
  animated?: boolean
  /** Show min/max labels */
  showRange?: boolean
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resolveColor(color?: string): string {
  if (!color) return "hsl(var(--primary))"
  if (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl"))
    return color
  return `hsl(var(--smui-${color}))`
}

function normalizeData(data: SparklineProps["data"]): number[] {
  return data.map((d) => (typeof d === "number" ? d : d.value))
}

/* ------------------------------------------------------------------ */
/*  Line / Area                                                        */
/* ------------------------------------------------------------------ */

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  pad: number
): { path: string; areaPath: string; points: { x: number; y: number }[] } {
  if (values.length === 0) return { path: "", areaPath: "", points: [] }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const stepX = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0
  const points = values.map((v, i) => ({
    x: pad + i * stepX,
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }))

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${path} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`

  return { path, areaPath, points }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function Sparkline({
  data,
  width = 80,
  height = 24,
  color,
  strokeWidth = 1.5,
  showEndDot = false,
  referenceLine,
  referenceColor,
  fillOpacity = 0.15,
  barGap = 1,
  animated = false,
  showRange = false,
  variant = "line",
  className,
  ...props
}: SparklineProps) {
  const values = normalizeData(data)
  const resolvedColor = resolveColor(color)
  const pad = 2

  if (values.length === 0) {
    return (
      <svg
        data-slot="sparkline"
        width={width}
        height={height}
        className={cn(sparklineVariants({ variant }), className)}
        {...props}
      />
    )
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  // Animation
  const [mounted, setMounted] = React.useState(!animated)
  React.useEffect(() => {
    if (animated) {
      const frame = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(frame)
    }
  }, [animated])

  // Reference line Y
  const refY =
    referenceLine != null
      ? pad + (1 - (referenceLine - min) / range) * (height - pad * 2)
      : null

  return (
    <div className="inline-flex items-center gap-1">
      {showRange && (
        <span className="text-label text-muted-foreground tabular-nums">
          {Math.round(min)}
        </span>
      )}
      <svg
        data-slot="sparkline"
        data-variant={variant}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cn(sparklineVariants({ variant }), className)}
        {...props}
      >
        {/* Reference line */}
        {refY != null && (
          <line
            x1={pad}
            y1={refY}
            x2={width - pad}
            y2={refY}
            stroke={resolveColor(referenceColor) || "hsl(var(--smui-amber))"}
            strokeWidth={0.5}
            strokeDasharray="2 2"
            opacity={0.6}
          />
        )}

        {variant === "bar" ? (
          // Bar variant
          (() => {
            const barWidth = Math.max(
              1,
              (width - pad * 2 - barGap * (values.length - 1)) / values.length
            )
            return values.map((v, i) => {
              const barH = Math.max(1, ((v - min) / range) * (height - pad * 2))
              const x = pad + i * (barWidth + barGap)
              const y = height - pad - barH
              const itemColor =
                typeof data[i] === "object" && (data[i] as { color?: string }).color
                  ? resolveColor((data[i] as { color?: string }).color)
                  : resolvedColor
              return (
                <rect
                  key={i}
                  x={x}
                  y={mounted ? y : height - pad}
                  width={barWidth}
                  height={mounted ? barH : 0}
                  fill={itemColor}
                  opacity={0.8}
                  style={
                    animated
                      ? {
                          transition: `y 400ms ease ${i * 30}ms, height 400ms ease ${i * 30}ms`,
                        }
                      : undefined
                  }
                />
              )
            })
          })()
        ) : (
          // Line / Area variant
          (() => {
            const { path, areaPath, points } = buildLinePath(
              values,
              width,
              height,
              pad
            )
            const lastPt = points[points.length - 1]
            return (
              <>
                {variant === "area" && (
                  <path
                    d={areaPath}
                    fill={resolvedColor}
                    opacity={mounted ? fillOpacity : 0}
                    style={
                      animated
                        ? { transition: "opacity 500ms ease" }
                        : undefined
                    }
                  />
                )}
                <path
                  d={path}
                  stroke={resolvedColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={
                    animated
                      ? {
                          strokeDasharray: mounted ? "none" : `${width * 3}`,
                          strokeDashoffset: mounted ? 0 : width * 3,
                          transition:
                            "stroke-dashoffset 600ms ease, stroke-dasharray 600ms ease",
                        }
                      : undefined
                  }
                />
                {showEndDot && lastPt && (
                  <circle
                    cx={lastPt.x}
                    cy={lastPt.y}
                    r={2}
                    fill={resolvedColor}
                    opacity={mounted ? 1 : 0}
                    style={
                      animated
                        ? { transition: "opacity 300ms ease 500ms" }
                        : undefined
                    }
                  />
                )}
              </>
            )
          })()
        )}
      </svg>
      {showRange && (
        <span className="text-label text-muted-foreground tabular-nums">
          {Math.round(max)}
        </span>
      )}
    </div>
  )
}

export { Sparkline, sparklineVariants }
export type { SparklineProps }
