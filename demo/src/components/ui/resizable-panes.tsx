"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Direction = "horizontal" | "vertical"

interface PaneGroupProps extends React.ComponentProps<"div"> {
  /** Split direction */
  direction?: Direction
  /** Called with array of pane sizes (percentages) when any pane is resized */
  onResize?: (sizes: number[]) => void
  /** localStorage key for persisting layout */
  persistKey?: string
}

interface PaneProps extends React.ComponentProps<"div"> {
  /** Default size as percentage (0-100). Remaining space is distributed evenly. */
  defaultSize?: number
  /** Minimum size as percentage */
  minSize?: number
  /** Maximum size as percentage */
  maxSize?: number
  /** Whether this pane can be collapsed via double-click on adjacent handle */
  collapsible?: boolean
  /** If collapsible, the size when collapsed (default 0) */
  collapsedSize?: number
}

interface PaneHandleProps extends React.ComponentProps<"div"> {
  /** Disable dragging */
  disabled?: boolean
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface PaneConfig {
  defaultSize?: number
  minSize: number
  maxSize: number
  collapsible: boolean
  collapsedSize: number
}

interface PaneGroupContext {
  direction: Direction
  registerPane: (id: string, config: PaneConfig) => void
  unregisterPane: (id: string) => void
  registerHandle: (id: string, index: number) => void
  paneIds: React.RefObject<string[]>
  collapsedPanes: Set<string>
}

const PaneGroupCtx = React.createContext<PaneGroupContext | null>(null)

function usePaneGroup() {
  const ctx = React.useContext(PaneGroupCtx)
  if (!ctx) throw new Error("Pane/PaneHandle must be used within PaneGroup")
  return ctx
}

/* ------------------------------------------------------------------ */
/*  PaneGroup                                                          */
/* ------------------------------------------------------------------ */

function PaneGroup({
  direction = "horizontal",
  onResize,
  persistKey,
  className,
  children,
  ...props
}: PaneGroupProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Track pane configs in order of registration
  const paneConfigs = React.useRef<Map<string, PaneConfig>>(new Map())
  const paneIds = React.useRef<string[]>([])

  // Sizes as percentages, keyed by pane id
  const [sizes, setSizes] = React.useState<Map<string, number>>(new Map())
  const sizesRef = React.useRef(sizes)
  // Mirror the latest sizes into a ref so pointer handlers (which run outside
  // render) can read the current value without closing over stale state.
  React.useEffect(() => {
    sizesRef.current = sizes
  }, [sizes])

  // Collapsed state per pane + pre-collapse size memory
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set())
  const preCollapseSizes = React.useRef<Map<string, number>>(new Map())

  // Track which handle index is actively being dragged
  const [draggingHandle, setDraggingHandle] = React.useState<number | null>(null)

  // Active drag state
  const dragState = React.useRef<{
    handleIndex: number
    startPos: number
    startSizeBefore: number
    startSizeAfter: number
    paneBefore: string
    paneAfter: string
    containerSize: number
  } | null>(null)

