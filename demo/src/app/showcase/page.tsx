"use client"

import * as React from "react"
import Link from "next/link"
import { AccentPicker } from "@/components/accent-picker"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ThemePresetSwitcher } from "@/components/theme-preset-switcher"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
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

const SCRIPTED_ASSISTANT_REPLIES: string[] = [
  "Routing that through the primary subsystem. I'll keep you posted as I work.",
  "Got it — I've queued that up. Anything else you'd like checked while I'm here?",
  "Here's what I'd recommend: start with a small iteration, verify, then expand.",
  "Interesting. I've got three ways to approach that, but the simplest is probably best.",
]

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ShowcasePage() {
  /* Animated numbers */
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500)
    return () => clearInterval(id)
  }, [])
  const animatedValue = 42_000 + Math.round(Math.sin(tick) * 1200) + tick * 17
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
          Every newly-added component, one per line, styled with SMUI tokens.
        </p>

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
