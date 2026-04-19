"use client"

import * as React from "react"
import { Star, GitFork, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"

interface RepoCardProps extends React.ComponentProps<"a"> {
  owner: string
  name: string
  description?: string
  /** Primary language name */
  language?: string
  /** CSS color for the language dot (accepts any CSS color or --smui-* token name) */
  languageColor?: string
  stars?: number
  forks?: number
  /** ISO date string */
  updatedAt?: string
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

function formatRelative(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

function resolveLangColor(color?: string): string {
  if (!color) return "hsl(var(--smui-frost-2))"
  if (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl"))
    return color
  // assume smui token name
  return `hsl(var(--smui-${color}))`
}

/**
 * GitHub-style repo card: owner/name, description, language dot, stars, forks,
 * and last-updated. Renders as `<a>` when `href` is supplied, otherwise a
 * static card.
 */
function RepoCard({
  owner,
  name,
  description,
  language,
  languageColor,
  stars,
  forks,
  updatedAt,
  className,
  href,
  ...props
}: RepoCardProps) {
  const Tag = (href ? "a" : "div") as React.ElementType
  const tagProps = href
    ? { href, target: "_blank" as const, rel: "noreferrer noopener" }
    : {}

  return (
    <Tag
      data-slot="repo-card"
      className={cn(
        "block bg-card border border-border p-3.5",
        href && "card-glow",
        className
      )}
      {...tagProps}
      {...props}
    >
      <div className="flex items-center gap-1.5 text-ui mb-1.5">
        <span className="text-muted-foreground">{owner}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-primary font-semibold">{name}</span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground leading-snug mb-2.5 line-clamp-2 pl-0.5">
          {description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-label text-muted-foreground tracking-wider">
        {language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: resolveLangColor(languageColor) }}
            />
            {language}
          </span>
        )}
        {typeof stars === "number" && (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Star className="w-3 h-3" />
            {formatCount(stars)}
          </span>
        )}
        {typeof forks === "number" && (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <GitFork className="w-3 h-3" />
            {formatCount(forks)}
          </span>
        )}
        {updatedAt && (
          <span className="inline-flex items-center gap-1">
            <CircleDot className="w-3 h-3" />
            {formatRelative(updatedAt)}
          </span>
        )}
      </div>
    </Tag>
  )
}

export { RepoCard }
export type { RepoCardProps }
