"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { highlight } from "@/lib/highlight"

interface CodeLineProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** The single line of code to render */
  code: string
  /** Shiki language (default "bash") */
  lang?: string
  /** Show a copy button (default true) */
  showCopy?: boolean
  /** Optional prefix prompt, e.g. "$" or "›" */
  prompt?: string
}

/**
 * A single highlighted line of code with an inline copy affordance.
 * Uses shiki for highlighting (same dual-theme setup as the rest of SMUI).
 */
function CodeLine({
  code,
  lang = "bash",
  showCopy = true,
  prompt,
  className,
  ...props
}: CodeLineProps) {
  const [html, setHtml] = React.useState<string>("")
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    let cancelled = false
    highlight(code, lang).then((out) => {
      if (!cancelled) setHtml(out)
    })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div
      data-slot="code-line"
      className={cn(
        "group/code-line flex items-center gap-2 bg-card border border-border px-3 py-[7px]",
        "font-mono text-sm leading-none",
        "[&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:!text-sm",
        className
      )}
      {...props}
    >
      {prompt && (
        <span className="text-primary shrink-0 select-none">{prompt}</span>
      )}
      <div
        className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
        dangerouslySetInnerHTML={{
          __html: html || escapeHtml(code),
        }}
      />
      {showCopy && (
        <button
          type="button"
          onClick={onCopy}
          title={copied ? "Copied" : "Copy"}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[hsl(var(--smui-green))]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  )
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export { CodeLine }
export type { CodeLineProps }
