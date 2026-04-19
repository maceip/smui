"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** The target numeric value */
  value: number
  /** Animation duration in ms (default 600) */
  duration?: number
  /** Decimal places (default 0) */
  precision?: number
  /** Format the value (applied to the *current* animated frame) */
  format?: (value: number) => string
  /** Prefix (e.g. "$") */
  prefix?: string
  /** Suffix (e.g. "%") */
  suffix?: string
}

/**
 * Numeric counter that interpolates smoothly between values.
 * Honors prefers-reduced-motion by snapping to the target.
 */
function AnimatedNumber({
  value,
  duration = 600,
  precision = 0,
  format,
  prefix,
  suffix,
  className,
  ...props
}: AnimatedNumberProps) {
  const [display, setDisplay] = React.useState(value)
  const rafRef = React.useRef<number | null>(null)
  // `fromRef` tracks the CURRENT on-screen value so that if `value` changes
  // mid-animation the next tween starts from where the eye left off, not
  // from whatever the previous animation's stale `from` was.
  const fromRef = React.useRef(value)

  React.useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      fromRef.current = value
      setDisplay(value)
      return
    }

    const from = fromRef.current
    if (from === value) return
    const start = performance.now()

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (value - from) * eased
      fromRef.current = next
      setDisplay(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  const text = format
    ? format(display)
    : display.toLocaleString(undefined, {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })

  return (
    <span
      data-slot="animated-number"
      className={cn("tabular-nums", className)}
      {...props}
    >
      {prefix}
      {text}
      {suffix}
    </span>
  )
}

export { AnimatedNumber }
export type { AnimatedNumberProps }
