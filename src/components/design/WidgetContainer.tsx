import * as React from "react"
import { cn } from "@/lib/utils"
import { PremiumCard } from "./PremiumCard"

export interface WidgetContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode
  action?: React.ReactNode
  noPadding?: boolean
}

export function WidgetContainer({
  className,
  title,
  action,
  noPadding = false,
  children,
  ...props
}: WidgetContainerProps) {
  return (
    <PremiumCard className={cn("flex flex-col h-full", className)} {...props}>
      {(title || action) && (
        <div className="flex items-center justify-between p-5 lg:p-6 border-b border-border/40">
          {title && (
            <h3 className="font-semibold tracking-tight text-lg text-foreground/90">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn("flex-1", !noPadding && "p-5 lg:p-6")}>{children}</div>
    </PremiumCard>
  )
}
