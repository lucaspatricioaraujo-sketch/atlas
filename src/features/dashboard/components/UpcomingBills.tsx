"use client"

import { DashboardSection, DashboardSectionSkeleton } from "./DashboardCards"
import { formatCurrency, formatDate } from "@/utils/format"
import { cn } from "@/lib/utils"
import type { UpcomingBillDTO } from "@/features/analytics/types"
import { CalendarClock } from "lucide-react"

interface UpcomingBillsProps {
  data: UpcomingBillDTO[] | undefined
  isLoading: boolean
  isError: boolean
}

export function UpcomingBills({ data, isLoading, isError }: UpcomingBillsProps) {
  if (isLoading) return <DashboardSectionSkeleton />

  if (isError) {
    return (
      <DashboardSection title="Próximas Contas" className="border-destructive/30">
        <p className="text-sm text-destructive">Erro ao carregar contas.</p>
      </DashboardSection>
    )
  }

  if (!data || data.length === 0) {
    return (
      <DashboardSection title="Próximas Contas">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarClock className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma conta pendente.</p>
        </div>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection title="Próximas Contas" description="Despesas pendentes">
      <div className="space-y-3">
        {data.map((bill) => {
          const dueDate = bill.due_date ? new Date(bill.due_date) : null
          const isOverdue = dueDate ? dueDate < new Date() : false

          return (
            <div key={bill.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{bill.description}</p>
                <p className={cn(
                  "text-xs mt-0.5",
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                )}>
                  {dueDate ? formatDate(dueDate) : "Sem vencimento"}
                  {isOverdue && " (Atrasada)"}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-semibold">{formatCurrency(bill.amount)}</p>
                <p className="text-xs text-muted-foreground capitalize">{bill.status.toLowerCase()}</p>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardSection>
  )
}
