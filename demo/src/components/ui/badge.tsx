import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border border-transparent px-[5px] py-px text-label font-normal uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        terminal:
          "border-[hsl(var(--smui-terminal)/0.3)] text-[hsl(var(--smui-terminal))] bg-[hsl(var(--smui-terminal)/0.06)]",
        amber:
          "border-[hsl(var(--smui-amber)/0.3)] text-[hsl(var(--smui-amber))] bg-[hsl(var(--smui-amber)/0.06)]",
        cyan:
          "border-[hsl(var(--smui-cyan)/0.3)] text-[hsl(var(--smui-cyan))] bg-[hsl(var(--smui-cyan)/0.06)]",
        pink:
          "border-[hsl(var(--smui-pink)/0.3)] text-[hsl(var(--smui-pink))] bg-[hsl(var(--smui-pink)/0.06)]",
        magenta:
          "border-[hsl(var(--smui-magenta)/0.3)] text-[hsl(var(--smui-magenta))] bg-[hsl(var(--smui-magenta)/0.06)]",
        crimson:
          "border-[hsl(var(--smui-crimson)/0.3)] text-[hsl(var(--smui-crimson))] bg-[hsl(var(--smui-crimson)/0.06)]",
        teal:
          "border-[hsl(var(--smui-teal)/0.3)] text-[hsl(var(--smui-teal))] bg-[hsl(var(--smui-teal)/0.06)]",
        indigo:
          "border-[hsl(var(--smui-indigo)/0.3)] text-[hsl(var(--smui-indigo))] bg-[hsl(var(--smui-indigo)/0.06)]",
        lime:
          "border-[hsl(var(--smui-lime)/0.3)] text-[hsl(var(--smui-lime))] bg-[hsl(var(--smui-lime)/0.06)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
