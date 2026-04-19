"use client"

import * as React from "react"
import { Mic } from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Web Speech + Audio types — neither is in lib.dom.d.ts              */
/* ------------------------------------------------------------------ */

interface SpeechAlternative {
  transcript: string
  confidence: number
}
interface SpeechRecognitionResult extends ArrayLike<SpeechAlternative> {
  isFinal: boolean
}
interface SpeechRecognitionResultList
  extends ArrayLike<SpeechRecognitionResult> {}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionErrorEventLike {
  error: string
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface StatusRailProps extends React.ComponentProps<"div"> {
  /** Show the mic + live dictation control. Default true. */
  voice?: boolean
  /** Speech recognition language. Default "en-US". */
  lang?: string
  /** Called with every FINAL transcript chunk. */
  onTranscript?: (text: string) => void
  /** Positioning mode. `fixed` (bottom of viewport, default), `sticky`,
   *  or `static` — useful for embedding the rail inline in a page or
   *  demoing it in a showcase card. */
  position?: "fixed" | "sticky" | "static"
}

/* ------------------------------------------------------------------ */
/*  Audio waveform — reacts to the real microphone input               */
/* ------------------------------------------------------------------ */

function useAudioWaveform(active: boolean) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current
    if (!canvas) return
    const ctx2d = canvas.getContext("2d")
    if (!ctx2d) return
    // Capture a non-null local so TS doesn't re-widen across async boundaries.
    const c = canvas

    // When inactive, draw a flat baseline and bail.
    if (!active) {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.width
      const h = canvas.height
      ctx2d.clearRect(0, 0, w, h)
      ctx2d.strokeStyle = "hsl(var(--border))"
      ctx2d.lineWidth = dpr
      ctx2d.beginPath()
      ctx2d.moveTo(0, h / 2)
      ctx2d.lineTo(w, h / 2)
      ctx2d.stroke()
      return
    }

    // Capture non-null ctx in a local — TS can't narrow through async gaps.
    const ctx = ctx2d
    let stream: MediaStream | null = null
    let audioCtx: AudioContext | null = null
    let raf = 0
    let disposed = false

    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        return
      }
      if (disposed) {
        stream?.getTracks().forEach((t) => t.stop())
        return
      }
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return
      audioCtx = new Ctor()
      const source = audioCtx.createMediaStreamSource(stream!)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.7
      source.connect(analyser)

      const bufLen = analyser.fftSize
      const data = new Uint8Array(bufLen)

      const draw = () => {
        if (disposed) return
        analyser.getByteTimeDomainData(data)

        const w = c.width
        const h = c.height
        ctx.clearRect(0, 0, w, h)

        const stroke =
          getComputedStyle(c)
            .getPropertyValue("--status-rail-stroke")
            .trim() || "hsl(193 44% 67%)"
        ctx.strokeStyle = stroke
        ctx.lineWidth = 1
        ctx.beginPath()

        const sliceWidth = w / bufLen
        let x = 0
        for (let i = 0; i < bufLen; i++) {
          const v = data[i] / 128 - 1 // -1..1
          const y = h / 2 + v * (h / 2 - 1)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
          x += sliceWidth
        }
        ctx.stroke()

        raf = requestAnimationFrame(draw)
      }
      draw()
    }
    init()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
      audioCtx?.close().catch(() => {})
    }
  }, [active])

  return canvasRef
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function StatusRail({
  voice = true,
  lang = "en-US",
  onTranscript,
  position = "fixed",
  className,
  children,
  style,
  ...props
}: StatusRailProps) {
  const [supported, setSupported] = React.useState<boolean | null>(null)
  const [listening, setListening] = React.useState(false)
  const [finalText, setFinalText] = React.useState("")
  const [interimText, setInterimText] = React.useState("")
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null)
  const canvasRef = useAudioWaveform(listening)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const W = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    setSupported(!!(W.SpeechRecognition || W.webkitSpeechRecognition))
  }, [])

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }, [])

  const start = React.useCallback(() => {
    if (typeof window === "undefined") return
    const W = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (event) => {
      let final = ""
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ""
        if (result.isFinal) final += text
        else interim += text
      }
      if (final) {
        setFinalText((prev) => (prev + " " + final).trim())
        setInterimText("")
        onTranscript?.(final.trim())
      } else {
        setInterimText(interim)
      }
    }
    rec.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }
    rec.onerror = () => {
      setListening(false)
      recognitionRef.current = null
    }
    try {
      rec.start()
      recognitionRef.current = rec
      setListening(true)
    } catch {
      // start() throws if already running — swallow and stay idle.
    }
  }, [lang, onTranscript])

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  const toggle = () => (listening ? stop() : start())

  const liveText = interimText || finalText

  const positionClass =
    position === "fixed"
      ? "fixed bottom-0 inset-x-0 z-40"
      : position === "sticky"
        ? "sticky bottom-0 z-40"
        : "relative"

  return (
    <div
      data-slot="status-rail"
      data-listening={listening || undefined}
      className={cn(
        positionClass,
        "flex items-center gap-3 h-8 px-3 bg-card border-t border-border",
        "text-label text-muted-foreground tracking-wider uppercase",
        "overflow-hidden",
        className,
      )}
      style={
        {
          ...style,
          "--status-rail-stroke": "hsl(var(--smui-frost-2))",
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Left slot — consumers put breadcrumbs, connection status, etc. */}
      {children}

      {/* Right cluster */}
      <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
        {listening && (
          <span className="inline-flex items-center gap-1 text-[hsl(var(--smui-crimson))] normal-case tracking-normal">
            <span className="inline-block w-[5px] h-[5px] rounded-full bg-[hsl(var(--smui-crimson))] animate-pulse" />
            rec
          </span>
        )}

        {liveText && (
          <span
            className={cn(
              "truncate max-w-[50vw] normal-case tracking-normal",
              interimText ? "text-foreground/70 italic" : "text-foreground",
            )}
            title={liveText}
          >
            {liveText}
          </span>
        )}

        {voice && supported !== false && (
          <>
            <canvas
              ref={canvasRef}
              width={72}
              height={16}
              className={cn(
                "h-4 w-[72px] transition-opacity duration-200",
                listening ? "opacity-100" : "opacity-30",
              )}
              aria-hidden
            />
            <button
              type="button"
              onClick={toggle}
              disabled={supported === null}
              aria-label={
                listening ? "Stop dictation" : "Start dictation"
              }
              aria-pressed={listening}
              className={cn(
                "flex items-center justify-center w-7 h-7 border transition-colors cursor-pointer shrink-0",
                listening
                  ? "border-[hsl(var(--smui-frost-2))] text-[hsl(var(--smui-frost-2))] bg-[hsl(var(--smui-frost-2)/0.08)]"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-[hsl(var(--smui-border-hover))]",
              )}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {voice && supported === false && (
          <span className="text-muted-foreground/70 italic normal-case tracking-normal">
            voice unavailable
          </span>
        )}
      </div>
    </div>
  )
}

export { StatusRail }
export type { StatusRailProps }
