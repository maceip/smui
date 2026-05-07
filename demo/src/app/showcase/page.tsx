"use client"

import * as React from "react"
import Link from "next/link"
import { AccentPicker } from "@/components/accent-picker"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ThemePresetSwitcher } from "@/components/theme-preset-switcher"
import { openCommandPalette } from "@/components/command-palette"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Toggle } from "@/components/ui/toggle"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Pane, PaneGroup, PaneHandle } from "@/components/ui/resizable-panes"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkline } from "@/components/ui/sparkline"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Terminal } from "@/components/ui/terminal"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TextShimmer } from "@/components/ui/text-shimmer"
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave"
import { TextScramble } from "@/components/ui/text-scramble"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { SlidingNumber } from "@/components/ui/sliding-number"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { Carousel } from "@/components/ui/carousel"
import { CodeLine } from "@/components/ui/code-line"
import { RepoCard } from "@/components/ui/repo-card"
import { CommitGraph, type CommitDay } from "@/components/ui/commit-graph"
import { FileTree, type FileNode } from "@/components/ui/file-tree"
import { Gauge } from "@/components/ui/gauge"
import {
  FloatingCompletion,
  type CompletionItem,
} from "@/components/ui/floating-completion"
import { StatusRail } from "@/components/ui/status-rail"
import {
  Chat,
  ChatMessages,
  ChatMessage,
  ChatInput,
  type ChatMessageData,
  type ChatModel,
} from "@/components/ui/chat"

/* ------------------------------------------------------------------ */
/*  Nav                                                                */
/* ------------------------------------------------------------------ */

function Nav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-12 px-6 bg-card border-b border-border">
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold tracking-[2px] uppercase text-foreground mr-4">
          smui
        </span>
        <Link
          href="/"
          className="text-xs text-muted-foreground uppercase tracking-wider px-2.5 py-1.5 hover:text-foreground transition-colors"
        >
          docs
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground uppercase tracking-wider px-2.5 py-1.5 hover:text-foreground transition-colors"
        >
          dashboard
        </Link>
        <Link
          href="/showcase"
          className="text-xs text-primary uppercase tracking-wider px-2.5 py-1.5"
        >
          showcase
        </Link>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={openCommandPalette}
          className="text-xs text-muted-foreground px-2.5 py-1 bg-background border border-border flex items-center justify-between gap-2 min-w-[170px] hover:text-foreground hover:border-[hsl(var(--smui-border-hover))] transition-colors cursor-pointer"
        >
          <span>search...</span>
          <kbd className="text-label text-muted-foreground border border-border px-1 bg-card">
            ctrl+k
          </kbd>
        </button>
        <ThemeSwitcher />
        <span className="text-xs text-muted-foreground">v1.0.0</span>
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  ShowcaseRow — one-per-line wrapper                                  */
/* ------------------------------------------------------------------ */

