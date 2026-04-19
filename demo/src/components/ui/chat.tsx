"use client"

import * as React from "react"
import { Copy, Check, ArrowUp, ChevronDown, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ChatRole = "user" | "assistant" | "system"

export interface ChatMessageData {
  id: string
  role: ChatRole
  content: string
  /** Optional timestamp (ISO) */
  createdAt?: string
  /** If true, show a pulsing cursor (assistant is streaming) */
  streaming?: boolean
}

/* ------------------------------------------------------------------ */
/*  Chat container                                                     */
/* ------------------------------------------------------------------ */

type ChatProps = React.ComponentProps<"div">

function Chat({ className, children, ...props }: ChatProps) {
  return (
    <div
      data-slot="chat"
      className={cn(
        "flex flex-col h-full bg-background border border-border overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ChatMessages scroll region                                         */
/* ------------------------------------------------------------------ */

interface ChatMessagesProps extends React.ComponentProps<"div"> {
  /** Auto-scroll to bottom when new messages arrive (default true) */
  autoScroll?: boolean
}

function ChatMessages({
  className,
  children,
  autoScroll = true,
  ...props
}: ChatMessagesProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!autoScroll) return
    const el = ref.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [children, autoScroll])

  return (
    <div
      ref={ref}
      data-slot="chat-messages"
      className={cn("flex-1 overflow-y-auto px-4 py-3 space-y-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Individual message bubble                                          */
/* ------------------------------------------------------------------ */

interface ChatMessageProps extends Omit<React.ComponentProps<"div">, "content"> {
  role: ChatRole
  content: string
  streaming?: boolean
  /** Hide the copy button (default false) */
  hideCopy?: boolean
}

function ChatMessage({
  role,
  content,
  streaming,
  hideCopy,
  className,
  ...props
}: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  const isUser = role === "user"

  return (
    <div
      data-slot="chat-message"
      data-role={role}
      className={cn(
        "group/msg flex gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "shrink-0 w-6 h-6 flex items-center justify-center border",
          isUser
            ? "border-border bg-secondary text-muted-foreground"
            : "border-[hsl(var(--smui-frost-2)/0.35)] bg-[hsl(var(--smui-frost-2)/0.08)] text-[hsl(var(--smui-frost-2))]"
        )}
      >
        {isUser ? (
          <User className="w-3 h-3" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
      </div>

      <div
        className={cn(
          "min-w-0 max-w-[80%] flex flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-3 py-2 text-ui leading-snug whitespace-pre-wrap break-words border",
            isUser
              ? "bg-secondary text-foreground border-border"
              : "bg-card text-foreground border-border"
          )}
        >
          {content}
          {streaming && (
            <span className="cursor-blink ml-0.5 text-[hsl(var(--smui-frost-2))]">
              _
            </span>
          )}
        </div>
        {!hideCopy && !streaming && (
          <button
            type="button"
            onClick={onCopy}
            className={cn(
              "text-label text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 focus:opacity-100 cursor-pointer"
            )}
            aria-label={copied ? "Copied" : "Copy message"}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[hsl(var(--smui-green))]" />
                copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ChatInput footer                                                   */
/* ------------------------------------------------------------------ */

export interface ChatModel {
  id: string
  label: string
  /** Optional short tag (e.g. "fast") */
  tag?: string
}

interface ChatInputProps
  extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  value: string
  onValueChange: (value: string) => void
  onSubmit: (value: string) => void
  /** Disable send (e.g. while response is streaming) */
  busy?: boolean
  /** Placeholder */
  placeholder?: string
  /** Available models for the dropdown */
  models?: ChatModel[]
  /** Currently-selected model id */
  model?: string
  onModelChange?: (id: string) => void
}

function ChatInput({
  value,
  onValueChange,
  onSubmit,
  busy = false,
  placeholder = "Send a message…",
  models,
  model,
  onModelChange,
  className,
  ...props
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close model menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [menuOpen])

  // Auto-grow textarea up to a max height
  React.useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px"
  }, [value])

  const canSend = value.trim().length > 0 && !busy

  const submit = () => {
    if (!canSend) return
    const trimmed = value.trim()
    onSubmit(trimmed)
    onValueChange("")
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const activeModel = models?.find((m) => m.id === model) ?? models?.[0]

  return (
    <form
      data-slot="chat-input"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className={cn(
        "flex flex-col gap-2 border-t border-border bg-card px-3 py-2.5",
        className
      )}
      {...props}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "w-full resize-none bg-transparent text-ui text-foreground outline-none",
          "placeholder:text-muted-foreground leading-snug max-h-[160px]"
        )}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="relative" ref={menuRef}>
          {models && models.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 text-label tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 border border-border cursor-pointer"
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--smui-green))]" />
                {activeModel?.label ?? "model"}
                {activeModel?.tag && (
                  <span className="text-[hsl(var(--smui-frost-2))]">
                    {activeModel.tag}
                  </span>
                )}
                <ChevronDown className="w-3 h-3" />
              </button>
              {menuOpen && (
                <ul
                  role="listbox"
                  className="absolute bottom-full left-0 mb-1 bg-card border border-border min-w-[200px] z-10 py-1"
                >
                  {models.map((m) => (
                    <li
                      key={m.id}
                      role="option"
                      aria-selected={m.id === model}
                      onClick={() => {
                        onModelChange?.(m.id)
                        setMenuOpen(false)
                      }}
                      className={cn(
                        "flex items-center justify-between gap-2 px-2.5 py-1.5 text-ui cursor-pointer hover:bg-accent transition-colors",
                        m.id === model && "text-primary"
                      )}
                    >
                      <span>{m.label}</span>
                      {m.tag && (
                        <span className="text-label text-muted-foreground tracking-wider uppercase">
                          {m.tag}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "flex items-center justify-center w-7 h-7 transition-colors",
            canSend
              ? "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  )
}

export { Chat, ChatMessages, ChatMessage, ChatInput }
export type {
  ChatProps,
  ChatMessagesProps,
  ChatMessageProps,
  ChatInputProps,
}
