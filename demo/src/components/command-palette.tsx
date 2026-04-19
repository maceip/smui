"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Compass,
  LayoutDashboard,
  Component,
  Terminal as TerminalIcon,
  Github,
  Sun,
  Moon,
  Copy,
  Palette,
} from "lucide-react";

const OPEN_EVENT = "smui:open-command-palette";

/** Dispatch to open the palette from anywhere (e.g. a nav "search" button). */
export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_EVENT));
  }
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  // Global ⌘K / Ctrl+K listener + event-bus listener.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  const run = (fn: () => void) => () => {
    setOpen(false);
    // Let the dialog close animation settle before navigating so the
    // destination page doesn't inherit the scroll-locked body.
    setTimeout(fn, 0);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search for a command to run"
    >
      <CommandInput placeholder="type a command..." />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        <CommandGroup heading="navigation">
          <CommandItem onSelect={run(() => router.push("/"))}>
            <Compass className="w-3.5 h-3.5" />
            <span>overview</span>
            <CommandShortcut>g h</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(() => router.push("/dashboard"))}>
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>dashboard</span>
            <CommandShortcut>g d</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(() => router.push("/showcase"))}>
            <Component className="w-3.5 h-3.5" />
            <span>showcase</span>
            <CommandShortcut>g s</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={run(() => router.push("/test-terminal"))}>
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>terminal test bed</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="theme">
          <CommandItem
            onSelect={run(() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark"),
            )}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
            <span>
              switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
            </span>
          </CommandItem>
          <CommandItem
            onSelect={run(() => {
              // Scroll the accent picker into view — it's sticky at the top
              // of the landing + dashboard + showcase pages.
              document
                .querySelector("[data-slot='accent-picker']")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            })}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>focus accent picker</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="actions">
          <CommandItem
            onSelect={run(() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            })}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>copy current URL</span>
          </CommandItem>
          <CommandItem
            onSelect={run(() =>
              window.open(
                "https://github.com/statico/smui",
                "_blank",
                "noopener,noreferrer",
              ),
            )}
          >
            <Github className="w-3.5 h-3.5" />
            <span>open on github</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