function ShowcaseRow({
  id,
  name,
  source,
  description,
  children,
}: {
  id: string
  name: string
  source?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-14 mb-2">
      <Card className="card-glow">
        <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            component // {name}
          </CardTitle>
          {source && (
            <CardDescription className="text-label text-muted-foreground tracking-wider uppercase">
              src // {source}
            </CardDescription>
          )}
        </CardHeader>
        {description && (
          <div className="text-xs text-muted-foreground px-3.5 -mt-1 mb-2">
            {description}
          </div>
        )}
        <CardContent className="p-3.5 pt-2 bg-black/35 border-t border-border">
          {children}
        </CardContent>
      </Card>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const FAKE_FILES: FileNode[] = [
  {
    name: "src",
    children: [
      {
        name: "app",
        children: [
          { name: "layout.tsx" },
          { name: "page.tsx" },
          {
            name: "showcase",
            children: [{ name: "page.tsx" }],
          },
        ],
      },
      {
        name: "components",
        children: [
          {
            name: "ui",
            children: [
              { name: "chat.tsx", accent: "pink" },
              { name: "carousel.tsx" },
              { name: "file-tree.tsx" },
              { name: "text-shimmer.tsx" },
            ],
          },
          { name: "accent-picker.tsx" },
        ],
      },
      { name: "globals.css", accent: "amber" },
    ],
  },
  { name: "package.json", accent: "terminal" },
  { name: "README.md" },
]

function makeCommitData(): CommitDay[] {
  // Generate ~20 weeks of plausible activity ending today.
  const out: CommitDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = 20 * 7
  // Seed-ish deterministic pseudo-random so SSR/CSR match
  let seed = 9871
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dow = d.getDay()
    const base = dow === 0 || dow === 6 ? 0.3 : 0.7
    const count = Math.floor(Math.pow(rng(), 2) * (base * 9))
    out.push({ date: d.toISOString().slice(0, 10), count })
  }
  return out
}

const MODELS: ChatModel[] = [
  { id: "sonnet", label: "claude sonnet 4.6", tag: "balanced" },
  { id: "opus", label: "claude opus 4.7", tag: "deep" },
  { id: "haiku", label: "claude haiku 4.5", tag: "fast" },
]

const SHELL_COMMANDS: CompletionItem[] = [
  { name: "git status", description: "working tree", icon: "⬡", color: "terminal" },
  { name: "git commit -m", description: "record changes", icon: "⬡", color: "terminal" },
  { name: "git push", description: "update remote", icon: "⬡", color: "terminal" },
  { name: "git pull --rebase", description: "fetch & rebase", icon: "⬡", color: "terminal" },
  { name: "git checkout -b", description: "new branch", icon: "⬡", color: "amber" },
  { name: "git log --oneline", description: "history", icon: "⬡", color: "cyan" },
  { name: "npm run dev", description: "start dev server", icon: "▪", color: "pink" },
  { name: "npm run build", description: "production build", icon: "▪", color: "pink" },
  { name: "npm test", description: "run test suite", icon: "▪", color: "lime" },
  { name: "cargo build --release", description: "optimized build", icon: "◆", color: "amber" },
  { name: "cargo run", description: "execute binary", icon: "◆", color: "lime" },
  { name: "docker compose up -d", description: "start services", icon: "◇", color: "cyan" },
  { name: "ssh bridge", description: "connect to host", icon: "⌘", color: "teal" },
  { name: "tail -f /var/log/system.log", description: "follow log", icon: "≡", color: "magenta" },
]

const SCRIPTED_ASSISTANT_REPLIES: string[] = [
  "Routing that through the primary subsystem. I'll keep you posted as I work.",
  "Got it — I've queued that up. Anything else you'd like checked while I'm here?",
  "Here's what I'd recommend: start with a small iteration, verify, then expand.",
  "Interesting. I've got three ways to approach that, but the simplest is probably best.",
]

const COMPONENT_GROUPS = [
  {
    id: "foundation-primitives",
    label: "foundation primitives",
    items: [
      "Accordion",
      "Alert",
      "Avatar",
      "Badge",
      "Breadcrumb",
      "Button",
      "Card",
      "Checkbox",
      "Input",
      "Progress",
      "Separator",
      "Skeleton",
      "Slider",
      "Table",
      "Tabs",
      "Textarea",
      "Toggle",
      "Tooltip",
    ],
  },
  {
    id: "navigation-overlays",
    label: "navigation + overlays",
    items: ["Command", "Dialog", "Pagination", "Popover", "Sheet", "Sidebar"],
  },
  {
    id: "data-motion-shell",
    label: "data, motion + shell",
    items: [
      "AnimatedNumber",
      "Carousel",
      "CodeLine",
      "CommitGraph",
      "FileTree",
      "FloatingCompletion",
      "Gauge",
      "InfiniteSlider",
      "RepoCard",
      "ResizablePanes",
      "SlidingNumber",
      "Sparkline",
      "StatusRail",
      "Terminal",
      "TextScramble",
      "TextShimmer",
      "TextShimmerWave",
    ],
  },
  {
    id: "chat",
    label: "agentic interfaces",
    items: ["Chat", "ChatMessages", "ChatMessage", "ChatInput"],
  },
]

/* ------------------------------------------------------------------ */
/*  Terminal autocomplete — FloatingCompletion wrapped around an       */
/*  inline terminal-styled input.                                       */
/* ------------------------------------------------------------------ */

function TerminalAutocompleteDemo() {
  const [value, setValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [history, setHistory] = React.useState<string[]>([
    "smui terminal // tab or type to autocomplete",
    "try: git, npm, cargo, ssh",
  ])
  const inputRef = React.useRef<HTMLInputElement>(null)

  // The query is the last word of the buffer (what we want to complete).
  const currentWord = React.useMemo(() => {
    const parts = value.split(/\s+/)
    return parts[parts.length - 1] ?? ""
  }, [value])

  const handleSelect = (item: CompletionItem) => {
    // Replace the last token with the selected command.
    const parts = value.split(/\s+/)
    parts[parts.length - 1] = item.name
    setValue(parts.join(" ") + " ")
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (e.key === "Enter" && !open) {
      e.preventDefault()
      const cmd = value.trim()
      if (cmd) {
        setHistory((h) => [...h, `$ ${cmd}`])
        setValue("")
      }
    }
  }

  return (
    <div className="bg-[hsl(var(--smui-surface-0))] border border-border font-mono text-ui text-foreground p-3 min-h-[200px] flex flex-col">
      {history.map((line, i) => (
        <div
          key={i}
          className={
            line.startsWith("$ ")
              ? "text-foreground"
              : "text-muted-foreground"
          }
        >
          {line}
        </div>
      ))}
      <FloatingCompletion
        items={SHELL_COMMANDS}
        query={currentWord}
        open={open && currentWord.length > 0}
        onSelect={handleSelect}
        onDismiss={() => setOpen(false)}
        maxVisible={6}
        className="w-full"
      >
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--smui-green))] shrink-0">$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setOpen(e.target.value.trim().length > 0)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (currentWord.length > 0) setOpen(true)
            }}
            onBlur={() => {
              // Let click events on completion items register first
              setTimeout(() => setOpen(false), 150)
            }}
            placeholder="start typing a command..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </FloatingCompletion>
      <div className="text-label text-muted-foreground tracking-wider mt-2">
        tab toggles menu · ↑↓ navigate · enter picks · esc dismisses
      </div>
    </div>
  )
}

