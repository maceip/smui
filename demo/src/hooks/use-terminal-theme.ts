"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ITheme } from "@xterm/xterm"

/* ------------------------------------------------------------------ */
/*  HSL → hex conversion (reads raw "H S% L%" triplets from CSS vars) */
/* ------------------------------------------------------------------ */

function hslToHex(hslTriplet: string): string {
  const parts = hslTriplet.trim().split(/\s+/)
  if (parts.length < 3) return "#888888"

  const h = parseFloat(parts[0])
  const s = parseFloat(parts[1]) / 100
  const l = parseFloat(parts[2]) / 100

  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function resolvedHsl(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

function resolvedHex(name: string): string {
  return hslToHex(resolvedHsl(name))
}

/* ------------------------------------------------------------------ */
/*  Build xterm ITheme from SMUI CSS custom properties                 */
/* ------------------------------------------------------------------ */

function buildTheme(): ITheme {
  // Base background/foreground from shadcn vars (already hsl() wrapped)
  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim()
  const fg = getComputedStyle(document.documentElement)
    .getPropertyValue("--foreground")
    .trim()

  // Parse hsl(...) values
  const parseHslFn = (v: string) => {
    const match = v.match(/hsl\(\s*(.+)\s*\)/)
    return match ? hslToHex(match[1]) : "#888888"
  }

  return {
    background: parseHslFn(bg),
    foreground: parseHslFn(fg),
    cursor: resolvedHex("--smui-frost-2"),
    cursorAccent: parseHslFn(bg),
    selectionBackground: resolvedHex("--smui-frost-2") + "33", // 20% alpha
    selectionForeground: resolvedHex("--smui-frost-2"),

    // ANSI standard 8 colors → SMUI palette
    black: parseHslFn(bg),
    red: resolvedHex("--smui-red"),
    green: resolvedHex("--smui-green"),
    yellow: resolvedHex("--smui-yellow"),
    blue: resolvedHex("--smui-frost-3"),
    magenta: resolvedHex("--smui-magenta"),
    cyan: resolvedHex("--smui-cyan"),
    white: parseHslFn(fg),

    // Bright variants → brighter SMUI colors
    brightBlack: resolvedHex("--smui-surface-3"),
    brightRed: resolvedHex("--smui-crimson"),
    brightGreen: resolvedHex("--smui-terminal"),
    brightYellow: resolvedHex("--smui-amber"),
    brightBlue: resolvedHex("--smui-frost-2"),
    brightMagenta: resolvedHex("--smui-purple"),
    brightCyan: resolvedHex("--smui-teal"),
    brightWhite: parseHslFn(fg),
  }
}

/* ------------------------------------------------------------------ */
/*  Hook: returns a reactive xterm theme that updates on theme change  */
/* ------------------------------------------------------------------ */

export function useTerminalTheme() {
  const [theme, setTheme] = useState<ITheme>({})
  const observerRef = useRef<MutationObserver | null>(null)

  const refresh = useCallback(() => {
    setTheme(buildTheme())
  }, [])

  useEffect(() => {
    // Build initial theme
    refresh()

    // Watch for class/style changes on <html> (theme switches, accent changes)
    observerRef.current = new MutationObserver(refresh)
    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })

    return () => observerRef.current?.disconnect()
  }, [refresh])

  return theme
}
