"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ── Log message templates ────────────────────────────────────

type Severity = "info" | "warn" | "error" | "ok" | "sys";

interface LogEntry {
  time: string;
  severity: Severity;
  tag: string;
  message: string;
}

const MESSAGES: { severity: Severity; tag: string; message: string }[] = [
  { severity: "info", tag: "NAV", message: "Course correction applied: delta-v +0.03 m/s" },
  { severity: "info", tag: "NAV", message: "Waypoint ALPHA-7 reached, adjusting heading" },
  { severity: "ok", tag: "SYS", message: "All subsystems reporting nominal" },
  { severity: "warn", tag: "ENG", message: "Coolant pressure fluctuation in sector 3" },
  { severity: "info", tag: "COMM", message: "Encrypted burst received from Station Helix" },
  { severity: "error", tag: "WPN", message: "Railgun capacitor bank B offline" },
  { severity: "ok", tag: "HULL", message: "Micro-fracture repair complete, bay 4" },
  { severity: "info", tag: "SCAN", message: "Deep scan initiated, radius 200 AU" },
  { severity: "warn", tag: "FUEL", message: "Reserve tank transfer rate below threshold" },
  { severity: "sys", tag: "CORE", message: "Garbage collection: freed 47.2 MB" },
  { severity: "info", tag: "DOCK", message: "Proximity alert: cargo shuttle inbound" },
  { severity: "ok", tag: "SHLD", message: "Shield matrix recalibrated to 98.7% efficiency" },
  { severity: "error", tag: "SENS", message: "Sensor array gamma: intermittent dropout" },
  { severity: "warn", tag: "LIFE", message: "O2 recycler efficiency at 91%, service due" },
  { severity: "info", tag: "NAV", message: "Jump coordinates locked: Nexus Prime" },
  { severity: "sys", tag: "NET", message: "Mesh network latency: 12ms avg" },
  { severity: "ok", tag: "PWR", message: "Solar array output: 4.2 GW, nominal" },
  { severity: "info", tag: "CARGO", message: "Manifest updated: +450 units palladium ore" },
  { severity: "warn", tag: "ENG", message: "Harmonic vibration detected in drive coupling" },
  { severity: "error", tag: "SEC", message: "Unauthorized access attempt: airlock 7" },
  { severity: "ok", tag: "COMM", message: "Subspace relay link established" },
  { severity: "sys", tag: "CORE", message: "Firmware update queued: nav-subsys v3.2.2" },
  { severity: "info", tag: "SCAN", message: "Anomaly detected at bearing 042 mark 7" },
  { severity: "warn", tag: "SHLD", message: "Port shield generator thermal warning" },
];

const SEVERITY_COLORS: Record<Severity, string> = {
  info: "text-[hsl(var(--smui-cyan))]",
  warn: "text-[hsl(var(--smui-amber))]",
  error: "text-[hsl(var(--smui-crimson))]",
  ok: "text-[hsl(var(--smui-terminal))]",
  sys: "text-[hsl(var(--smui-magenta))]",
};

const TAG_COLORS: Record<Severity, string> = {
  info: "text-[hsl(var(--smui-cyan))]",
  warn: "text-[hsl(var(--smui-amber))]",
  error: "text-[hsl(var(--smui-crimson))]",
  ok: "text-[hsl(var(--smui-terminal))]",
  sys: "text-[hsl(var(--smui-magenta))]",
};

function getTimestamp(): string {
  const now = new Date();
  return (
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0") +
    ":" +
    String(now.getSeconds()).padStart(2, "0")
  );
}

// ── LiveLog component ────────────────────────────────────────

export function LiveLog({ maxLines = 12 }: { maxLines?: number }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(Math.floor(Math.random() * MESSAGES.length));

  // Seed initial entries
  useEffect(() => {
    const initial: LogEntry[] = [];
    for (let i = 0; i < 6; i++) {
      const msg = MESSAGES[(indexRef.current + i) % MESSAGES.length];
      initial.push({ time: getTimestamp(), ...msg });
    }
    indexRef.current += 6;
    setEntries(initial);
  }, []);

  // Stream new log entries
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = MESSAGES[indexRef.current % MESSAGES.length];
      indexRef.current++;
      setEntries((prev) => {
        const next = [...prev, { time: getTimestamp(), ...msg }];
        return next.slice(-maxLines);
      });
    }, 1500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [maxLines]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
        <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
          system log
        </CardTitle>
        <CardDescription className="text-xs flex items-center gap-1">
          <span className="inline-block w-[5px] h-[5px] rounded-full bg-[hsl(var(--smui-terminal))] animate-pulse" />
          streaming
        </CardDescription>
      </CardHeader>
      <div
        ref={scrollRef}
        className="px-3.5 pb-3 overflow-y-auto font-mono"
        style={{ maxHeight: `${maxLines * 20 + 8}px` }}
      >
        {entries.map((entry, i) => (
          <div
            key={`${entry.time}-${i}`}
            className="flex gap-2 text-xs leading-5 whitespace-nowrap"
          >
            <span className="text-muted-foreground tabular-nums shrink-0">
              [{entry.time}]
            </span>
            <span
              className={`uppercase font-semibold w-[36px] shrink-0 ${SEVERITY_COLORS[entry.severity]}`}
            >
              {entry.severity === "error"
                ? "ERR"
                : entry.severity.toUpperCase()}
            </span>
            <span
              className={`w-[44px] shrink-0 ${TAG_COLORS[entry.severity]}`}
            >
              [{entry.tag}]
            </span>
            <span className="text-foreground/80 truncate">
              {entry.message}
            </span>
          </div>
        ))}
        <div className="text-xs text-muted-foreground mt-1">
          <span className="cursor-blink">_</span>
        </div>
      </div>
    </Card>
  );
}
