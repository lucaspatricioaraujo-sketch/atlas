import * as React from "react"
import { cn } from "@/lib/utils"

export interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
}

export function PremiumCard({
  className,
  hoverEffect = false,
  children,
  ...props
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-3xl)] bg-card text-card-foreground border border-border/40 shadow-premium-sm transition-all duration-300",
        hoverEffect && "hover:shadow-premium-md hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
