import * as React from "react"
import { cn } from "@/lib/utils"
import { PremiumCard } from "./PremiumCard"

export interface ProgressCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string
  subtitle?: string
  current: number
  total: number
  formatValue?: (value: number) => string
  indicatorColor?: string
}

export function ProgressCard({
  title,
  subtitle,
  current,
  total,
  formatValue = (v) => v.toString(),
  indicatorColor,
  className,
  ...props
}: ProgressCardProps) {
  const percentage = total > 0 ? Math.min(Math.max((current / total) * 100, 0), 100) : 0

  return (
    <PremiumCard className={cn("p-5 flex flex-col gap-3", className)} {...props}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-medium text-foreground">{title}</h4>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="text-right">
          <span className="font-semibold text-foreground">{formatValue(current)}</span>
          <span className="text-sm text-muted-foreground"> / {formatValue(total)}</span>
        </div>
      </div>
      
      <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: indicatorColor 
          }}
        />
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
        <span>{percentage.toFixed(0)}%</span>
        <span>{formatValue(total - current)} restantes</span>
      </div>
    </PremiumCard>
  )
}
