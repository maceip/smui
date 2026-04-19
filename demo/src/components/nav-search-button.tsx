"use client";

import { openCommandPalette } from "@/components/command-palette";

/**
 * The "search..." button in the top nav. Clicking it opens the global
 * command palette. Exists as its own client component so it can live in a
 * server-component page like /.
 */
export function NavSearchButton({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className={
        className ??
        "text-xs text-muted-foreground px-2.5 py-1 bg-background border border-border flex items-center justify-between gap-2 min-w-[170px] hover:text-foreground hover:border-[hsl(var(--smui-border-hover))] transition-colors cursor-pointer"
      }
    >
      <span>search...</span>
      <kbd className="text-label text-muted-foreground border border-border px-1 bg-card">
        ctrl+k
      </kbd>
    </button>
  );
}
