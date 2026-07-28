import * as React from "react"
import { cn } from "@/lib/utils"

export interface QuickActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
}

export function QuickAction({
  icon,
  label,
  className,
  ...props
}: QuickActionProps) {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-[var(--radius-2xl)] transition-all duration-200",
        "bg-card text-card-foreground border border-border/40 hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-premium-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  )
}
