import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full border px-2.5 py-2 text-ui flex gap-2 items-start [&>svg]:size-3.5 [&>svg]:translate-y-0.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "border-[hsl(var(--smui-red)/0.25)] bg-[hsl(var(--smui-red)/0.04)] text-[hsl(var(--smui-red))] [&>svg]:text-[hsl(var(--smui-red))] *:data-[slot=alert-description]:text-muted-foreground",
        terminal:
          "border-[hsl(var(--smui-terminal)/0.25)] bg-[hsl(var(--smui-terminal)/0.04)] text-[hsl(var(--smui-terminal))] [&>svg]:text-[hsl(var(--smui-terminal))] *:data-[slot=alert-description]:text-muted-foreground",
        amber:
          "border-[hsl(var(--smui-amber)/0.25)] bg-[hsl(var(--smui-amber)/0.04)] text-[hsl(var(--smui-amber))] [&>svg]:text-[hsl(var(--smui-amber))] *:data-[slot=alert-description]:text-muted-foreground",
        cyan:
          "border-[hsl(var(--smui-cyan)/0.25)] bg-[hsl(var(--smui-cyan)/0.04)] text-[hsl(var(--smui-cyan))] [&>svg]:text-[hsl(var(--smui-cyan))] *:data-[slot=alert-description]:text-muted-foreground",
        pink:
          "border-[hsl(var(--smui-pink)/0.25)] bg-[hsl(var(--smui-pink)/0.04)] text-[hsl(var(--smui-pink))] [&>svg]:text-[hsl(var(--smui-pink))] *:data-[slot=alert-description]:text-muted-foreground",
        crimson:
          "border-[hsl(var(--smui-crimson)/0.25)] bg-[hsl(var(--smui-crimson)/0.04)] text-[hsl(var(--smui-crimson))] [&>svg]:text-[hsl(var(--smui-crimson))] *:data-[slot=alert-description]:text-muted-foreground",
        indigo:
          "border-[hsl(var(--smui-indigo)/0.25)] bg-[hsl(var(--smui-indigo)/0.04)] text-[hsl(var(--smui-indigo))] [&>svg]:text-[hsl(var(--smui-indigo))] *:data-[slot=alert-description]:text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium mb-px",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground text-xs [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
