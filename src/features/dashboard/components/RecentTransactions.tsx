"use client"

import { DashboardSection, DashboardSectionSkeleton } from "./DashboardCards"
import { formatCurrency, formatDate } from "@/utils/format"
import { cn } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react"

interface RecentTransaction {
  id: string
  description: string
  amount: number
  transaction_type: string
  status: string
  transaction_date: string
  category_name?: string
  account_name?: string
}

interface RecentTransactionsProps {
  data: RecentTransaction[] | undefined
  isLoading: boolean
  isError: boolean
}

const typeIcons: Record<string, typeof ArrowDownLeft> = {
  INCOME: ArrowDownLeft,
  EXPENSE: ArrowUpRight,
  TRANSFER: ArrowRightLeft,
}

const typeColors: Record<string, string> = {
  INCOME: "text-emerald-500",
  EXPENSE: "text-destructive",
  TRANSFER: "text-blue-500",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELED: "Cancelada",
}

export function RecentTransactions({ data, isLoading, isError }: RecentTransactionsProps) {
  if (isLoading) return <DashboardSectionSkeleton className="col-span-full" />

  if (isError) {
    return (
      <DashboardSection title="Transações Recentes" className="col-span-full border-destructive/30">
        <p className="text-sm text-destructive">Erro ao carregar transações.</p>
      </DashboardSection>
    )
  }

  if (!data || data.length === 0) {
    return (
      <DashboardSection title="Transações Recentes" className="col-span-full">
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma transação registrada.</p>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection title="Transações Recentes" className="col-span-full">
      {/* Mobile: stacked cards. Desktop: table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="py-2 pr-4 font-medium">Descrição</th>
              <th className="py-2 pr-4 font-medium hidden sm:table-cell">Categoria</th>
              <th className="py-2 pr-4 font-medium hidden md:table-cell">Conta</th>
              <th className="py-2 pr-4 font-medium hidden sm:table-cell">Data</th>
              <th className="py-2 pr-4 font-medium hidden md:table-cell">Status</th>
              <th className="py-2 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tx) => {
              const Icon = typeIcons[tx.transaction_type] || ArrowUpRight
              const color = typeColors[tx.transaction_type] || "text-muted-foreground"

              return (
                <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4 shrink-0", color)} />
                      <span className="truncate font-medium">{tx.description}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground hidden sm:table-cell">
                    {tx.category_name || "—"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">
                    {tx.account_name || "—"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground hidden sm:table-cell">
                    {formatDate(new Date(tx.transaction_date))}
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      tx.status === "PAID" && "bg-emerald-500/10 text-emerald-500",
                      tx.status === "PENDING" && "bg-amber-500/10 text-amber-500",
                      tx.status === "CANCELED" && "bg-muted text-muted-foreground",
                    )}>
                      {statusLabels[tx.status] || tx.status}
                    </span>
                  </td>
                  <td className={cn("py-3 text-right font-semibold whitespace-nowrap", color)}>
                    {tx.transaction_type === "INCOME" ? "+" : tx.transaction_type === "EXPENSE" ? "-" : ""}
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DashboardSection>
  )
}
