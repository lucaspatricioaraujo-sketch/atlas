"use client"

import * as React from "react"
import type { CalendarEvent as ICalendarEvent } from "../types"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/formatters"
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  RefreshCcw, 
  Target, 
  AlertTriangle 
} from "lucide-react"

interface CalendarEventProps {
  event: ICalendarEvent
  compact?: boolean
  onClick?: (event: ICalendarEvent) => void
}

export function CalendarEvent({ event, compact = false, onClick }: CalendarEventProps) {
  
  const getEventStyles = () => {
    switch (event.type) {
      case "INCOME": return "bg-success/15 text-success border-success/30 hover:bg-success/25"
      case "EXPENSE": return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
      case "CREDIT_CARD_DUE": return "bg-warning/15 text-warning border-warning/30 hover:bg-warning/25"
      case "CREDIT_CARD_CLOSING": return "bg-muted text-muted-foreground border-border/50 hover:bg-muted/80"
      case "TRANSFER": return "bg-info/15 text-info border-info/30 hover:bg-info/25"
      case "GOAL_CONTRIBUTION": return "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25"
      default: return "bg-secondary text-secondary-foreground border-border/50 hover:bg-secondary/80"
    }
  }

  const getEventIcon = () => {
    switch (event.type) {
      case "INCOME": return <ArrowUpCircle className="w-3 h-3 shrink-0" />
      case "EXPENSE": return <ArrowDownCircle className="w-3 h-3 shrink-0" />
      case "CREDIT_CARD_DUE": return <CreditCard className="w-3 h-3 shrink-0" />
      case "CREDIT_CARD_CLOSING": return <CreditCard className="w-3 h-3 shrink-0 opacity-50" />
      case "TRANSFER": return <RefreshCcw className="w-3 h-3 shrink-0" />
      case "GOAL_CONTRIBUTION": return <Target className="w-3 h-3 shrink-0" />
      case "BUDGET_ALERT": return <AlertTriangle className="w-3 h-3 shrink-0" />
      case "RECURRING": return <RefreshCcw className="w-3 h-3 shrink-0" />
      default: return null
    }
  }

  return (
    <div 
      onClick={() => onClick?.(event)}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium cursor-pointer transition-colors shadow-sm",
        getEventStyles(),
        event.status === "COMPLETED" ? "opacity-70" : "",
        event.status === "OVERDUE" ? "ring-1 ring-destructive ring-offset-1 ring-offset-background" : ""
      )}
    >
      {getEventIcon()}
      <span className="truncate flex-1">{event.title}</span>
      {!compact && event.amount > 0 && (
        <span className="font-semibold whitespace-nowrap ml-1">
          {formatCurrency(event.amount)}
        </span>
      )}
    </div>
  )
}
