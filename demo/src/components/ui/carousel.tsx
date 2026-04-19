"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarouselProps extends React.ComponentProps<"div"> {
  /** Gap between items (e.g. "1rem") */
  gap?: string
  /** Show prev/next buttons (default true) */
  showControls?: boolean
  /** Show position indicator dashes (default true) */
  showIndicators?: boolean
  /** Snap alignment (default "start") */
  snap?: "start" | "center" | "end"
  /** Aria label for the region */
  label?: string
}

/**
 * Scroll-snap carousel with prev/next controls and current-item indicators.
 * Programmatic navigation uses `scrollIntoView` (which plays well with
 * scroll-snap in every browser); the active indicator is derived by
 * measuring which item's center is closest to the viewport center on scroll.
 */
function Carousel({
  children,
  gap = "1rem",
  showControls = true,
  showIndicators = true,
  snap = "start",
  label,
  className,
  style,
  ...props
}: CarouselProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [itemCount, setItemCount] = React.useState(0)

  const measureActive = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const items = Array.from(el.children) as HTMLElement[]
    if (items.length === 0) return
    const viewportCenter = el.scrollLeft + el.clientWidth / 2
    let nearest = 0
    let bestDist = Infinity
    for (let i = 0; i < items.length; i++) {
      const itemCenter = items[i].offsetLeft + items[i].offsetWidth / 2
      const dist = Math.abs(itemCenter - viewportCenter)
      if (dist < bestDist) {
        bestDist = dist
        nearest = i
      }
    }
    setActiveIndex(nearest)
  }, [])

  // Count actual children — React.Children.count is stable as long as the
  // list length doesn't change, so using it as a dep avoids the effect
  // re-running on every parent re-render (which `children` would do).
  const childCount = React.Children.count(children)

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    setItemCount(el.children.length)
    measureActive()

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measureActive)
    }
    el.addEventListener("scroll", onScroll, { passive: true })

    // Track container resizes so the indicator stays accurate.
    const ro = new ResizeObserver(() => measureActive())
    ro.observe(el)

    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [childCount, measureActive])

  const scrollToIndex = React.useCallback(
    (i: number) => {
      const el = scrollerRef.current
      if (!el) return
      const items = Array.from(el.children) as HTMLElement[]
      if (items.length === 0) return
      const clamped = Math.max(0, Math.min(items.length - 1, i))
      const target = items[clamped]
      if (!target) return
      // Update the active pip immediately so the UI is responsive even
      // before the smooth scroll actually lands.
      setActiveIndex(clamped)
      // scrollTo on the container directly — scrollIntoView bubbles up and
      // can drag the whole page vertically when the carousel is offscreen.
      const elRect = el.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const delta = targetRect.left - elRect.left
      let left = el.scrollLeft + delta
      if (snap === "center") {
        left -= (el.clientWidth - target.offsetWidth) / 2
      } else if (snap === "end") {
        left -= el.clientWidth - target.offsetWidth
      }
      el.scrollTo({ left, behavior: "smooth" })
    },
    [snap],
  )

  return (
    <div
      data-slot="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
      style={style}
      {...props}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex overflow-x-auto overflow-y-hidden scroll-smooth",
          // snap-proximity feels smoother than snap-mandatory for click-to-scroll.
          "snap-x snap-proximity",
          "[&::-webkit-scrollbar]:hidden",
        )}
        style={{ gap, scrollbarWidth: "none" }}
      >
        {React.Children.map(children, (child, i) => (
          <div
            key={i}
            className={cn(
              "shrink-0",
              snap === "center" && "snap-center",
              snap === "start" && "snap-start",
              snap === "end" && "snap-end",
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {showControls && itemCount > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            aria-label="Previous item"
            disabled={activeIndex === 0}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-card border border-border px-1.5 py-1.5 text-muted-foreground hover:text-foreground hover:border-[hsl(var(--smui-border-hover))] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            aria-label="Next item"
            disabled={activeIndex >= itemCount - 1}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-card border border-border px-1.5 py-1.5 text-muted-foreground hover:text-foreground hover:border-[hsl(var(--smui-border-hover))] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {showIndicators && itemCount > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: itemCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to item ${i + 1}`}
              aria-current={i === activeIndex}
              className={cn(
                "h-1 w-5 transition-colors cursor-pointer",
                i === activeIndex
                  ? "bg-primary"
                  : "bg-border hover:bg-muted-foreground",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export { Carousel }
export type { CarouselProps }
