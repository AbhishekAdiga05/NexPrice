import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[11px] font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none leading-snug",
  {
    variants: {
      variant: {
        default: "bg-orange-50 text-orange-700 border border-orange-200/60",
        secondary: "bg-muted text-muted-foreground border border-border/60",
        destructive: "bg-red-50 text-red-700 border border-red-200/60",
        outline: "text-muted-foreground border border-border/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
