"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextShimmerWaveProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** The text to animate (character-by-character) */
  children: string
  /** Seconds per wave pass (default 1) */
  duration?: number
  /** Delay between characters in seconds (default 0.1) */
  charDelay?: number
  /** Base color (CSS color or --smui token name). Default: var(--muted-foreground). */
  baseColor?: string
  /** Highlight color at the peak of each character's shimmer. Default: frost-2. */
  highlightColor?: string
}

function resolveColor(c: string): string {
  if (!c) return c
  if (c.startsWith("var(") || c.startsWith("hsl") || c.startsWith("#") || c.startsWith("rgb")) {
    return c
  }
  return `hsl(var(--smui-${c}))`
}

/**
 * A per-character shimmer wave: each letter fades from `baseColor` to
 * `highlightColor` and back, with a delay offset so the highlight ripples
 * across the string.
 */
function TextShimmerWave({
  children,
  duration = 1,
  charDelay = 0.1,
  baseColor = "var(--muted-foreground)",
  highlightColor = "frost-2",
  className,
  style,
  ...props
}: TextShimmerWaveProps) {
  const base = resolveColor(baseColor)
  const peak = resolveColor(highlightColor)

  const chars = React.useMemo(() => Array.from(children), [children])

  return (
    <span
      data-slot="text-shimmer-wave"
      className={cn("inline-flex whitespace-pre", className)}
      style={
        {
          ...style,
          "--wave-duration": `${duration}s`,
          "--wave-base": base,
          "--wave-peak": peak,
        } as React.CSSProperties
      }
      {...props}
    >
      {chars.map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="inline-block animate-[text-shimmer-wave_var(--wave-duration)_ease-in-out_infinite] will-change-transform"
          style={{
            color: "var(--wave-base)",
            animationDelay: `${i * charDelay}s`,
          }}
          aria-hidden={ch === " " || ch === "\u00A0"}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  )
}

export { TextShimmerWave }
export type { TextShimmerWaveProps }
