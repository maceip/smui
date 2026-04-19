"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SlidingNumberProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** The current numeric value (integer part is animated digit-by-digit) */
  value: number
  /** Pad the integer part to at least this many digits */
  padStart?: number
  /** Decimal places */
  decimalPlaces?: number
  /** Slide duration in ms (default 400) */
  duration?: number
  /** Height of each digit in px (default 20) */
  digitHeight?: number
  /** Prefix / suffix */
  prefix?: string
  suffix?: string
}

/**
 * Odometer-style number display — each digit slides vertically into place
 * when the value changes.
 */
function SlidingNumber({
  value,
  padStart = 0,
  decimalPlaces = 0,
  duration = 400,
  digitHeight = 20,
  prefix,
  suffix,
  className,
  style,
  ...props
}: SlidingNumberProps) {
  const formatted = value
    .toFixed(decimalPlaces)
    .padStart(padStart + (decimalPlaces ? decimalPlaces + 1 : 0), "0")
  const chars = formatted.split("")

  return (
    <span
      data-slot="sliding-number"
      className={cn(
        "inline-flex items-baseline font-mono tabular-nums leading-none",
        className
      )}
      style={
        {
          ...style,
          "--slide-duration": `${duration}ms`,
        } as React.CSSProperties
      }
      {...props}
    >
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {chars.map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <Digit
            key={`${i}-${chars.length}`}
            digit={parseInt(ch, 10)}
            height={digitHeight}
          />
        ) : (
          <span
            key={`sep-${i}-${chars.length}`}
            style={{ height: digitHeight, lineHeight: `${digitHeight}px` }}
            className="inline-block"
          >
            {ch}
          </span>
        )
      )}
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  )
}

function Digit({ digit, height }: { digit: number; height: number }) {
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height, width: "0.6em" }}
    >
      <span
        className="absolute inset-x-0 top-0 flex flex-col items-center transition-transform duration-[var(--slide-duration)] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: `translateY(-${digit * height}px)` }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            style={{ height, lineHeight: `${height}px` }}
            className="inline-block"
          >
            {i}
          </span>
        ))}
      </span>
    </span>
  )
}

export { SlidingNumber }
export type { SlidingNumberProps }
