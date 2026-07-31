"use client"

import * as React from "react"
import { useMonthlyInsights } from "../hooks/use-calendar"
import { formatCurrency } from "@/lib/formatters"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight, Loader2, Award } from "lucide-react"

interface MonthlyInsightsProps {
  currentDate: Date
}

export function MonthlyInsights({ currentDate }: MonthlyInsightsProps) {
  const { data: insights, isLoading, error } = useMonthlyInsights(currentDate)

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-5 space-y-4 animate-pulse">
        <div className="h-6 w-1/2 bg-muted rounded"></div>
        <div className="space-y-2">
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !insights) {
    return null
  }

  const formatShortDate = (dateStr: string) => {
    return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR })
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 flex flex-col overflow-hidden">
      <div className="p-5 border-b border-border/50 bg-muted/20">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Insights do Mês
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Principais movimentos financeiros.
        </p>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Maior Gasto */}
        {insights.largestExpense && (
          <div className="space-y-1.5">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              Maior Despesa Única
            </p>
            <div className="flex justify-between items-end bg-background/50 p-3 rounded-lg border border-border/30">
              <div>
                <p className="font-medium text-sm truncate max-w-[150px]">{insights.largestExpense.title}</p>
                <p className="text-xs text-muted-foreground">{formatShortDate(insights.largestExpense.date)}</p>
              </div>
              <p className="font-semibold text-destructive">{formatCurrency(insights.largestExpense.amount)}</p>
            </div>
          </div>
        )}

        {/* Maior Receita */}
        {insights.largestIncome && (
          <div className="space-y-1.5">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              Maior Entrada
            </p>
            <div className="flex justify-between items-end bg-background/50 p-3 rounded-lg border border-border/30">
              <div>
                <p className="font-medium text-sm truncate max-w-[150px]">{insights.largestIncome.title}</p>
                <p className="text-xs text-muted-foreground">{formatShortDate(insights.largestIncome.date)}</p>
              </div>
              <p className="font-semibold text-success">{formatCurrency(insights.largestIncome.amount)}</p>
            </div>
          </div>
        )}

        {/* Dia de Maior Gasto */}
        {insights.highestSpendingDay && (
          <div className="space-y-1.5 pt-3 border-t border-border/30">
            <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              Dia com Maior Gasto
            </p>
            <div className="flex items-center justify-between">
              <p className="font-medium">{formatShortDate(insights.highestSpendingDay.date)}</p>
              <p className="font-semibold text-destructive">{formatCurrency(insights.highestSpendingDay.amount)}</p>
            </div>
          </div>
        )}

        {/* Riscos Futuros MOCK */}
        <div className="space-y-1.5 pt-3 border-t border-border/30">
          <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            Riscos Previstos
          </p>
          <div className="bg-warning/10 text-warning text-sm p-3 rounded-lg border border-warning/20">
            <p className="font-medium">Orçamento de Lazer em alerta</p>
            <p className="text-xs mt-1 text-warning/80">Você gastou 85% do previsto para este mês.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
