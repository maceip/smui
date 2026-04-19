"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CommitDay {
  /** ISO date */
  date: string
  /** Commit count for the day */
  count: number
}

interface CommitGraphProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Days, earliest first. Missing days are treated as 0. */
  data: CommitDay[]
  /** Square size in px (default 11) */
  cellSize?: number
  /** Gap between squares in px (default 3) */
  cellGap?: number
  /** Max count mapped to the most saturated bucket (auto if omitted) */
  maxCount?: number
  /** Base color — smui token name or full CSS color (default "frost-2") */
  color?: string
  /** Show month labels along the top */
  showMonths?: boolean
  /** Show weekday labels on the left */
  showWeekdays?: boolean
}

function resolveColor(c?: string): string {
  if (!c) return "hsl(var(--smui-frost-2))"
  if (c.startsWith("#") || c.startsWith("rgb") || c.startsWith("hsl"))
    return c
  return `hsl(var(--smui-${c}))`
}

const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""]
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/**
 * GitHub-style weekly contribution heatmap. Accepts a flat list of
 * `{ date, count }` days; groups them into columns by ISO week.
 */
function CommitGraph({
  data,
  cellSize = 11,
  cellGap = 3,
  maxCount,
  color = "frost-2",
  showMonths = true,
  showWeekdays = true,
  className,
  style,
  ...props
}: CommitGraphProps) {
  const { weeks, monthLabels, peak } = React.useMemo(() => {
    if (data.length === 0) {
      return { weeks: [] as (CommitDay | null)[][], monthLabels: [], peak: 0 }
    }
    const byDate = new Map(data.map((d) => [d.date, d]))
    const start = new Date(data[0].date)
    // Align start to the previous Sunday so columns are whole weeks.
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(data[data.length - 1].date)

    const weeks: (CommitDay | null)[][] = []
    const monthLabels: { weekIndex: number; month: string }[] = []
    let peak = 0
    const cursor = new Date(start)
    let currentMonth = -1

    while (cursor <= end) {
      const week: (CommitDay | null)[] = []
      for (let d = 0; d < 7; d++) {
        const iso = cursor.toISOString().slice(0, 10)
        const entry = byDate.get(iso) ?? null
        if (entry && entry.count > peak) peak = entry.count
        week.push(entry)
        cursor.setDate(cursor.getDate() + 1)
      }
      const firstDay = week.find(Boolean) ?? null
      if (firstDay) {
        const m = new Date(firstDay.date).getMonth()
        if (m !== currentMonth) {
          monthLabels.push({ weekIndex: weeks.length, month: MONTHS[m] })
          currentMonth = m
        }
      }
      weeks.push(week)
    }
    return { weeks, monthLabels, peak }
  }, [data])

  const effectiveMax = Math.max(1, maxCount ?? peak)
  const baseColor = resolveColor(color)

  const intensity = (count: number) => {
    if (count <= 0) return 0
    const t = Math.min(1, count / effectiveMax)
    // 4 buckets like GitHub: 0.15, 0.4, 0.7, 1.0
    if (t < 0.25) return 0.18
    if (t < 0.5) return 0.4
    if (t < 0.75) return 0.7
    return 1
  }

  const gridWidth = weeks.length * (cellSize + cellGap)
  const weekdayWidth = showWeekdays ? 22 : 0

  return (
    <div
      data-slot="commit-graph"
      className={cn("inline-block", className)}
      style={style}
      {...props}
    >
      {showMonths && (
        <div
          className="relative text-label text-muted-foreground tracking-wider"
          style={{ marginLeft: weekdayWidth, width: gridWidth, height: 14 }}
        >
          {monthLabels.map(({ weekIndex, month }) => (
            <span
              key={`${month}-${weekIndex}`}
              className="absolute top-0"
              style={{ left: weekIndex * (cellSize + cellGap) }}
            >
              {month}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-start">
        {showWeekdays && (
          <div
            className="flex flex-col text-label text-muted-foreground tracking-wider pr-1"
            style={{ gap: cellGap, width: weekdayWidth }}
          >
            {WEEKDAYS.map((d, i) => (
              <span
                key={i}
                style={{ height: cellSize, lineHeight: `${cellSize}px` }}
              >
                {d}
              </span>
            ))}
          </div>
        )}
        <div
          className="grid grid-flow-col"
          style={{
            gridTemplateRows: `repeat(7, ${cellSize}px)`,
            gap: cellGap,
          }}
          role="img"
          aria-label={`Commit activity heatmap · peak ${peak} commits`}
        >
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const t = day ? intensity(day.count) : 0
              return (
                <div
                  key={`${wi}-${di}`}
                  title={
                    day
                      ? `${day.date}: ${day.count} commit${day.count === 1 ? "" : "s"}`
                      : ""
                  }
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor:
                      t === 0
                        ? "hsl(var(--smui-surface-2))"
                        : `color-mix(in srgb, ${baseColor} ${Math.round(
                            t * 100
                          )}%, transparent)`,
                  }}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export { CommitGraph }
export type { CommitGraphProps }
