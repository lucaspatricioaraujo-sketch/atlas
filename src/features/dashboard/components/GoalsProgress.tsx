"use client"

import { DashboardSection, DashboardSectionSkeleton } from "./DashboardCards"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/utils/format"
import { Target } from "lucide-react"

interface GoalProgressItem {
  name: string
  target_amount: number
  current_amount: number
  status: string
}

interface GoalsProgressProps {
  data: GoalProgressItem[] | undefined
  isLoading: boolean
  isError: boolean
}

export function GoalsProgress({ data, isLoading, isError }: GoalsProgressProps) {
  if (isLoading) return <DashboardSectionSkeleton />

  if (isError) {
    return (
      <DashboardSection title="Metas" className="border-destructive/30">
        <p className="text-sm text-destructive">Erro ao carregar metas.</p>
      </DashboardSection>
    )
  }

  if (!data || data.length === 0) {
    return (
      <DashboardSection title="Metas">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma meta ativa.</p>
        </div>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection title="Progresso das Metas" description="Metas ativas">
      <div className="space-y-4">
        {data.map((goal) => {
          const percentage = goal.target_amount > 0
            ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100)
            : 0

          return (
            <div key={goal.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate mr-2">{goal.name}</span>
                <span className="text-muted-foreground shrink-0">{percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    percentage >= 100 ? "bg-emerald-500" : "bg-primary"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatCurrency(goal.current_amount)}</span>
                <span>{formatCurrency(goal.target_amount)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardSection>
  )
}
