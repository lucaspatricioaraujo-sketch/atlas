import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { PremiumCard } from "./PremiumCard"

export interface MetricTileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string
  value: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  trendLabel?: string
  icon?: React.ReactNode
}

export function MetricTile({
  title,
  value,
  trend,
  trendValue,
  trendLabel,
  icon,
  className,
  ...props
}: MetricTileProps) {
  return (
    <PremiumCard className={cn("p-6 flex flex-col gap-4", className)} hoverEffect {...props}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground/70">{icon}</div>}
      </div>
      
      <div>
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        
        {(trendValue || trendLabel) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span
                className={cn(
                  "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                  trend === "up" && "bg-success/15 text-success",
                  trend === "down" && "bg-danger/15 text-danger",
                  trend === "neutral" && "bg-muted text-muted-foreground"
                )}
              >
                {trend === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
                {trend === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
                {trend === "neutral" && <Minus className="w-3 h-3 mr-1" />}
                {trendValue}
              </span>
            )}
            {trendLabel && (
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}
