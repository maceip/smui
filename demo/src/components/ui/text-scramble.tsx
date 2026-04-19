"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextScrambleProps extends React.ComponentProps<"span"> {
  /** The final text to reveal */
  children: string
  /** Characters used for the scramble */
  characters?: string
  /** Frames per second of the scramble animation (default 30) */
  speed?: number
  /** Total scramble duration in seconds (default 1.2) */
  duration?: number
  /** Start automatically on mount and whenever `children` changes (default true) */
  autoPlay?: boolean
}

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#"

/**
 * Scrambles random glyphs into a target string, revealing left-to-right.
 * Re-triggers automatically whenever `children` changes. Honors
 * prefers-reduced-motion.
 */
function TextScramble({
  children,
  characters = DEFAULT_CHARS,
  speed = 30,
  duration = 1.2,
  autoPlay = true,
  className,
  ...props
}: TextScrambleProps) {
  const [display, setDisplay] = React.useState(children)

  // Keep the latest tuning in refs so the animation loop doesn't restart
  // just because a parent re-renders.
  const charsRef = React.useRef(characters)
  const speedRef = React.useRef(speed)
  const durationRef = React.useRef(duration)
  charsRef.current = characters
  speedRef.current = speed
  durationRef.current = duration

  React.useEffect(() => {
    if (!autoPlay) {
      setDisplay(children)
      return
    }

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(children)
      return
    }

    const target = children
    const localChars = charsRef.current
    const frameInterval = 1000 / speedRef.current
    const totalFrames = Math.max(
      1,
      Math.round(durationRef.current * speedRef.current),
    )

    let frame = 0
    let timer: ReturnType<typeof setInterval> | null = null

    timer = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const revealCount = Math.floor(progress * target.length)
      let out = ""
      for (let i = 0; i < target.length; i++) {
        const ch = target[i]
        if (i < revealCount || ch === " ") {
          out += ch
        } else {
          out += localChars[Math.floor(Math.random() * localChars.length)]
        }
      }
      setDisplay(out)
      if (frame >= totalFrames) {
        setDisplay(target)
        if (timer) clearInterval(timer)
      }
    }, frameInterval)

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [children, autoPlay])

  return (
    <span
      data-slot="text-scramble"
      className={cn("font-mono tabular-nums", className)}
      {...props}
    >
      {display}
    </span>
  )
}

export { TextScramble }
export type { TextScrambleProps }
