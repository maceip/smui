"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// ── Animated stat counter ────────────────────────────────────

function AnimatedStat({
  label,
  value,
  prefix = "",
  suffix = "",
  delta,
  deltaLabel,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <Card className="card-glow p-2.5 px-3">
      <span className="text-label text-muted-foreground tracking-[1.5px] uppercase block">
        {label}
      </span>
      <div className="text-stat font-medium text-foreground tracking-tight">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </div>
      {delta !== undefined && (
        <div
          className={`text-xs mt-0.5 ${delta >= 0 ? "text-[hsl(var(--smui-terminal))]" : "text-[hsl(var(--smui-crimson))]"}`}
        >
          {delta >= 0 ? "+" : ""}
          {delta.toLocaleString()} {deltaLabel}
        </div>
      )}
    </Card>
  );
}

// ── Live system readouts with drifting values ────────────────

interface ReadoutEntry {
  label: string;
  base: number;
  drift: number;
  variant: "default" | "warn" | "crit" | "ok";
}

const READOUTS: ReadoutEntry[] = [
  { label: "hull integrity", base: 94, drift: 2, variant: "default" },
  { label: "shield matrix", base: 71, drift: 8, variant: "warn" },
  { label: "reactor core", base: 28, drift: 5, variant: "crit" },
  { label: "fuel reserves", base: 82, drift: 3, variant: "ok" },
  { label: "cargo capacity", base: 56, drift: 4, variant: "default" },
];

const colorMap: Record<string, string> = {
  default: "",
  warn: "[&>div]:bg-[hsl(var(--smui-amber))]",
  crit: "[&>div]:bg-[hsl(var(--smui-crimson))]",
  ok: "[&>div]:bg-[hsl(var(--smui-terminal))]",
};

export function LiveSystemReadouts() {
  const [values, setValues] = useState(() =>
    READOUTS.map((r) => r.base)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => {
          const r = READOUTS[i];
          const delta = (Math.random() - 0.5) * r.drift;
          return Math.max(1, Math.min(100, Math.round(v + delta)));
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5">
        <CardTitle className="text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal">
          system readouts
        </CardTitle>
        <CardDescription className="text-xs flex items-center gap-1">
          <span className="inline-block w-[5px] h-[5px] rounded-full bg-[hsl(var(--smui-terminal))] animate-pulse" />
          live
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-[11px]">
        {READOUTS.map((r, i) => (
          <div key={r.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground tracking-[1.5px] uppercase">
                {r.label}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {values[i]}%
              </span>
            </div>
            <Progress value={values[i]} className={colorMap[r.variant]} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Live stats row ───────────────────────────────────────────

export function LiveStatsRow() {
  const [credits, setCredits] = useState(1247830);
  const [kills, setKills] = useState(142);
  const [systems, setSystems] = useState(89);
  const [creditDelta, setCreditDelta] = useState(23450);
  const [systemDelta, setSystemDelta] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      const gain = Math.floor(Math.random() * 800) + 100;
      setCredits((c) => c + gain);
      setCreditDelta((d) => d + gain);

      if (Math.random() < 0.15) {
        setKills((k) => k + 1);
      }
      if (Math.random() < 0.08) {
        setSystems((s) => s + 1);
        setSystemDelta((d) => d + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <AnimatedStat
        label="total credits"
        value={credits}
        delta={creditDelta}
        deltaLabel="this cycle"
      />
      <AnimatedStat
        label="kills // losses"
        value={kills}
        suffix=" / 7"
        delta={Number((kills / 7).toFixed(1))}
        deltaLabel="k/d ratio"
      />
      <AnimatedStat
        label="systems charted"
        value={systems}
        delta={systemDelta}
        deltaLabel="this cycle"
      />
    </div>
  );
}

// ── Live clock ───────────────────────────────────────────────

export function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC")
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-xs text-muted-foreground tabular-nums tracking-wider">
      {time}
    </span>
  );
}
