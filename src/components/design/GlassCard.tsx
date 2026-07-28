import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-3xl)] glass-effect",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
