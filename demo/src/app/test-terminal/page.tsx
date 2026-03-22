"use client"

import { PaneGroup, Pane, PaneHandle } from "@/components/ui/resizable-panes"
import { Terminal } from "@/components/ui/terminal"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function TestTerminalPage() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-ui font-medium text-muted-foreground">
          smui // terminal panes test
        </span>
        <ThemeSwitcher />
      </div>

      {/* Main split: sidebar + vertical terminal split */}
      <div className="flex-1 min-h-0">
        <PaneGroup direction="horizontal" persistKey="test-terminal">
          {/* Left sidebar pane */}
          <Pane defaultSize={20} minSize={10} collapsible collapsedSize={0}>
            <div className="h-full p-4 bg-card text-card-foreground">
              <h2 className="text-ui font-semibold mb-3">Files</h2>
              <ul className="space-y-1 text-label text-muted-foreground">
                {["src/main.rs", "Cargo.toml", "README.md", ".gitignore", "src/lib.rs"].map(
                  (f) => (
                    <li
                      key={f}
                      className="px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                    >
                      {f}
                    </li>
                  )
                )}
              </ul>
            </div>
          </Pane>

          <PaneHandle />

          {/* Right: two terminals stacked vertically */}
          <Pane defaultSize={80}>
            <PaneGroup direction="vertical">
              <Pane defaultSize={60} minSize={20}>
                <Terminal
                  onReady={(t) => {
                    t.writeln("\x1b[1;36m┌──────────────────────────────────┐\x1b[0m")
                    t.writeln("\x1b[1;36m│\x1b[0m  smui terminal \x1b[32m●\x1b[0m ready          \x1b[1;36m│\x1b[0m")
                    t.writeln("\x1b[1;36m└──────────────────────────────────┘\x1b[0m")
                    t.writeln("")
                    t.writeln("\x1b[90mThis terminal uses SMUI theme tokens.\x1b[0m")
                    t.writeln("\x1b[90mTry switching dark/light mode ↗\x1b[0m")
                    t.writeln("")
                    t.writeln(
                      "\x1b[31mred\x1b[0m \x1b[32mgreen\x1b[0m \x1b[33myellow\x1b[0m \x1b[34mblue\x1b[0m \x1b[35mmagenta\x1b[0m \x1b[36mcyan\x1b[0m"
                    )
                    t.writeln(
                      "\x1b[91mbright-red\x1b[0m \x1b[92mbright-green\x1b[0m \x1b[93mbright-yellow\x1b[0m \x1b[94mbright-blue\x1b[0m \x1b[95mbright-magenta\x1b[0m \x1b[96mbright-cyan\x1b[0m"
                    )
                    t.writeln("")
                    t.write("\x1b[32m$\x1b[0m ")
                    // Echo input back
                    t.onData((data: string) => {
                      if (data === "\r") {
                        t.writeln("")
                        t.write("\x1b[32m$\x1b[0m ")
                      } else if (data === "\x7f") {
                        t.write("\b \b")
                      } else {
                        t.write(data)
                      }
                    })
                  }}
                />
              </Pane>

              <PaneHandle />

              <Pane defaultSize={40} minSize={15} collapsible collapsedSize={0}>
                <Terminal
                  fontSize={11}
                  cursorStyle="underline"
                  onReady={(t) => {
                    t.writeln("\x1b[90m── logs ──\x1b[0m")
                    let i = 0
                    const msgs = [
                      "\x1b[36m[INFO]\x1b[0m  Compiling spacemolt v0.1.0",
                      "\x1b[36m[INFO]\x1b[0m  Checking dependencies...",
                      "\x1b[33m[WARN]\x1b[0m  Unused import: std::io",
                      "\x1b[36m[INFO]\x1b[0m  Running 12 tests",
                      "\x1b[32m[ OK ]\x1b[0m  All tests passed",
                      "\x1b[36m[INFO]\x1b[0m  Build complete in 1.2s",
                    ]
                    const interval = setInterval(() => {
                      if (i < msgs.length) {
                        t.writeln(msgs[i++])
                      } else {
                        clearInterval(interval)
                        t.writeln("")
                        t.writeln("\x1b[32m✓\x1b[0m Done.")
                      }
                    }, 600)
                  }}
                />
              </Pane>
            </PaneGroup>
          </Pane>
        </PaneGroup>
      </div>
    </div>
  )
}
