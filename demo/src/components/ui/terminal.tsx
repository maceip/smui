"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTerminalTheme } from "@/hooks/use-terminal-theme"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TerminalProps extends React.ComponentProps<"div"> {
  /** Font size in pixels (default 13, matches --text-ui) */
  fontSize?: number
  /** Font family (defaults to JetBrains Mono) */
  fontFamily?: string
  /** Line height multiplier (default 1.2) */
  lineHeight?: number
  /** Scrollback buffer lines (default 5000) */
  scrollback?: number
  /** Cursor style */
  cursorStyle?: "block" | "underline" | "bar"
  /** Cursor blink */
  cursorBlink?: boolean
  /** Enable WebGL renderer for performance (default true) */
  webgl?: boolean
  /** Called when the xterm instance is ready */
  onReady?: (terminal: import("@xterm/xterm").Terminal) => void
  /** Called when terminal data is produced (user types) */
  onData?: (data: string) => void
  /** Called on terminal title change */
  onTitle?: (title: string) => void
}

/* ------------------------------------------------------------------ */
/*  Terminal                                                           */
/* ------------------------------------------------------------------ */

function Terminal({
  fontSize = 13,
  fontFamily = "'JetBrains Mono', monospace",
  lineHeight = 1.2,
  scrollback = 5000,
  cursorStyle = "block",
  cursorBlink = true,
  webgl = true,
  onReady,
  onData,
  onTitle,
  className,
  ...props
}: TerminalProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const termRef = React.useRef<import("@xterm/xterm").Terminal | null>(null)
  const fitAddonRef = React.useRef<import("@xterm/addon-fit").FitAddon | null>(null)
  const theme = useTerminalTheme()

  // Apply theme updates reactively
  React.useEffect(() => {
    if (termRef.current && Object.keys(theme).length > 0) {
      termRef.current.options.theme = theme
    }
  }, [theme])

  // Initialize xterm on mount
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false

    async function init() {
      const { Terminal: XTerm } = await import("@xterm/xterm")
      const { FitAddon } = await import("@xterm/addon-fit")
      const el = container

      if (disposed) return

      const fitAddon = new FitAddon()

      const term = new XTerm({
        fontSize,
        fontFamily,
        lineHeight,
        scrollback,
        cursorStyle,
        cursorBlink,
        theme,
        allowProposedApi: true,
        // Transparent background so container bg shows through
        allowTransparency: true,
      })

      term.loadAddon(fitAddon)

      // Try WebGL renderer for better performance
      if (webgl) {
        try {
          const { WebglAddon } = await import("@xterm/addon-webgl")
          const webglAddon = new WebglAddon()
          webglAddon.onContextLoss(() => {
            webglAddon.dispose()
          })
          term.loadAddon(webglAddon)
        } catch {
          // WebGL not available, fall back to canvas
        }
      }

      if (disposed) {
        term.dispose()
        return
      }

      term.open(el!)
      fitAddon.fit()

      termRef.current = term
      fitAddonRef.current = fitAddon

      // Wire up callbacks
      if (onData) term.onData(onData)
      if (onTitle) term.onTitleChange(onTitle)
      onReady?.(term)
    }

    init()

    return () => {
      disposed = true
      termRef.current?.dispose()
      termRef.current = null
      fitAddonRef.current = null
    }
    // Only run on mount. Options changes are handled via options API below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fit terminal on container resize
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      // Debounce fit to avoid thrashing during drag resize
      requestAnimationFrame(() => {
        try {
          fitAddonRef.current?.fit()
        } catch {
          // Terminal may not be fully initialized yet
        }
      })
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Sync mutable options
  React.useEffect(() => {
    const t = termRef.current
    if (!t) return
    t.options.fontSize = fontSize
    t.options.fontFamily = fontFamily
    t.options.lineHeight = lineHeight
    t.options.cursorStyle = cursorStyle
    t.options.cursorBlink = cursorBlink
    fitAddonRef.current?.fit()
  }, [fontSize, fontFamily, lineHeight, cursorStyle, cursorBlink])

  return (
    <div
      ref={containerRef}
      data-slot="terminal"
      className={cn("h-full w-full overflow-hidden bg-background", className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export { Terminal }
export type { TerminalProps }
