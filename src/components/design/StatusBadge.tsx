import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral" | "primary"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant
  icon?: React.ReactNode
}

export function StatusBadge({
  variant = "neutral",
  icon,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const variantStyles = {
    success: "bg-success/15 text-success border-success/20",
    warning: "bg-warning/15 text-warning border-warning/20",
    danger: "bg-danger/15 text-danger border-danger/20",
    info: "bg-info/15 text-info border-info/20",
    neutral: "bg-muted text-muted-foreground border-border/50",
    primary: "bg-primary/15 text-primary border-primary/20",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">{icon}</span>}
      {children}
    </span>
  )
}
