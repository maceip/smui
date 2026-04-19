"use client"

import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FileNode {
  name: string
  /** If omitted, this node is a file */
  children?: FileNode[]
  /** Optional icon color (CSS color or --smui-* token name) */
  accent?: string
  /** Optional override icon (lucide element) */
  icon?: React.ReactNode
}

interface FileTreeProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  nodes: FileNode[]
  /** Called when a file (leaf) is clicked with its full path segments */
  onSelect?: (path: string[]) => void
  /** Paths that should start expanded, as "/"-joined strings (e.g. "src/components") */
  defaultExpanded?: string[]
  /** Indentation per level in px (default 14) */
  indent?: number
}

function resolveAccent(a?: string): string | undefined {
  if (!a) return undefined
  if (a.startsWith("#") || a.startsWith("rgb") || a.startsWith("hsl")) return a
  return `hsl(var(--smui-${a}))`
}

function TreeNode({
  node,
  path,
  level,
  indent,
  expanded,
  toggle,
  onSelect,
}: {
  node: FileNode
  path: string[]
  level: number
  indent: number
  expanded: Set<string>
  toggle: (key: string) => void
  onSelect?: (path: string[]) => void
}) {
  const key = path.join("/")
  const isFolder = Array.isArray(node.children)
  const isOpen = isFolder && expanded.has(key)
  const accent = resolveAccent(node.accent)

  const onClick = () => {
    if (isFolder) {
      toggle(key)
    } else {
      onSelect?.(path)
    }
  }

  return (
    <div data-slot="file-tree-node">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group/row w-full flex items-center gap-1.5 py-[3px] px-1 text-ui text-left",
          "text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer",
          isFolder && "text-foreground"
        )}
        style={{ paddingLeft: level * indent + 4 }}
        aria-expanded={isFolder ? isOpen : undefined}
      >
        {isFolder ? (
          <>
            <ChevronRight
              className={cn(
                "w-3 h-3 text-muted-foreground shrink-0 transition-transform",
                isOpen && "rotate-90"
              )}
            />
            {node.icon ??
              (isOpen ? (
                <FolderOpen
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: accent ?? "hsl(var(--smui-frost-2))" }}
                />
              ) : (
                <Folder
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: accent ?? "hsl(var(--smui-frost-2))" }}
                />
              ))}
          </>
        ) : (
          <>
            <span className="w-3 h-3 shrink-0" />
            {node.icon ?? (
              <File
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: accent ?? "hsl(var(--muted-foreground))" }}
              />
            )}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && isOpen && (
        <div role="group">
          {node.children!.map((child, i) => (
            <TreeNode
              key={`${key}/${child.name}-${i}`}
              node={child}
              path={[...path, child.name]}
              level={level + 1}
              indent={indent}
              expanded={expanded}
              toggle={toggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * A keyboard-accessible, collapsible file tree. Leaves trigger `onSelect`
 * with the full path as an array of segments.
 */
function FileTree({
  nodes,
  onSelect,
  defaultExpanded = [],
  indent = 14,
  className,
  ...props
}: FileTreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpanded)
  )

  const toggle = React.useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  return (
    <div
      data-slot="file-tree"
      role="tree"
      className={cn(
        "bg-card border border-border p-1 font-mono",
        className
      )}
      {...props}
    >
      {nodes.map((n, i) => (
        <TreeNode
          key={`${n.name}-${i}`}
          node={n}
          path={[n.name]}
          level={0}
          indent={indent}
          expanded={expanded}
          toggle={toggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export { FileTree }
export type { FileTreeProps }
