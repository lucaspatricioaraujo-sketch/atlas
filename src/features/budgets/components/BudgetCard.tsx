"use client"

import { useState } from "react"
import { Wallet, AlertTriangle, AlertCircle, CheckCircle2, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useBudgetUsage, useDeleteBudget } from "../hooks/use-budgets"
import type { Budget } from "../types"

interface BudgetCardProps {
  budget: Budget
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data: currentSpent, isLoading: usageLoading } = useBudgetUsage(budget.id)
  const deleteMutation = useDeleteBudget()

  const limit = Number(budget.total_limit) || 0
  const spent = currentSpent ?? 0
  const remaining = Math.max(0, limit - spent)
  const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0

  // Status Badge Logic
  // Normal: <80%
  // Warning: 80% - 100%
  // Exceeded: >100%
  let statusText = "Normal"
  let statusVariant: "default" | "outline" | "destructive" = "outline"
  let statusClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
  let progressColorClass = "bg-emerald-500"

  if (percentage > 100) {
    statusText = "Excedido"
    statusVariant = "destructive"
    statusClass = "bg-destructive/10 text-destructive border-destructive/20"
    progressColorClass = "bg-destructive"
  } else if (percentage >= 80) {
    statusText = "Atenção"
    statusClass = "bg-amber-500/10 text-amber-500 border-amber-500/20"
    progressColorClass = "bg-amber-500"
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(budget.id)
  }

  return (
    <>
      <Card className="group relative overflow-hidden p-6 hover:shadow-lg transition-all border border-border/50 bg-card hover:border-primary/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {budget.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Período: {budget.period === "MONTHLY" ? "Mensal" : "Anual"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusVariant} className={statusClass}>
              {percentage > 100 ? (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {statusText}
                </span>
              ) : percentage >= 80 ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {statusText}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {statusText}
                </span>
              )}
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {usageLoading ? (
          <div className="space-y-3 my-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2.5 w-full" />
          </div>
        ) : (
          <div className="space-y-3 my-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Uso ({percentage}%)</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(spent)} <span className="text-xs font-normal text-muted-foreground">de {formatCurrency(limit)}</span>
              </span>
            </div>

            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div 
                className={`h-full transition-all rounded-full ${progressColorClass}`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>Restante: <strong className={percentage > 100 ? "text-destructive font-bold" : "text-foreground"}>{formatCurrency(remaining)}</strong></span>
              <span>Limite: {formatCurrency(limit)}</span>
            </div>
          </div>
        )}
      </Card>

      <ConfirmationDialog 
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir Orçamento"
        description="Tem certeza de que deseja excluir este orçamento?"
        onConfirm={handleDelete}
      />
    </>
  )
}