  // Load persisted sizes
  React.useEffect(() => {
    if (!persistKey) return
    try {
      const stored = localStorage.getItem(`smui-panes-${persistKey}`)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, number>
        setSizes(new Map(Object.entries(parsed)))
      }
    } catch {}
  }, [persistKey])

  // Persist sizes on change
  React.useEffect(() => {
    if (!persistKey || sizes.size === 0) return
    try {
      localStorage.setItem(
        `smui-panes-${persistKey}`,
        JSON.stringify(Object.fromEntries(sizes))
      )
    } catch {}
  }, [persistKey, sizes])

  // Initialize sizes once all panes registered
  const initializeSizes = React.useCallback(() => {
    const ids = paneIds.current
    if (ids.length === 0) return

    // Check if we already have persisted sizes
    if (sizesRef.current.size === ids.length) return

    const configs = paneConfigs.current
    let claimed = 0
    let unclaimedCount = 0

    for (const id of ids) {
      const cfg = configs.get(id)
      if (cfg?.defaultSize != null) {
        claimed += cfg.defaultSize
      } else {
        unclaimedCount++
      }
    }

    const remaining = Math.max(0, 100 - claimed)
    const perUnclaimed = unclaimedCount > 0 ? remaining / unclaimedCount : 0

    const newSizes = new Map<string, number>()
    for (const id of ids) {
      const cfg = configs.get(id)
      newSizes.set(id, cfg?.defaultSize ?? perUnclaimed)
    }
    setSizes(newSizes)
  }, [])

  const registerPane = React.useCallback(
    (id: string, config: PaneConfig) => {
      paneConfigs.current.set(id, config)
      if (!paneIds.current.includes(id)) {
        paneIds.current.push(id)
      }
      // Defer initialization to next tick so all panes can register
      queueMicrotask(initializeSizes)
    },
    [initializeSizes]
  )

  const unregisterPane = React.useCallback((id: string) => {
    paneConfigs.current.delete(id)
    paneIds.current = paneIds.current.filter((p) => p !== id)
  }, [])

  const registerHandle = React.useCallback((_id: string, _index: number) => {
    // handles don't need tracking beyond their position
  }, [])

  // --- Drag logic using pointer events + CSS custom properties ---

  const commitSizes = React.useCallback(
    (newSizes: Map<string, number>) => {
      setSizes(newSizes)
      if (onResize) {
        const ordered = paneIds.current.map((id) => newSizes.get(id) ?? 0)
        onResize(ordered)
      }
    },
    [onResize]
  )

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent, handleIndex: number) => {
      e.preventDefault()
      const container = containerRef.current
      if (!container) return

      const ids = paneIds.current
      const paneBefore = ids[handleIndex]
      const paneAfter = ids[handleIndex + 1]
      if (!paneBefore || !paneAfter) return

      const rect = container.getBoundingClientRect()
      const containerSize =
        direction === "horizontal" ? rect.width : rect.height
      const startPos =
        direction === "horizontal" ? e.clientX : e.clientY

      dragState.current = {
        handleIndex,
        startPos,
        startSizeBefore: sizesRef.current.get(paneBefore) ?? 0,
        startSizeAfter: sizesRef.current.get(paneAfter) ?? 0,
        paneBefore,
        paneAfter,
        containerSize,
      }

      // Set grabbing cursor on body
      document.body.style.cursor =
        direction === "horizontal" ? "col-resize" : "row-resize"
      document.body.style.userSelect = "none"

      const target = e.currentTarget as HTMLElement
      target.setPointerCapture(e.pointerId)
      setDraggingHandle(handleIndex)
    },
    [direction]
  )

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current
      if (!ds) return

      const currentPos =
        direction === "horizontal" ? e.clientX : e.clientY
      const deltaPx = currentPos - ds.startPos
      const deltaPct = (deltaPx / ds.containerSize) * 100

      const cfgBefore = paneConfigs.current.get(ds.paneBefore)
      const cfgAfter = paneConfigs.current.get(ds.paneAfter)

      let newBefore = ds.startSizeBefore + deltaPct
      let newAfter = ds.startSizeAfter - deltaPct

      // Enforce min/max constraints
      const minBefore = cfgBefore?.minSize ?? 0
      const maxBefore = cfgBefore?.maxSize ?? 100
      const minAfter = cfgAfter?.minSize ?? 0
      const maxAfter = cfgAfter?.maxSize ?? 100

      if (newBefore < minBefore) {
        newAfter += newBefore - minBefore
        newBefore = minBefore
      }
      if (newAfter < minAfter) {
        newBefore += newAfter - minAfter
        newAfter = minAfter
      }
      if (newBefore > maxBefore) {
        newAfter += newBefore - maxBefore
        newBefore = maxBefore
      }
      if (newAfter > maxAfter) {
        newBefore += newAfter - maxAfter
        newAfter = maxAfter
      }

      // Clamp again after adjustment
      newBefore = Math.max(minBefore, Math.min(maxBefore, newBefore))
      newAfter = Math.max(minAfter, Math.min(maxAfter, newAfter))

      // Update via CSS custom properties for jank-free drag
      const container = containerRef.current
      if (container) {
        container.style.setProperty(
          `--pane-${ds.paneBefore}`,
          `${newBefore}%`
        )
        container.style.setProperty(
          `--pane-${ds.paneAfter}`,
          `${newAfter}%`
        )
      }

      // Also update ref for pointerUp commit
      sizesRef.current = new Map(sizesRef.current)
      sizesRef.current.set(ds.paneBefore, newBefore)
      sizesRef.current.set(ds.paneAfter, newAfter)
    },
    [direction]
  )

  const handlePointerUp = React.useCallback(() => {
    if (!dragState.current) return
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
    commitSizes(new Map(sizesRef.current))
    dragState.current = null
    setDraggingHandle(null)
  }, [commitSizes])

  // Double-click to collapse/expand
  const handleDoubleClick = React.useCallback(
    (handleIndex: number) => {
      const ids = paneIds.current
      const paneBefore = ids[handleIndex]
      const paneAfter = ids[handleIndex + 1]
      if (!paneBefore || !paneAfter) return

      const cfgBefore = paneConfigs.current.get(paneBefore)
      const cfgAfter = paneConfigs.current.get(paneAfter)

      // Try collapsing the pane after the handle, then before
      let target: string | null = null
      let targetCfg: PaneConfig | undefined
      let neighbor: string | null = null

      if (cfgAfter?.collapsible) {
        target = paneAfter
        targetCfg = cfgAfter
        neighbor = paneBefore
      } else if (cfgBefore?.collapsible) {
        target = paneBefore
        targetCfg = cfgBefore
        neighbor = paneAfter
      }

      if (!target || !targetCfg || !neighbor) return

      const newSizes = new Map(sizesRef.current)
      const isCollapsed = collapsed.has(target)

      if (isCollapsed) {
        // Expand: restore to pre-collapse size (remembered) or default
        const restoreSize = preCollapseSizes.current.get(target) ?? targetCfg.defaultSize ?? 50
        const currentNeighbor = newSizes.get(neighbor) ?? 50
        const currentTarget = newSizes.get(target) ?? 0
        const total = currentNeighbor + currentTarget
        newSizes.set(target, Math.min(restoreSize, total - (targetCfg.minSize ?? 5)))
        newSizes.set(neighbor, total - (newSizes.get(target) ?? 0))
        preCollapseSizes.current.delete(target)
        setCollapsed((s) => {
          const next = new Set(s)
          next.delete(target)
          return next
        })
      } else {
        // Remember current size before collapsing
        const currentTarget = newSizes.get(target) ?? 50
        preCollapseSizes.current.set(target, currentTarget)
        const collapsedSize = targetCfg.collapsedSize
        const currentNeighbor = newSizes.get(neighbor) ?? 50
        newSizes.set(target, collapsedSize)
        newSizes.set(neighbor, currentNeighbor + currentTarget - collapsedSize)
        setCollapsed((s) => new Set(s).add(target))
      }

      commitSizes(newSizes)
    },
    [collapsed, commitSizes]
  )

  // Keyboard resize on focused handle
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent, handleIndex: number) => {
      const step = e.shiftKey ? 5 : 1
      let delta = 0

      if (direction === "horizontal") {
        if (e.key === "ArrowLeft") delta = -step
        else if (e.key === "ArrowRight") delta = step
        else return
      } else {
        if (e.key === "ArrowUp") delta = -step
        else if (e.key === "ArrowDown") delta = step
        else return
      }

      e.preventDefault()

      const ids = paneIds.current
      const paneBefore = ids[handleIndex]
      const paneAfter = ids[handleIndex + 1]
      if (!paneBefore || !paneAfter) return

      const cfgBefore = paneConfigs.current.get(paneBefore)
      const cfgAfter = paneConfigs.current.get(paneAfter)

      const newSizes = new Map(sizesRef.current)
      let newBefore = (newSizes.get(paneBefore) ?? 50) + delta
      let newAfter = (newSizes.get(paneAfter) ?? 50) - delta

      const minBefore = cfgBefore?.minSize ?? 0
      const maxBefore = cfgBefore?.maxSize ?? 100
      const minAfter = cfgAfter?.minSize ?? 0
      const maxAfter = cfgAfter?.maxSize ?? 100

      newBefore = Math.max(minBefore, Math.min(maxBefore, newBefore))
      newAfter = Math.max(minAfter, Math.min(maxAfter, newAfter))

      newSizes.set(paneBefore, newBefore)
      newSizes.set(paneAfter, newAfter)
      commitSizes(newSizes)
    },
    [direction, commitSizes]
  )

  // --- Render ---

  // Flatten children to interleave handles with context
  const childArray = React.Children.toArray(children)
  let paneIndex = 0
  const rendered: React.ReactNode[] = []

  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i]
    if (!React.isValidElement(child)) continue

    const isHandle = (child as React.ReactElement<{ "data-slot"?: string }>).props?.["data-slot"] === "pane-handle" ||
      child.type === PaneHandle

    if (isHandle) {
      const hi = paneIndex - 1
      rendered.push(
        // cloneElement only attaches props; the handlers are not invoked during
        // render, so the react-hooks/refs false-positive is safe to silence here.
        // eslint-disable-next-line react-hooks/refs
        React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          key: `handle-${hi}`,
          "data-handle-index": hi,
          "data-dragging": draggingHandle === hi || undefined,
          onPointerDown: (e: React.PointerEvent) => handlePointerDown(e, hi),
          onPointerMove: (e: React.PointerEvent) => handlePointerMove(e),
          onPointerUp: () => handlePointerUp(),
          onDoubleClick: () => handleDoubleClick(hi),
          onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, hi),
        })
      )
    } else {
      paneIndex++
      rendered.push(child)
    }
  }

  // Build CSS custom properties from committed sizes
  const containerStyle = React.useMemo(() => {
    const vars: Record<string, string> = {}
    sizes.forEach((pct, id) => {
      vars[`--pane-${id}`] = `${pct}%`
    })
    return vars
  }, [sizes])

  const ctxValue = React.useMemo<PaneGroupContext>(
    () => ({
      direction,
      registerPane,
      unregisterPane,
      registerHandle,
      paneIds,
      collapsedPanes: collapsed,
    }),
    [direction, registerPane, unregisterPane, registerHandle, collapsed]
  )

  return (
    <PaneGroupCtx.Provider value={ctxValue}>
      <div
        ref={containerRef}
        data-slot="pane-group"
        data-direction={direction}
        className={cn(
          "flex w-full h-full overflow-hidden",
          direction === "horizontal" ? "flex-row" : "flex-col",
          className
        )}
        style={containerStyle as React.CSSProperties}
        {...props}
      >
        {rendered}
      </div>
    </PaneGroupCtx.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  Pane                                                               */
/* ------------------------------------------------------------------ */

function Pane({
  defaultSize,
  minSize = 0,
  maxSize = 100,
  collapsible = false,
  collapsedSize = 0,
  className,
  children,
  style,
  ...props
}: PaneProps) {
  const { direction, registerPane, unregisterPane, collapsedPanes } = usePaneGroup()
  // Sanitize React.useId() output (":r3:") into a CSS-safe custom-property segment.
  const rawId = React.useId()
  const id = `pane-${rawId.replace(/:/g, "")}`
  const isCollapsed = collapsedPanes.has(id)

  React.useEffect(() => {
    registerPane(id, { defaultSize, minSize, maxSize, collapsible, collapsedSize })
    return () => unregisterPane(id)
  }, [id, defaultSize, minSize, maxSize, collapsible, collapsedSize, registerPane, unregisterPane])

  const sizeVar = `var(--pane-${id}, ${defaultSize ?? 50}%)`

  return (
    <div
      data-slot="pane"
      data-pane-id={id}
      data-state={isCollapsed ? "collapsed" : "expanded"}
      className={cn(
        "overflow-hidden transition-[flex-basis] duration-150",
        isCollapsed ? "overflow-hidden" : "",
        className
      )}
      style={{
        ...style,
        [direction === "horizontal" ? "width" : "height"]: sizeVar,
        flexShrink: 0,
        flexGrow: 0,
      }}
      {...props}
    >
      <div className="h-full w-full overflow-auto">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PaneHandle                                                         */
/* ------------------------------------------------------------------ */

function PaneHandle({
  disabled = false,
  className,
  ...props
}: PaneHandleProps) {
  const { direction } = usePaneGroup()
  const isHorizontal = direction === "horizontal"

  return (
    <div
      role="separator"
      aria-orientation={isHorizontal ? "vertical" : "horizontal"}
      aria-valuenow={50}
      tabIndex={disabled ? undefined : 0}
      data-slot="pane-handle"
      data-direction={direction}
      data-disabled={disabled || undefined}
      className={cn(
        "group/handle relative flex-shrink-0 select-none touch-none",
        "bg-border transition-[background-color,box-shadow,width,height] duration-150",
        "hover:bg-[hsl(var(--smui-frost-2))] hover:shadow-[0_0_6px_hsl(var(--smui-frost-2)/0.4)]",
        "focus-visible:outline-none focus-visible:bg-ring focus-visible:shadow-[0_0_6px_hsl(var(--smui-frost-2)/0.4)]",
        "active:bg-primary active:shadow-[0_0_8px_hsl(var(--smui-frost-2)/0.6)]",
        "data-[dragging=true]:bg-primary data-[dragging=true]:shadow-[0_0_8px_hsl(var(--smui-frost-2)/0.6)]",
        isHorizontal
          ? "w-px cursor-col-resize hover:w-[3px] active:w-[3px] focus-visible:w-[3px] data-[dragging=true]:w-[3px]"
          : "h-px cursor-row-resize hover:h-[3px] active:h-[3px] focus-visible:h-[3px] data-[dragging=true]:h-[3px]",
        disabled && "pointer-events-none opacity-30",
        className
      )}
      {...props}
    >
      {/* Invisible hit area for easier grabbing */}
      <div
        className={cn(
          "absolute z-10",
          isHorizontal
            ? "inset-y-0 -left-1.5 -right-1.5"
            : "inset-x-0 -top-1.5 -bottom-1.5"
        )}
      />
      {/* Grip indicator — 3 dots centered */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center pointer-events-none",
          isHorizontal ? "flex-col gap-[3px]" : "flex-row gap-[3px]"
        )}
      >
        <span className="block w-[3px] h-[3px] rounded-full bg-muted-foreground/30 group-hover/handle:bg-muted-foreground/60 transition-colors" />
        <span className="block w-[3px] h-[3px] rounded-full bg-muted-foreground/30 group-hover/handle:bg-muted-foreground/60 transition-colors" />
        <span className="block w-[3px] h-[3px] rounded-full bg-muted-foreground/30 group-hover/handle:bg-muted-foreground/60 transition-colors" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export { PaneGroup, Pane, PaneHandle }
export type { PaneGroupProps, PaneProps, PaneHandleProps }
