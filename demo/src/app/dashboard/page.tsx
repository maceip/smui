"use client"

import Link from "next/link";
import { AccentPicker } from "@/components/accent-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  FloatingCompletion,
  type CompletionItem,
} from "@/components/ui/floating-completion";
import { PaneGroup, Pane, PaneHandle } from "@/components/ui/resizable-panes";
import { Gauge } from "@/components/ui/gauge";
import { Sparkline } from "@/components/ui/sparkline";
import { Terminal } from "@/components/ui/terminal";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useDialKit } from "dialkit";
import {
  Compass,
  Crosshair,
  Wrench,
  Package,
  MessageSquare,
  Users,
  Settings,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useState, useCallback } from "react";

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
          href="/"
          className="text-xs text-muted-foreground uppercase tracking-wider px-2.5 py-1.5 hover:text-foreground transition-colors"
        >
          components
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-primary uppercase tracking-wider px-2.5 py-1.5"
        >
          dashboard
        </Link>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="text-xs text-muted-foreground px-2.5 py-1 bg-background border border-border flex items-center justify-between min-w-[180px]">
          <span>search...</span>
          <kbd className="text-label text-muted-foreground border border-border px-1 bg-card">
            ctrl+k
          </kbd>
        </div>
        <ThemeSwitcher />
        <span className="text-xs text-muted-foreground">v1.0.0</span>
      </div>
    </nav>
  );
}

const SIDE_NAV = [
  { icon: LayoutDashboard, label: "overview", active: true },
  { icon: Compass, label: "navigation", active: false },
  { icon: Crosshair, label: "weapons", active: false },
  { icon: Wrench, label: "engineering", active: false },
  { icon: Package, label: "cargo hold", active: false },
  { icon: MessageSquare, label: "comms", active: false },
  { icon: Users, label: "crew", active: false },
  { icon: Settings, label: "settings", active: false },
];

const CARGO = [
  {
    item: "Palladium Ore",
    type: "ore",
    qty: 450,
    unit: "127 cr",
    total: "57,150 cr",
  },
  {
    item: "Plasma Coil MkII",
    type: "wpn",
    qty: 2,
    unit: "18,500 cr",
    total: "37,000 cr",
  },
  {
    item: "Flux Capacitor",
    type: "mod",
    qty: 6,
    unit: "3,200 cr",
    total: "19,200 cr",
  },
  {
    item: "Refined Titanium",
    type: "ref",
    qty: 800,
    unit: "84 cr",
    total: "67,200 cr",
  },
  {
    item: "Shield Emitter",
    type: "mod",
    qty: 4,
    unit: "8,900 cr",
    total: "35,600 cr",
  },
];

const BAR_DATA = [
  { label: "01", height: 45, alt: false },
  { label: "02", height: 62, alt: false },
  { label: "03", height: 38, alt: false },
  { label: "04", height: 80, alt: true },
  { label: "05", height: 55, alt: false },
  { label: "06", height: 70, alt: false },
  { label: "07", height: 48, alt: true },
  { label: "08", height: 90, alt: false },
  { label: "09", height: 65, alt: false },
  { label: "10", height: 78, alt: false },
  { label: "11", height: 52, alt: true },
  { label: "12", height: 95, alt: false },
];

