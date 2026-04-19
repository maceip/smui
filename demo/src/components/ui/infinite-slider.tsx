"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InfiniteSliderProps extends React.ComponentProps<"div"> {
  /** Seconds for one full pass (default 20) */
  duration?: number
  /** Gap between items (Tailwind-style arbitrary value, e.g. "1rem" or "24px") */
  gap?: string
  /** Pause the animation on hover (default true) */
  pauseOnHover?: boolean
  /** Reverse direction */
  reverse?: boolean
}

/**
 * Marquee-style infinite horizontal scroller. Items are duplicated so the
 * loop is seamless. Pure CSS animation — no layout-thrashing JS ticks.
 */
function InfiniteSlider({
  children,
  duration = 20,
  gap = "2rem",
  pauseOnHover = true,
  reverse = false,
  className,
  style,
  ...props
}: InfiniteSliderProps) {
  return (
    <div
      data-slot="infinite-slider"
      className={cn(
        "group/slider relative overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
      style={
        {
          ...style,
          "--duration": `${duration}s`,
          "--gap": gap,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        className={cn(
          "flex w-max shrink-0 items-center",
          "animate-[infinite-slider_var(--duration)_linear_infinite]",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover/slider:[animation-play-state:paused]"
        )}
        style={{ gap }}
      >
        <div className="flex items-center shrink-0" style={{ gap }}>
          {children}
        </div>
        <div
          className="flex items-center shrink-0"
          style={{ gap }}
          aria-hidden
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export { InfiniteSlider }
export type { InfiniteSliderProps }
