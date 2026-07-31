"use client"

import * as React from "react"
import { useAIDailyBriefing } from "../hooks/use-ai-copilot"
import { formatCurrency } from "@/lib/formatters"
import { PremiumCard } from "@/components/design/PremiumCard"
import { Skeleton } from "@/components/ui/skeleton"

export function AIDailyBriefing() {
  const { data: briefing, isLoading, error } = useAIDailyBriefing()

  if (isLoading) {
    return (
      <PremiumCard className="p-5 flex flex-col gap-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-16 w-full" />
      </PremiumCard>
    )
  }

  if (error || !briefing) return null

  return (
    <PremiumCard className="p-5 flex flex-col gap-4 bg-primary/5 border-primary/20" hoverEffect={false}>
      
      <div className="flex items-center justify-between border-b border-primary/10 pb-3">
        <span className="text-sm font-semibold text-primary/80 uppercase tracking-wider">
          Daily Briefing
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          Score: <strong className="text-foreground">{briefing.financialHealthScore}/100</strong>
        </span>
      </div>

      <p className="text-sm leading-relaxed text-foreground/90">
        {briefing.summaryText}
      </p>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="bg-background/50 rounded p-2 border border-border/50">
          <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Saldo Atual</span>
          <span className="block text-sm font-bold mt-0.5">{formatCurrency(briefing.currentBalance)}</span>
        </div>
        <div className="bg-background/50 rounded p-2 border border-border/50">
          <span className="block text-[10px] uppercase text-muted-foreground font-semibold">Próx. Vencimentos</span>
          <span className="block text-sm font-bold mt-0.5">{briefing.upcomingBillsCount} contas</span>
        </div>
      </div>
      
    </PremiumCard>
  )
}
