"use client"

import { DashboardSection, DashboardSectionSkeleton } from "./DashboardCards"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/utils/format"

interface BudgetOverviewItem {
  id: string
  name: string
  total_limit: number
  spent: number
}

interface BudgetOverviewProps {
  data: BudgetOverviewItem[] | undefined
  isLoading: boolean
  isError: boolean
}

export function BudgetOverview({ data, isLoading, isError }: BudgetOverviewProps) {
  if (isLoading) return <DashboardSectionSkeleton />

  if (isError) {
    return (
      <DashboardSection title="Orçamentos" className="border-destructive/30">
        <p className="text-sm text-destructive">Erro ao carregar orçamentos.</p>
      </DashboardSection>
    )
  }

  if (!data || data.length === 0) {
    return (
      <DashboardSection title="Orçamentos">
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum orçamento ativo.</p>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection title="Orçamentos" description="Visão geral do mês">
      <div className="space-y-4">
        {data.map((budget) => {
          const remaining = budget.total_limit - budget.spent
          const percentage = budget.total_limit > 0
            ? Math.round((budget.spent / budget.total_limit) * 100)
            : 0
          const isExceeded = percentage > 100

          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate mr-2">{budget.name}</span>
                <span className={cn(
                  "shrink-0 text-xs font-medium",
                  isExceeded ? "text-destructive" : "text-muted-foreground"
                )}>
                  {isExceeded ? "Excedido!" : `${percentage}%`}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isExceeded ? "bg-destructive" :
                    percentage > 80 ? "bg-amber-500" :
                    "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Gasto: {formatCurrency(budget.spent)}</span>
                <span className={cn(isExceeded && "text-destructive")}>
                  {isExceeded ? "Excedido: " : "Restante: "}
                  {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardSection>
  )
}
