"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTerminalTheme } from "@/hooks/use-terminal-theme"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Minimal type for the xterm Terminal instance exposed via onReady.
 * Using a local interface avoids a hard dependency on @xterm/xterm types.
 * Consumers who have @xterm/xterm installed get full types via the actual class.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XTerminal = any

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
  onReady?: (terminal: XTerminal) => void
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
  const termRef = React.useRef<XTerminal>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fitAddonRef = React.useRef<any>(null)
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
      const [{ Terminal: XTerm }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ])
      const el = container

      // Inject xterm base CSS once (idempotent).
      // We inline the critical styles so consumers don't need a separate CSS import.
      if (!document.querySelector("style[data-xterm-css]")) {
        const style = document.createElement("style")
        style.setAttribute("data-xterm-css", "")
        style.textContent = [
          ".xterm { position: relative; user-select: none; -ms-user-select: none; -webkit-user-select: none; cursor: text; }",
          ".xterm.focus, .xterm:focus { outline: none; }",
          ".xterm .xterm-helpers { position: absolute; top: 0; z-index: 5; }",
          ".xterm .xterm-helper-textarea { padding: 0; border: 0; margin: 0; position: absolute; opacity: 0; left: -9999em; top: 0; width: 0; height: 0; z-index: -5; white-space: nowrap; overflow: hidden; resize: none; }",
          ".xterm .composition-view { display: none; position: absolute; white-space: nowrap; z-index: 1; }",
          ".xterm .xterm-viewport { background-color: transparent !important; overflow-y: scroll; cursor: default; position: absolute; right: 0; left: 0; top: 0; bottom: 0; scrollbar-width: thin; }",
          ".xterm .xterm-screen { position: relative; }",
          ".xterm .xterm-screen canvas { position: absolute; left: 0; top: 0; }",
          ".xterm .xterm-decoration-container .xterm-decoration { z-index: 6; position: absolute; }",
          ".xterm .xterm-decoration-container .xterm-decoration.xterm-decoration-top-layer { z-index: 7; }",
          ".xterm .xterm-decoration-overview-ruler { z-index: 8; position: absolute; top: 0; right: 0; pointer-events: none; }",
          ".xterm .xterm-cursor-layer { z-index: 20; }",
        ].join("\n")
        document.head.appendChild(style)
      }

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
