import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "text" | "circular"
}

export function LoadingSkeleton({
  className,
  variant = "text",
  ...props
}: LoadingSkeletonProps) {
  const variantStyles = {
    card: "rounded-[var(--radius-3xl)] w-full h-full min-h-[100px]",
    text: "rounded-md h-4 w-full",
    circular: "rounded-full h-10 w-10 shrink-0",
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-muted/50 border border-border/20",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}