const COMPLETION_ITEMS: CompletionItem[] = [
  { name: "git commit", description: "record changes", icon: "⬡", color: "terminal" },
  { name: "git push", description: "update remote", icon: "⬡", color: "terminal" },
  { name: "git pull", description: "fetch & merge", icon: "⬡", color: "terminal" },
  { name: "git stash", description: "shelve changes", icon: "⬡", color: "terminal" },
  { name: "git branch", description: "list branches", icon: "⬡", color: "terminal" },
  { name: "git checkout", description: "switch branch", icon: "⬡", color: "amber" },
  { name: "git rebase", description: "reapply commits", icon: "⬡", color: "crimson" },
  { name: "git log", description: "show history", icon: "⬡", color: "cyan" },
  { name: "git diff", description: "show changes", icon: "⬡", color: "cyan" },
  { name: "git merge", description: "join branches", icon: "⬡", color: "amber" },
  { name: "git remote", description: "manage remotes", icon: "⬡", color: "indigo" },
  { name: "git tag", description: "create tag", icon: "⬡", color: "pink" },
  { name: "git cherry-pick", description: "apply commit", icon: "⬡", color: "magenta" },
  { name: "git reset", description: "unstage changes", icon: "⬡", color: "crimson" },
  { name: "git status", description: "working tree", icon: "⬡", color: "teal" },
  { name: "cargo build", description: "compile project", icon: "◆", color: "amber" },
  { name: "cargo test", description: "run tests", icon: "◆", color: "lime" },
  { name: "cargo run", description: "execute binary", icon: "◆", color: "lime" },
  { name: "docker build", description: "build image", icon: "◇", color: "cyan" },
  { name: "docker run", description: "create container", icon: "◇", color: "cyan" },
  { name: "npm install", description: "add packages", icon: "▪", color: "pink" },
  { name: "npm run dev", description: "start dev server", icon: "▪", color: "pink" },
];

/* ------------------------------------------------------------------ */
/*  Gauge + Sparkline demo with DialKit                                */
/* ------------------------------------------------------------------ */

const SPARK_DATA = [12, 18, 14, 22, 19, 28, 24, 32, 29, 38, 35, 42, 39, 45, 48, 44, 52, 49, 55];
const SPARK_BARS = [
  { value: 45 }, { value: 62 }, { value: 38 }, { value: 80, color: "amber" },
  { value: 55 }, { value: 70 }, { value: 48, color: "cyan" }, { value: 90 },
  { value: 65 }, { value: 78 }, { value: 52, color: "pink" }, { value: 95 },
];

