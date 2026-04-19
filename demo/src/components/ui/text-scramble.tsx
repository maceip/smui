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
  // Prime the display with a fully-scrambled string so the very first
  // paint after `children` changes is visibly different from the target
  // — nothing worse than a "scramble" that just snaps words.
  const scrambleOf = React.useCallback(
    (target: string) => {
      let out = ""
      for (let i = 0; i < target.length; i++) {
        out += target[i] === " "
          ? " "
          : characters[Math.floor(Math.random() * characters.length)]
      }
      return out
    },
    [characters],
  )

  const [display, setDisplay] = React.useState(children)

  // Keep tuning in refs so parent re-renders don't restart the loop.
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
    // Snap to a fully-scrambled view immediately so the animation is
    // obvious on the very next paint, even if RAF is slow to kick in.
    setDisplay(scrambleOf(target))

    const localChars = charsRef.current
    const durationMs = Math.max(1, durationRef.current * 1000)
    const fps = speedRef.current
    const frameInterval = 1000 / fps

    let raf = 0
    let lastTick = performance.now()
    const start = lastTick

    const step = (now: number) => {
      if (now - lastTick >= frameInterval) {
        lastTick = now
        const progress = Math.min((now - start) / durationMs, 1)
        // Hold full-scramble for the first 20% of the duration so the
        // effect is visibly "garbled" before the reveal starts.
        const revealT = Math.max(0, (progress - 0.2) / 0.8)
        const revealCount = Math.floor(revealT * target.length)
        let out = ""
        for (let i = 0; i < target.length; i++) {
          const ch = target[i]
          if (i < revealCount || ch === " ") {
            out += ch
          } else {
            out +=
              localChars[Math.floor(Math.random() * localChars.length)]
          }
        }
        setDisplay(out)
        if (progress >= 1) {
          setDisplay(target)
          return
        }
      }
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [children, autoPlay, scrambleOf])

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
