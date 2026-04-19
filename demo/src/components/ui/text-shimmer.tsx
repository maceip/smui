"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextShimmerProps extends React.ComponentProps<"span"> {
  /** Seconds per shimmer pass (default 2) */
  duration?: number
  /** Spread of the highlight as a fraction of the text width (0-1, default 0.45) */
  spread?: number
}

/**
 * Gradient shimmer that sweeps across the text. Honors SMUI tokens via
 * `color` on the base and `--shimmer-color` for the highlight.
 */
function TextShimmer({
  className,
  children,
  duration = 2,
  spread = 0.45,
  style,
  ...props
}: TextShimmerProps) {
  return (
    <span
      data-slot="text-shimmer"
      className={cn(
        "inline-block bg-clip-text text-transparent",
        "bg-[linear-gradient(110deg,var(--muted-foreground)_0%,var(--muted-foreground)_calc(50%-var(--spread)*50%),hsl(var(--smui-frost-2))_50%,var(--muted-foreground)_calc(50%+var(--spread)*50%),var(--muted-foreground)_100%)]",
        "bg-[length:300%_100%]",
        "animate-[text-shimmer_var(--duration)_linear_infinite]",
        className
      )}
      style={
        {
          ...style,
          "--duration": `${duration}s`,
          "--spread": spread,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </span>
  )
}

export { TextShimmer }
export type { TextShimmerProps }