function GaugeSparklineDemo() {
  const dial = useDialKit("Gauge & Sparkline", {
    gauge: {
      value: [72, 0, 100],
      sweep: [270, 90, 360],
      strokeWidth: [4, 1, 12],
      animated: true,
      showValue: true,
    },
    sparkline: {
      showEndDot: true,
      animated: true,
      variant: { type: "select" as const, options: ["line", "area", "bar"], default: "area" },
    },
  });

  return (
    <Card id="gauge-sparkline" className="card-glow scroll-mt-14">
      <CardHeader className="py-2.5 px-3.5">
        <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal flex items-center gap-2">
          component // gauge + sparkline
          <span className="text-label tracking-wider uppercase px-1.5 py-px border border-[hsl(var(--smui-frost-2)/0.35)] text-[hsl(var(--smui-frost-2))]">
            new
          </span>
        </CardTitle>
        <CardDescription className="text-xs">
          live-tweakable via DialKit panel (bottom-right)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-black/35 p-6">
          {/* Gauges row */}
          <div className="flex items-center gap-6 mb-6 flex-wrap">
            <Gauge
              value={dial.gauge.value as number}
              sweep={dial.gauge.sweep as number}
              strokeWidth={dial.gauge.strokeWidth as number}
              animated={dial.gauge.animated as boolean}
              showValue={dial.gauge.showValue as boolean}
              color="cyan"
              label="reactor"
              size="lg"
              thresholds={[
                { value: 30, color: "crimson", label: "low" },
                { value: 80, color: "amber", label: "high" },
              ]}
            />
            <Gauge
              value={91}
              color="terminal"
              label="shields"
              size="md"
              strokeWidth={dial.gauge.strokeWidth as number}
              sweep={dial.gauge.sweep as number}
              animated={dial.gauge.animated as boolean}
              showValue={dial.gauge.showValue as boolean}
            />
            <Gauge
              value={34}
              color="amber"
              label="fuel"
              size="md"
              strokeWidth={dial.gauge.strokeWidth as number}
              sweep={dial.gauge.sweep as number}
              animated={dial.gauge.animated as boolean}
              showValue={dial.gauge.showValue as boolean}
              thresholds={[{ value: 25, color: "crimson" }]}
            />
            <Gauge
              value={67}
              color="pink"
              label="cargo"
              size="sm"
              strokeWidth={dial.gauge.strokeWidth as number}
              sweep={dial.gauge.sweep as number}
              animated={dial.gauge.animated as boolean}
              showValue={dial.gauge.showValue as boolean}
            />
          </div>

          {/* Sparklines */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-label text-muted-foreground tracking-[1.5px] uppercase w-20">
                yield
              </span>
              <Sparkline
                data={SPARK_DATA}
                variant={(dial.sparkline.variant as "line" | "area" | "bar") || "area"}
                color="cyan"
                width={200}
                height={28}
                showEndDot={dial.sparkline.showEndDot as boolean}
                animated={dial.sparkline.animated as boolean}
                referenceLine={35}
                referenceColor="amber"
              />
              <span className="text-ui text-[hsl(var(--smui-green))]">+14.2%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-label text-muted-foreground tracking-[1.5px] uppercase w-20">
                power
              </span>
              <Sparkline
                data={SPARK_BARS}
                variant="bar"
                color="terminal"
                width={200}
                height={28}
                animated={dial.sparkline.animated as boolean}
              />
              <span className="text-ui text-[hsl(var(--smui-amber))]">78 MW</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-label text-muted-foreground tracking-[1.5px] uppercase w-20">
                comms
              </span>
              <Sparkline
                data={[5, 8, 3, 12, 7, 15, 9, 18, 11, 20, 14, 22]}
                variant="line"
                color="pink"
                width={200}
                height={28}
                showEndDot
                showRange
                animated={dial.sparkline.animated as boolean}
              />
              <span className="text-ui text-muted-foreground">22 msg/s</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Resizable Panes demo                                               */
/* ------------------------------------------------------------------ */

function ResizablePanesDemo() {
  const dial = useDialKit("Resizable Panes", {
    direction: { type: "select" as const, options: ["horizontal", "vertical"], default: "horizontal" },
    minSize: [10, 0, 40],
    collapsible: true,
  });

  const dir = (dial.direction as string) === "vertical" ? "vertical" : "horizontal" as const;

  return (
    <Card id="resizable-panes" className="card-glow scroll-mt-14">
      <CardHeader className="py-2.5 px-3.5">
        <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal flex items-center gap-2">
          component // resizable panes
          <span className="text-label tracking-wider uppercase px-1.5 py-px border border-[hsl(var(--smui-frost-2)/0.35)] text-[hsl(var(--smui-frost-2))]">
            new
          </span>
        </CardTitle>
        <CardDescription className="text-xs">
          drag handles to resize · double-click to collapse · keyboard accessible
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-black/35" style={{ height: 280 }}>
          <PaneGroup direction={dir} className="h-full">
            <Pane
              defaultSize={30}
              minSize={dial.minSize as number}
              collapsible={dial.collapsible as boolean}
              className="p-3"
            >
              <div className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-2">
                panel a
              </div>
              <div className="space-y-1.5 text-ui">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[hsl(var(--smui-green))]" />
                  reactor online
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[hsl(var(--smui-green))]" />
                  shields online
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[hsl(var(--smui-amber))]" />
                  weapons standby
                </div>
              </div>
            </Pane>
            <PaneHandle />
            <Pane defaultSize={45} minSize={dial.minSize as number} className="p-3">
              <div className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-2">
                panel b // main display
              </div>
              <div className="text-ui text-muted-foreground">
                <p>Drag the handle between panels to resize.</p>
                <p className="mt-1">Hold <kbd className="px-1 border border-border bg-background text-label">Shift</kbd> + arrow keys for 5% steps.</p>
                <p className="mt-1">Double-click handle to collapse adjacent panel.</p>
                <div className="mt-3 flex gap-2">
                  <Sparkline data={SPARK_DATA} variant="area" color="cyan" width={120} height={20} animated />
                  <Sparkline data={[8,12,6,14,10,16,12,18]} variant="line" color="terminal" width={120} height={20} showEndDot />
                </div>
              </div>
            </Pane>
            <PaneHandle />
            <Pane
              defaultSize={25}
              minSize={dial.minSize as number}
              collapsible={dial.collapsible as boolean}
              className="p-3"
            >
              <div className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-2">
                panel c
              </div>
              <Gauge value={72} color="cyan" size="sm" label="cpu" strokeWidth={3} />
            </Pane>
          </PaneGroup>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [completionQuery, setCompletionQuery] = useState("");
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionValue, setCompletionValue] = useState("");

  const handleCompletionSelect = useCallback((item: CompletionItem) => {
    setCompletionValue(item.name);
    setCompletionQuery(item.name);
    setCompletionOpen(false);
  }, []);

  const typeColors: Record<string, string> = {
    ore: "text-[hsl(var(--smui-yellow))] border-[hsl(var(--smui-yellow)/0.3)]",
    wpn: "text-[hsl(var(--smui-red))] border-[hsl(var(--smui-red)/0.3)]",
    mod: "text-[hsl(var(--smui-frost-3))] border-[hsl(var(--smui-frost-3)/0.3)]",
    ref: "text-[hsl(var(--smui-green))] border-[hsl(var(--smui-green)/0.3)]",
  };

  const NEW_FEATURES: {
    name: string;
    anchor: string;
    description: string;
  }[] = [
    {
      name: "Terminal",
      anchor: "terminal",
      description: "xterm.js bridge with SMUI theme tokens",
    },
    {
      name: "Popover",
      anchor: "popover",
      description: "Radix-backed popover primitive",
    },
    {
      name: "Resizable Panes",
      anchor: "resizable-panes",
      description: "drag, collapse, and persist layouts",
    },
    {
      name: "Gauge",
      anchor: "gauge-sparkline",
      description: "animated arc gauge with thresholds",
    },
    {
      name: "Sparkline",
      anchor: "gauge-sparkline",
      description: "line / area / bar micro-charts",
    },
    {
      name: "Floating Completion",
      anchor: "floating-completion",
      description: "fuzzy-filter autocomplete menu",
    },
  ];

  return (
    <main>
      <Nav />
      <AccentPicker />
      <div className="accent-line" />

      <section className="py-14 px-6 max-w-[1200px] mx-auto">
        <div className="text-xs text-muted-foreground tracking-[2px] uppercase mb-1.5">
          example // layout
        </div>
        <h2 className="text-heading font-medium text-foreground tracking-tight mb-1">
          bridge dashboard
        </h2>
        <p className="text-sm text-muted-foreground mb-7">
          Sidebar navigation, data readouts, tables, charts combined.
        </p>

        {/* What's new banner — also doubles as the Popover demo */}
        <div className="mb-3 flex flex-wrap items-center gap-2 px-3 py-2 bg-card border border-border">
          <span className="text-label text-muted-foreground tracking-[1.5px] uppercase shrink-0">
            what&apos;s new
          </span>
          <Separator
            orientation="vertical"
            className="h-3.5 bg-border hidden sm:inline-block"
          />
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {NEW_FEATURES.map((f) => (
              <a
                key={f.name}
                href={`#${f.anchor}`}
                className="text-label tracking-wider uppercase px-1.5 py-px border border-[hsl(var(--smui-frost-2)/0.35)] text-[hsl(var(--smui-frost-2))] hover:bg-[hsl(var(--smui-frost-2)/0.08)] transition-colors"
                title={f.description}
              >
                {f.name}
              </a>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                details
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="px-3 py-2 border-b border-border">
                <div className="text-label text-muted-foreground tracking-[1.5px] uppercase">
                  recently added
                </div>
              </div>
              <ul className="py-1">
                {NEW_FEATURES.map((f) => (
                  <li key={f.name}>
                    <a
                      href={`#${f.anchor}`}
                      className="flex items-baseline gap-2 px-3 py-1.5 text-ui hover:bg-accent transition-colors"
                    >
                      <span className="text-primary">{f.name}</span>
                      <span className="text-label text-muted-foreground">
                        — {f.description}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] items-start gap-2">
          {/* Sidebar */}
          <div className="flex flex-col gap-2">
            <Card className="card-glow">
              <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
                <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
                  iss erebus
                </CardTitle>
                <span className="inline-block w-[5px] h-[5px] rounded-full bg-[hsl(var(--smui-green))]" />
              </CardHeader>
              <div className="p-1">
                <nav className="flex flex-col">
                  {SIDE_NAV.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 text-ui py-[5px] px-2.5 cursor-pointer transition-colors ${
                        item.active
                          ? "text-primary bg-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon
                        className={`w-3.5 h-3.5 ${item.active ? "opacity-100" : "opacity-50"}`}
                      />
                      {item.label}
                    </div>
                  ))}
                </nav>
              </div>
            </Card>

            <Card className="card-glow">
              <CardHeader className="py-2.5 px-3.5">
                <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
                  location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-label text-muted-foreground tracking-[1.5px] uppercase block mb-1">
                    system
                  </span>
                  <div className="text-sm text-primary px-2 py-1.5 bg-background border border-border">
                    GAMMA DRACONIS
                  </div>
                </div>
                <div>
                  <span className="text-label text-muted-foreground tracking-[1.5px] uppercase block mb-1">
                    sector
                  </span>
                  <div className="text-sm px-2 py-1.5 bg-background border border-border">
                    7-ALPHA
                  </div>
                </div>
                <div>
                  <span className="text-label text-muted-foreground tracking-[1.5px] uppercase block mb-1">
                    coords
                  </span>
                  <div className="text-xs px-2 py-1.5 bg-background border border-border">
                    X:4281 Y:-1892 Z:0042
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-2">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Card className="hover:border-[hsl(var(--smui-border-hover))] transition-colors p-2.5 px-3">
                <span className="text-label text-muted-foreground tracking-[1.5px] uppercase block">
                  total credits
                </span>
                <div className="text-stat font-medium text-foreground tracking-tight">
                  1,247,830
                </div>
                <div className="text-xs text-[hsl(var(--smui-green))] mt-0.5">
                  +23,450 this cycle
                </div>
              </Card>
              <Card className="hover:border-[hsl(var(--smui-border-hover))] transition-colors p-2.5 px-3">
                <span className="text-label text-muted-foreground tracking-[1.5px] uppercase block">
                  kills // losses
                </span>
                <div className="text-stat font-medium text-foreground tracking-tight">
                  142 / 7
                </div>
                <div className="text-xs text-[hsl(var(--smui-green))] mt-0.5">
                  k/d ratio: 20.3
                </div>
              </Card>
              <Card className="hover:border-[hsl(var(--smui-border-hover))] transition-colors p-2.5 px-3">
                <span className="text-label text-muted-foreground tracking-[1.5px] uppercase block">
                  systems charted
                </span>
                <div className="text-stat font-medium text-foreground tracking-tight">
                  89
                </div>
                <div className="text-xs text-[hsl(var(--smui-green))] mt-0.5">
                  +4 this cycle
                </div>
              </Card>
            </div>

            {/* Bar chart */}
            <Card className="card-glow">
              <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
                <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
                  resource yield // 12 cycles
                </CardTitle>
                <CardDescription className="text-xs">
                  trend: positive
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <div className="flex items-end gap-1 h-[160px]">
                  {BAR_DATA.map((bar) => (
                    <div
                      key={bar.label}
                      className="flex-1 flex flex-col items-center gap-[3px] h-full justify-end"
                    >
                      <div
                        className={`w-full ${bar.alt ? "bg-[hsl(var(--smui-frost-4))]" : "bg-primary"} opacity-70`}
                        style={{ height: `${bar.height}%` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cargo table */}
            <Card className="card-glow">
              <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
                <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
                  cargo manifest
                </CardTitle>
                <CardDescription className="text-xs">
                  1,847 / 3,000 m3
                </CardDescription>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>item</TableHead>
                    <TableHead>type</TableHead>
                    <TableHead>qty</TableHead>
                    <TableHead>unit</TableHead>
                    <TableHead>total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CARGO.map((row) => (
                    <TableRow key={row.item}>
                      <TableCell>{row.item}</TableCell>
                      <TableCell>
                        <span
                          className={`text-label tracking-wider uppercase px-1.5 py-px border ${typeColors[row.type]}`}
                        >
                          {row.type}
                        </span>
                      </TableCell>
                      <TableCell>{row.qty}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell className="text-primary">
                        {row.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Dialog */}
            <Card className="card-glow">
              <CardHeader className="py-2.5 px-3.5">
                <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
                  component // dialog
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-black/35 p-4 flex items-center justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        open dialog
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="uppercase tracking-wider">
                          confirm jump
                        </DialogTitle>
                        <DialogDescription>
                          dest: nexus prime // est. 47 ticks
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        <label className="text-label text-muted-foreground tracking-[1.5px] uppercase block mb-1">
                          auth code
                        </label>
                        <Input type="password" defaultValue="xxxxxxxxxxxx" />
                        <Alert className="mt-2 border-[hsl(var(--smui-yellow)/0.25)] bg-[hsl(var(--smui-yellow)/0.04)] [&>svg]:text-[hsl(var(--smui-yellow))]">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Unpoliced territory. Proceed with caution.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" size="sm">
                          abort
                        </Button>
                        <Button size="sm">initiate jump</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Static preview of dialog */}
                  <div className="bg-card border border-border max-w-[280px] w-full ml-4">
                    <div className="px-3 py-2.5 border-b border-border">
                      <div className="text-sm font-medium text-foreground uppercase tracking-wider">
                        confirm jump
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        dest: nexus prime // est. 47 ticks
                      </div>
                    </div>
                    <div className="p-3">
                      <label className="text-label text-muted-foreground tracking-[1.5px] uppercase block mb-1">
                        auth code
                      </label>
                      <Input type="password" defaultValue="xxxxxxxxxxxx" />
                      <Alert className="mt-2 border-[hsl(var(--smui-yellow)/0.25)] bg-[hsl(var(--smui-yellow)/0.04)] [&>svg]:text-[hsl(var(--smui-yellow))]">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Unpoliced territory. Proceed with caution.
                        </AlertDescription>
                      </Alert>
                    </div>
                    <div className="px-3 py-2 border-t border-border flex gap-1 justify-end">
                      <Button variant="ghost" size="sm">
                        abort
                      </Button>
                      <Button size="sm">initiate jump</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Floating Completion */}
            <Card id="floating-completion" className="card-glow scroll-mt-14">
              <CardHeader className="py-2.5 px-3.5">
                <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal flex items-center gap-2">
                  component // floating completion
                  <span className="text-label tracking-wider uppercase px-1.5 py-px border border-[hsl(var(--smui-frost-2)/0.35)] text-[hsl(var(--smui-frost-2))]">
                    new
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  melon-style autocomplete — fuzzy filter, keyboard nav, collision-aware
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-black/35 p-6">
                  <div className="max-w-[400px]">
                    <label className="text-label text-muted-foreground tracking-[1.5px] uppercase block mb-1">
                      command
                    </label>
                    <FloatingCompletion
                      items={COMPLETION_ITEMS}
                      query={completionQuery}
                      open={completionOpen}
                      onSelect={handleCompletionSelect}
                      onDismiss={() => setCompletionOpen(false)}
                      maxVisible={8}
                      className="w-full"
                    >
                      <Input
                        value={completionValue}
                        placeholder="type a command... (try 'git', 'cargo', 'doc')"
                        onChange={(e) => {
                          setCompletionValue(e.target.value);
                          setCompletionQuery(e.target.value);
                          setCompletionOpen(e.target.value.length > 0);
                        }}
                        onFocus={() => {
                          if (completionValue.length > 0) setCompletionOpen(true);
                        }}
                      />
                    </FloatingCompletion>
                    <p className="text-label text-muted-foreground mt-2">
                      ↑↓ navigate · tab next · enter accept · esc dismiss · fuzzy matching highlights chars
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gauge + Sparkline + DialKit */}
            <GaugeSparklineDemo />

            {/* Resizable Panes */}
            <ResizablePanesDemo />

            {/* Terminal */}
            <Card id="terminal" className="card-glow scroll-mt-14">
              <CardHeader className="py-2.5 px-3.5">
                <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal flex items-center gap-2">
                  component // terminal
                  <span className="text-label tracking-wider uppercase px-1.5 py-px border border-[hsl(var(--smui-frost-2)/0.35)] text-[hsl(var(--smui-frost-2))]">
                    new
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  xterm.js wrapped with SMUI theme tokens · transparent background
                  · live theme sync
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-black/35" style={{ height: 240 }}>
                  <Terminal
                    onReady={(t) => {
                      t.writeln(
                        "\x1b[1;36m┌──────────────────────────────────┐\x1b[0m",
                      );
                      t.writeln(
                        "\x1b[1;36m│\x1b[0m  smui terminal \x1b[32m●\x1b[0m ready          \x1b[1;36m│\x1b[0m",
                      );
                      t.writeln(
                        "\x1b[1;36m└──────────────────────────────────┘\x1b[0m",
                      );
                      t.writeln("");
                      t.writeln(
                        "\x1b[90mSwitch light/dark — colors follow SMUI tokens.\x1b[0m",
                      );
                      t.writeln(
                        "\x1b[31mred\x1b[0m \x1b[32mgreen\x1b[0m \x1b[33myellow\x1b[0m \x1b[34mblue\x1b[0m \x1b[35mmagenta\x1b[0m \x1b[36mcyan\x1b[0m",
                      );
                      t.writeln("");
                      t.write("\x1b[32m$\x1b[0m ");
                      t.onData((data: string) => {
                        if (data === "\r") {
                          t.writeln("");
                          t.write("\x1b[32m$\x1b[0m ");
                        } else if (data === "\x7f") {
                          t.write("\b \b");
                        } else {
                          t.write(data);
                        }
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Popover */}
            <Card id="popover" className="card-glow scroll-mt-14">
              <CardHeader className="py-2.5 px-3.5">
                <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal flex items-center gap-2">
                  component // popover
                  <span className="text-label tracking-wider uppercase px-1.5 py-px border border-[hsl(var(--smui-frost-2)/0.35)] text-[hsl(var(--smui-frost-2))]">
                    new
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Radix-backed · portaled · collision-aware placement
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-black/35 p-6 flex items-center justify-center gap-3 flex-wrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        contact
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="text-label text-muted-foreground tracking-[1.5px] uppercase mb-2">
                        comms channel
                      </div>
                      <div className="space-y-1 text-ui">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">freq</span>
                          <span className="tabular-nums">142.8 MHz</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">signal</span>
                          <span className="text-[hsl(var(--smui-green))]">
                            strong
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">latency</span>
                          <span className="tabular-nums">12ms</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        ship status
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="flex items-center gap-3">
                        <Gauge value={72} color="cyan" size="sm" strokeWidth={3} />
                        <div>
                          <div className="text-label text-muted-foreground tracking-[1.5px] uppercase">
                            reactor
                          </div>
                          <Sparkline
                            data={SPARK_DATA}
                            variant="area"
                            color="cyan"
                            width={120}
                            height={20}
                            animated
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      <div className="accent-line" />
      <footer className="relative noise py-8 text-center text-xs text-muted-foreground tracking-wider">
        <div className="relative z-10">
          smui // spacemolt interface system // devteam
          <div className="flex justify-center gap-4 mt-2">
            <a
              href="https://github.com/statico/smui"
              className="hover:text-primary transition-colors"
            >
              github
            </a>
            <a
              href="https://smui.statico.io"
              className="hover:text-primary transition-colors"
            >
              smui.statico.io
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