function ComponentIndex() {
  return (
    <Card className="card-glow mb-3">
      <CardHeader className="py-2.5 px-3.5">
        <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
          gallery index // all components
        </CardTitle>
        <CardDescription className="text-xs">
          primitives, overlays, data views, shell widgets, and custom additions
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {COMPONENT_GROUPS.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="block border border-border bg-background p-3 hover:border-[hsl(var(--smui-border-hover))] transition-colors"
          >
            <div className="text-label text-muted-foreground tracking-wider uppercase mb-2">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-1">
              {group.items.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  )
}

function FoundationPrimitivesGallery() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card>
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            card / button / badge
          </CardTitle>
          <CardDescription className="text-xs">base controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm">default</Button>
            <Button size="sm" variant="outline">
              outline
            </Button>
            <Button size="sm" variant="terminal">
              terminal
            </Button>
            <Button size="sm" variant="amber">
              amber
            </Button>
            <Button size="sm" variant="crimson">
              crimson
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              "terminal",
              "amber",
              "cyan",
              "pink",
              "magenta",
              "crimson",
              "teal",
              "indigo",
              "lime",
            ].map((variant) => (
              <Badge
                key={variant}
                variant={
                  variant as
                    | "terminal"
                    | "amber"
                    | "cyan"
                    | "pink"
                    | "magenta"
                    | "crimson"
                    | "teal"
                    | "indigo"
                    | "lime"
                }
              >
                {variant}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            input / textarea / checkbox / toggle
          </CardTitle>
          <CardDescription className="text-xs">forms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input defaultValue="NCC-48271" aria-label="Demo input" />
            <Textarea
              defaultValue="Station Helix clearance granted."
              aria-label="Demo textarea"
              className="min-h-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-ui">
              <Checkbox defaultChecked />
              synced
            </label>
            <Toggle defaultPressed size="sm">
              arm
            </Toggle>
            <Toggle size="sm" variant="outline">
              ghost
            </Toggle>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            tabs / accordion / alert
          </CardTitle>
          <CardDescription className="text-xs">disclosure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Tabs defaultValue="nav">
            <TabsList variant="line">
              <TabsTrigger value="nav">nav</TabsTrigger>
              <TabsTrigger value="eng">eng</TabsTrigger>
              <TabsTrigger value="comms">comms</TabsTrigger>
            </TabsList>
            <TabsContent value="nav">
              <p className="text-xs text-muted-foreground">
                Route plotted through the frost corridor.
              </p>
            </TabsContent>
            <TabsContent value="eng">
              <p className="text-xs text-muted-foreground">
                Reactor output holding at 72 percent.
              </p>
            </TabsContent>
            <TabsContent value="comms">
              <p className="text-xs text-muted-foreground">
                Relay packet received from station control.
              </p>
            </TabsContent>
          </Tabs>
          <Accordion type="single" collapsible defaultValue="one">
            <AccordionItem value="one">
              <AccordionTrigger>Primary systems</AccordionTrigger>
              <AccordionContent>
                Navigation, shields, and comms are online.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger>Auxiliary systems</AccordionTrigger>
              <AccordionContent>
                Cargo scanners and dock clamps are standing by.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Alert variant="cyan">
            <AlertTitle>Telemetry stable</AlertTitle>
            <AlertDescription>
              Frost-channel uplink reports nominal latency.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            table / avatar / progress / slider
          </CardTitle>
          <CardDescription className="text-xs">data primitives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {["KV", "LC", "SO"].map((initials, i) => (
              <Avatar key={initials}>
                <AvatarFallback>{initials}</AvatarFallback>
                {i === 0 && <AvatarBadge />}
              </Avatar>
            ))}
            <Separator orientation="vertical" className="h-7" />
            <div className="flex-1">
              <Progress value={72} />
              <Slider defaultValue={[68]} max={100} step={1} className="mt-3" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>system</TableHead>
                <TableHead>state</TableHead>
                <TableHead>load</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["reactor", "nominal", "72%"],
                ["shields", "warning", "41%"],
                ["cargo", "idle", "18%"],
              ].map(([system, state, load]) => (
                <TableRow key={system}>
                  <TableCell>{system}</TableCell>
                  <TableCell>{state}</TableCell>
                  <TableCell className="text-primary">{load}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-2.5 w-2/3 mb-1.5" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
            <Tooltip open>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  tooltip
                </Button>
              </TooltipTrigger>
              <TooltipContent>SMUI tooltip surface</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NavigationOverlayGallery() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      <Card>
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            breadcrumb / pagination / command
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">systems</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">gamma draconis</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>station helix</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <Command className="border border-border">
            <CommandInput placeholder="run a bridge command..." />
            <CommandList>
              <CommandEmpty>No command found.</CommandEmpty>
              <CommandGroup heading="Navigation">
                <CommandItem>Open dashboard</CommandItem>
                <CommandItem>
                  Jump to weapons <CommandShortcut>⌘3</CommandShortcut>
                </CommandItem>
                <CommandItem>Scan cargo hold</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            dialog / sheet / popover
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                open dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Commit course change?</DialogTitle>
                <DialogDescription>
                  This demo shows the dialog surface, title, description, and
                  footer actions.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" size="sm">
                  cancel
                </Button>
                <Button size="sm">commit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                open sheet
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Station manifest</SheetTitle>
                <SheetDescription>
                  A side panel for dense operational controls.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                open popover
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="text-label text-muted-foreground tracking-wider uppercase mb-1">
                route note
              </div>
              <p className="text-xs text-muted-foreground">
                Popovers inherit the sharp SMUI surface treatment.
              </p>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      <div className="xl:col-span-2">
        <SidebarProvider defaultOpen className="!min-h-[260px] overflow-hidden border border-border bg-background">
          <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
              <div className="px-2 py-1 text-xs tracking-[2px] uppercase">
                smui
              </div>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>bridge</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {["overview", "navigation", "weapons", "cargo"].map(
                      (item, i) => (
                        <SidebarMenuItem key={item}>
                          <SidebarMenuButton isActive={i === 0}>
                            <span className="size-2 bg-primary" />
                            <span>{item}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="!min-h-[260px] bg-transparent">
            <div className="flex items-center gap-2 border-b border-border p-2">
              <SidebarTrigger />
              <span className="text-label text-muted-foreground tracking-wider uppercase">
                sidebar provider / inset / rail
              </span>
            </div>
            <div className="p-4 text-sm text-muted-foreground">
              The shadcn-style sidebar components are included and themed for
              dense terminal dashboards.
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  )
}

function DataMotionShellGallery() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      <Card>
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            gauge / sparkline
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <Gauge
            value={72}
            color="cyan"
            label="reactor"
            size="lg"
            thresholds={[
              { value: 30, color: "crimson", label: "low" },
              { value: 80, color: "amber", label: "high" },
            ]}
          />
          <div className="space-y-3">
            <Sparkline
              data={[12, 18, 14, 22, 19, 28, 24, 32, 29, 38, 35, 42]}
              width={220}
              height={56}
              variant="area"
              color="terminal"
              showEndDot
              showRange
            />
            <Sparkline
              data={[
                { value: 45 },
                { value: 62 },
                { value: 38 },
                { value: 80, color: "amber" },
                { value: 55 },
                { value: 70 },
                { value: 48, color: "cyan" },
              ]}
              width={220}
              height={48}
              variant="bar"
              color="pink"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            resizable panes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaneGroup className="h-[220px] border border-border bg-background">
            <Pane defaultSize={35} minSize={20}>
              <div className="h-full p-3 text-label text-muted-foreground tracking-wider uppercase">
                nav pane
              </div>
            </Pane>
            <PaneHandle />
            <Pane defaultSize={65} minSize={30}>
              <div className="h-full p-3 text-ui">
                Drag the divider to resize this shell layout.
              </div>
            </Pane>
          </PaneGroup>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader className="py-2.5 px-3.5">
          <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
            terminal
          </CardTitle>
          <CardDescription className="text-xs">
            xterm wrapper with SMUI theme tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] border border-border bg-background">
            <Terminal
              webgl={false}
              onReady={(terminal) => {
                terminal.writeln("smui terminal // ready")
                terminal.writeln("$ npm run pages:build")
                terminal.writeln("static gallery exported to ./out")
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ShowcasePage() {
  /* Animated numbers */
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800)
    return () => clearInterval(id)
  }, [])
  // Big, obvious deltas so the tween is clearly visible every cycle.
  const animatedValue =
    50_000 + Math.round(Math.sin(tick * 0.9) * 12_000) + tick * 137
  const slidingValue = 1024 + tick * 3

  /* Scramble re-trigger */
  const scrambleWords = ["initializing", "calibrating", "online", "ready"]
  const scrambleText = scrambleWords[tick % scrambleWords.length]

  /* Chat state */
  const [chatInput, setChatInput] = React.useState("")
  const [chatModel, setChatModel] = React.useState(MODELS[0].id)
  const [messages, setMessages] = React.useState<ChatMessageData[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi — this is a scripted chat showing ChatMessage / ChatInput. Send something and I'll reply with a canned response.",
    },
  ])
  const [busy, setBusy] = React.useState(false)
  const msgCounterRef = React.useRef(2)
  const assistantIndexRef = React.useRef(0)

  const onSendMessage = React.useCallback(
    (text: string) => {
      const userMsg: ChatMessageData = {
        id: String(msgCounterRef.current++),
        role: "user",
        content: text,
      }
      setMessages((prev) => [...prev, userMsg])
      setBusy(true)

      // Stream a scripted reply one character at a time.
      const replyBody =
        SCRIPTED_ASSISTANT_REPLIES[
          assistantIndexRef.current++ % SCRIPTED_ASSISTANT_REPLIES.length
        ]
      const assistantId = String(msgCounterRef.current++)
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ])
      let i = 0
      const interval = setInterval(() => {
        i++
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: replyBody.slice(0, i) }
              : m
          )
        )
        if (i >= replyBody.length) {
          clearInterval(interval)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false } : m
            )
          )
          setBusy(false)
        }
      }, 22)
    },
    []
  )

  const commitData = React.useMemo(makeCommitData, [])

  return (
    <main>
      <Nav />
      <div className="sticky top-12 z-40 flex items-center justify-center gap-4 py-2 px-5 bg-card border-b border-border">
        <ThemePresetSwitcher />
        <span className="text-border">|</span>
        <AccentPicker variant="inline" />
      </div>
      <div className="accent-line" />

      <section className="py-10 px-6 max-w-[1000px] mx-auto">
        <div className="text-xs text-muted-foreground tracking-[2px] uppercase mb-1.5">
          example // showcase
        </div>
        <h2 className="text-heading font-medium text-foreground tracking-tight mb-1">
          component gallery
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Every component in the library, including the custom components built
          for SMUI, styled with SMUI tokens and ready for GitHub Pages.
        </p>

        <ComponentIndex />

        <ShowcaseRow
          id="foundation-primitives"
          name="foundation primitives"
          source="shadcn/ui + smui"
          description="The base components that power forms, cards, disclosure, feedback, data tables, and simple status views."
        >
          <FoundationPrimitivesGallery />
        </ShowcaseRow>

        <ShowcaseRow
          id="navigation-overlays"
          name="navigation + overlays"
          source="shadcn/ui + smui"
          description="Command menus, dialogs, sheets, popovers, pagination, breadcrumbs, and the themed dashboard sidebar."
        >
          <NavigationOverlayGallery />
        </ShowcaseRow>

        <ShowcaseRow
          id="data-motion-shell"
          name="data, motion + shell"
          source="smui custom"
          description="Custom widgets for operational dashboards: gauges, sparklines, resizable panes, terminal, and motion/data primitives."
        >
          <DataMotionShellGallery />
        </ShowcaseRow>

        <ShowcaseRow
          id="text-shimmer"
          name="text shimmer"
          source="motion-primitives"
          description="Sweeping gradient across static text — useful for 'thinking' or skeleton states. Highlight color follows the active accent, so dramatic accents read better."
        >
          <TextShimmer className="text-heading font-medium">
            Calibrating subsystems…
          </TextShimmer>
        </ShowcaseRow>

        <ShowcaseRow
          id="text-shimmer-wave"
          name="text shimmer wave"
          source="motion-primitives"
          description="Per-character shimmer that ripples across the string from left to right."
        >
          <TextShimmerWave className="text-heading font-medium">
            Synchronizing telemetry relay
          </TextShimmerWave>
        </ShowcaseRow>

        <ShowcaseRow
          id="text-scramble"
          name="text scramble"
          source="motion-primitives"
          description="Resolves random glyphs into target text. Re-triggers every few seconds below."
        >
          <div className="text-heading font-medium text-foreground">
            <TextScramble duration={0.9}>{scrambleText}</TextScramble>
          </div>
        </ShowcaseRow>

        <ShowcaseRow
          id="animated-number"
          name="animated number"
          source="motion-primitives"
          description="Smoothly tweens between values with an ease-out curve."
        >
          <AnimatedNumber
            value={animatedValue}
            duration={1400}
            className="text-stat font-medium text-primary"
            prefix="$"
          />
        </ShowcaseRow>

        <ShowcaseRow
          id="sliding-number"
          name="sliding number"
          source="motion-primitives"
          description="Odometer-style per-digit slide when the value changes."
        >
          <SlidingNumber
            value={slidingValue}
            padStart={5}
            digitHeight={28}
            className="text-[28px] text-foreground"
          />
        </ShowcaseRow>

        <ShowcaseRow
          id="infinite-slider"
          name="infinite slider"
          source="motion-primitives"
          description="Seamless marquee with mask-edge fades. Pauses on hover."
        >
          <InfiniteSlider duration={18} gap="2rem">
            {[
              "reactor",
              "shields",
              "weapons",
              "navigation",
              "comms",
              "cargo",
              "engineering",
              "life support",
            ].map((label) => (
              <span
                key={label}
                className="text-ui text-muted-foreground tracking-[1.5px] uppercase"
              >
                {label}
              </span>
            ))}
          </InfiniteSlider>
        </ShowcaseRow>

        <ShowcaseRow
          id="carousel"
          name="carousel"
          source="motion-primitives"
          description="Scroll-snap carousel with prev/next controls and position indicators."
        >
          <Carousel gap="0.75rem" label="Demo carousel">
            {["frost 2", "terminal", "amber", "pink", "magenta", "teal"].map(
              (name, i) => (
                <div
                  key={name}
                  className="w-[180px] h-[100px] bg-card border border-border flex flex-col items-center justify-center gap-1"
                >
                  <div
                    className="w-10 h-10"
                    style={{
                      backgroundColor: `hsl(var(--smui-${name.replace(" ", "-")}))`,
                    }}
                  />
                  <div className="text-label text-muted-foreground tracking-wider uppercase">
                    slide {i + 1} · {name}
                  </div>
                </div>
              )
            )}
          </Carousel>
        </ShowcaseRow>

        <ShowcaseRow
          id="code-line"
          name="code line"
          source="jal-co/ui"
          description="Single highlighted line of code with inline copy."
        >
          <div className="flex flex-col gap-1.5 max-w-full">
            <CodeLine code="npm install @smui/ui" lang="bash" prompt="$" />
            <CodeLine
              code="import { Gauge } from '@smui/ui'"
              lang="tsx"
              prompt="›"
            />
          </div>
        </ShowcaseRow>

        <ShowcaseRow
          id="repo-card"
          name="repo card"
          source="jal-co/ui"
          description="Owner/name, description, language, stars, forks, updated."
        >
          <RepoCard
            owner="statico"
            name="smui"
            description="Spacemolt interface system — a shadcn-compatible UI kit with terminal-aesthetic density."
            language="TypeScript"
            languageColor="frost-2"
            stars={1428}
            forks={42}
            updatedAt={new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()}
            href="https://github.com/statico/smui"
          />
        </ShowcaseRow>

        <ShowcaseRow
          id="commit-graph"
          name="commit graph"
          source="jal-co/ui"
          description="Weekly commit-count heatmap with hover details."
        >
          <div className="overflow-x-auto">
            <CommitGraph data={commitData} color="frost-2" />
          </div>
        </ShowcaseRow>

        <ShowcaseRow
          id="file-tree"
          name="file tree"
          source="jal-co/ui"
          description="Keyboard-accessible collapsible tree."
        >
          <FileTree
            nodes={FAKE_FILES}
            defaultExpanded={["src", "src/components", "src/components/ui"]}
            onSelect={() => {}}
            className="max-w-[320px]"
          />
        </ShowcaseRow>

        <ShowcaseRow
          id="terminal-autocomplete"
          name="terminal autocomplete"
          source="smui"
          description="Terminal-style input with inline FloatingCompletion — zsh-autosuggestions energy. Press tab to open, arrow keys to navigate, enter to pick."
        >
          <TerminalAutocompleteDemo />
        </ShowcaseRow>

        <ShowcaseRow
          id="status-rail"
          name="status rail"
          source="smui"
          description="Sticky bottom rail for global status + live dictation. Click the mic to stream SpeechRecognition transcripts; the waveform is driven by the actual microphone via AudioContext + AnalyserNode. Rendered here with position=&quot;static&quot;; ship as the default position=&quot;fixed&quot; at the root layout."
        >
          <div className="bg-[hsl(var(--smui-surface-0))] border border-border min-h-[120px] flex flex-col justify-end">
            <div className="flex-1 p-3 text-label text-muted-foreground tracking-wider">
              page content here — the rail anchors to the bottom
            </div>
            <StatusRail position="static">
              <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                <span className="inline-block w-[5px] h-[5px] rounded-full bg-[hsl(var(--smui-green))]" />
                connected
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">
                agent / bridge-01
              </span>
            </StatusRail>
          </div>
          <div className="text-label text-muted-foreground tracking-wider mt-2">
            requires https (or localhost) for microphone + webkit SpeechRecognition
          </div>
        </ShowcaseRow>

        <ShowcaseRow
          id="chat"
          name="chat + chatinput"
          source="prompt-kit inspired"
          description="Role-tagged messages with copy affordance, streaming cursor, model picker, and auto-grow input."
        >
          <div className="h-[420px]">
            <Chat>
              <ChatMessages>
                {messages.map((m) => (
                  <ChatMessage
                    key={m.id}
                    role={m.role}
                    content={m.content}
                    streaming={m.streaming}
                  />
                ))}
              </ChatMessages>
              <ChatInput
                value={chatInput}
                onValueChange={setChatInput}
                onSubmit={onSendMessage}
                busy={busy}
                models={MODELS}
                model={chatModel}
                onModelChange={setChatModel}
                placeholder="Ask the bridge crew anything…"
              />
            </Chat>
          </div>
        </ShowcaseRow>
      </section>

      <div className="accent-line" />
      <footer className="relative noise py-8 text-center text-xs text-muted-foreground tracking-wider">
        <div className="relative z-10">
          smui // spacemolt interface system
        </div>
      </footer>
    </main>
  )
}
