import * as React from "react"
import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-14 w-full rounded-md bg-[var(--background)] px-6 py-2 text-base font-mono shadow-[var(--shadow-recessed)] transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:shadow-[var(--shadow-recessed),0_0_0_2px_var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

export { Input }
