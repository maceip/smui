"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CompletionItem {
  /** Display name */
  name: string
  /** Optional inline description */
  description?: string
  /** Icon character or short string shown in left gutter */
  icon?: string
  /** Accent color – maps to smui CSS var name (e.g. "cyan", "amber") */
  color?: string
}

export interface FloatingCompletionProps {
  /** All available items (pre-filter) */
  items: CompletionItem[]
  /** Currently-typed query string for fuzzy filtering */
  query: string
  /** Called when user accepts a completion */
  onSelect?: (item: CompletionItem) => void
  /** Called when user dismisses the popup */
  onDismiss?: () => void
  /** Max visible rows before scroll (default 8) */
  maxVisible?: number
  /** Extra className on the root wrapper (the anchor container) */
  className?: string
  /** Whether the popup is open */
  open?: boolean
  children?: React.ReactNode
}

/* ------------------------------------------------------------------ */
/*  Fuzzy matcher – simple, zero-dep                                   */
/* ------------------------------------------------------------------ */

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  if (q.length === 0) return 1
  let qi = 0
  let score = 0
  let consecutive = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++
      consecutive++
      score += consecutive + (ti === 0 || t[ti - 1] === " " || t[ti - 1] === "-" ? 5 : 0)
    } else {
      consecutive = 0
    }
  }
  return qi === q.length ? score : -1
}

function highlightMatch(query: string, text: string): React.ReactNode {
  if (!query) return text
  const q = query.toLowerCase()
  const parts: React.ReactNode[] = []
  let qi = 0
  for (let i = 0; i < text.length; i++) {
    if (qi < q.length && text[i].toLowerCase() === q[qi]) {
      parts.push(
        <span key={i} className="text-primary font-semibold">
          {text[i]}
        </span>
      )
      qi++
    } else {
      parts.push(text[i])
    }
  }
  return parts
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function FloatingCompletion({
  items,
  query,
  onSelect,
  onDismiss,
  maxVisible = 8,
  className,
  open = true,
  children,
}: FloatingCompletionProps) {
  const [selected, setSelected] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const [flipAbove, setFlipAbove] = React.useState(false)

  // Filter + sort
  const filtered = React.useMemo(() => {
    const scored = items
      .map((item) => ({ item, score: fuzzyScore(query, item.name) }))
      .filter((s) => s.score > 0)
    scored.sort((a, b) => b.score - a.score)
    return scored.map((s) => s.item)
  }, [items, query])

  // Reset selection when query or items change
  React.useEffect(() => {
    setSelected(0)
  }, [query, items])

  // Collision detection – flip above if not enough room below
  React.useEffect(() => {
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const popupHeight = Math.min(filtered.length, maxVisible) * 28 + 10 // row height + border
    const spaceBelow = window.innerHeight - rect.bottom
    setFlipAbove(spaceBelow < popupHeight && rect.top > popupHeight)
  }, [open, filtered.length, maxVisible])

  // Scroll selected into view
  React.useEffect(() => {
    if (!listRef.current) return
    const row = listRef.current.children[selected] as HTMLElement | undefined
    row?.scrollIntoView({ block: "nearest" })
  }, [selected])

  // Keyboard handler – attached to anchor wrapper
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || filtered.length === 0) return

      switch (e.key) {
        case "ArrowDown":
        case "Tab": {
          if (e.key === "Tab" && e.shiftKey) {
            setSelected((s) => (s - 1 + filtered.length) % filtered.length)
          } else {
            setSelected((s) => (s + 1) % filtered.length)
          }
          e.preventDefault()
          break
        }
        case "ArrowUp": {
          setSelected((s) => (s - 1 + filtered.length) % filtered.length)
          e.preventDefault()
          break
        }
        case "Enter": {
          onSelect?.(filtered[selected])
          e.preventDefault()
          break
        }
        case "Escape": {
          onDismiss?.()
          e.preventDefault()
          break
        }
      }
    },
    [open, filtered, selected, onSelect, onDismiss]
  )

  const visibleCount = Math.min(filtered.length, maxVisible)
  const showPopup = open && filtered.length > 0

  return (
    <div
      ref={anchorRef}
      className={cn("relative inline-block", className)}
      onKeyDown={handleKeyDown}
    >
      {children}

      {showPopup && (
        <div
          data-slot="floating-completion"
          className={cn(
            "absolute left-0 z-50 min-w-[260px] max-w-[420px] w-max",
            "border border-border bg-card text-foreground",
            "shadow-lg shadow-black/30",
            flipAbove ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          {/* Scroll indicator header */}
          <div className="flex items-center justify-between px-2 py-[3px] border-b border-border bg-[hsl(var(--smui-surface-1))]">
            <span className="text-label text-muted-foreground tracking-[1.5px] uppercase">
              completions
            </span>
            <span className="text-label text-muted-foreground tabular-nums">
              {selected + 1}/{filtered.length}
            </span>
          </div>

          {/* Items list */}
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: `${visibleCount * 28}px` }}
          >
            {filtered.map((item, i) => {
              const colorVar = item.color
                ? `var(--smui-${item.color})`
                : undefined
              const isSelected = i === selected

              return (
                <div
                  key={`${item.name}-${i}`}
                  data-slot="completion-item"
                  data-selected={isSelected || undefined}
                  className={cn(
                    "flex items-center gap-2 px-2 h-7 cursor-pointer text-ui transition-colors",
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-secondary"
                  )}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => onSelect?.(item)}
                >
                  {/* Icon gutter */}
                  <span
                    className="w-5 text-center text-label shrink-0"
                    style={colorVar ? { color: `hsl(${colorVar})` } : undefined}
                  >
                    {item.icon ?? "›"}
                  </span>

                  {/* Name with fuzzy highlights */}
                  <span className="truncate flex-1">
                    {highlightMatch(query, item.name)}
                  </span>

                  {/* Inline description */}
                  {item.description && (
                    <span className="text-label text-muted-foreground truncate max-w-[140px] shrink-0">
                      {item.description}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer with keyboard hints */}
          <div className="flex items-center gap-3 px-2 py-[3px] border-t border-border bg-[hsl(var(--smui-surface-1))] text-label text-muted-foreground">
            <span>
              <kbd className="px-1 border border-border bg-background">↑↓</kbd> nav
            </span>
            <span>
              <kbd className="px-1 border border-border bg-background">tab</kbd> next
            </span>
            <span>
              <kbd className="px-1 border border-border bg-background">↵</kbd> accept
            </span>
            <span>
              <kbd className="px-1 border border-border bg-background">esc</kbd> close
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export { FloatingCompletion }
