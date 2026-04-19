"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextScrambleProps extends React.ComponentProps<"span"> {
  /** The final text to reveal */
  children: string
  /** Characters used for the scramble */
  characters?: string
  /** Frames per second of the scramble animation (default 24) */
  speed?: number
  /** Target duration in seconds from start -> fully revealed (default 1.2) */
  duration?: number
  /** Start automatically on mount (default true) */
  autoPlay?: boolean
  /** Trigger a re-scramble when this value changes */
  trigger?: unknown
}

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#"

/**
 * Scrambles random glyphs into a target string, revealing left-to-right
 * over `duration`. Honors reduced-motion.
 */
function TextScramble({
  children,
  characters = DEFAULT_CHARS,
  speed = 24,
  duration = 1.2,
  autoPlay = true,
  trigger,
  className,
  ...props
}: TextScrambleProps) {
  const [display, setDisplay] = React.useState(children)
  const frameRef = React.useRef(0)
  const rafRef = React.useRef<number | null>(null)

  const play = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const target = children
    const totalFrames = Math.max(1, Math.round(duration * speed))
    let f = 0
    const frameInterval = 1000 / speed
    let lastTime = performance.now()

    function step(now: number) {
      if (now - lastTime < frameInterval) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      lastTime = now
      const progress = f / totalFrames
      const revealCount = Math.floor(progress * target.length)
      let out = ""
      for (let i = 0; i < target.length; i++) {
        if (i < revealCount || target[i] === " ") {
          out += target[i]
        } else {
          out += characters[Math.floor(Math.random() * characters.length)]
        }
      }
      setDisplay(out)
      f++
      if (f <= totalFrames) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setDisplay(target)
      }
    }

    rafRef.current = requestAnimationFrame(step)
    frameRef.current = f
  }, [children, characters, speed, duration])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      if (mq?.matches) {
        setDisplay(children)
        return
      }
    }
    if (autoPlay) play()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, autoPlay])

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
