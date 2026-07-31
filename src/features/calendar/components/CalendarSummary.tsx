"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Activity, AlertCircle, Loader2 } from "lucide-react"

import { useMonthlyInsights } from "../hooks/use-calendar"
import { MetricTile } from "@/components/design/MetricTile"
import { formatCurrency } from "@/lib/formatters"

interface CalendarSummaryProps {
  currentDate: Date
}

export function CalendarSummary({ currentDate }: CalendarSummaryProps) {
  const { data: insights, isLoading, error } = useMonthlyInsights(currentDate)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-card rounded-xl border border-border/50"></div>
        ))}
      </div>
    )
  }

  if (error || !insights) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="h-5 w-5" />
        <p>Erro ao carregar o resumo mensal.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricTile 
        title="Receita Prevista" 
        value={formatCurrency(insights.expectedIncome)} 
        icon={<TrendingUp className="h-4 w-4" />} 
        valueClassName="text-success"
      />
      <MetricTile 
        title="Despesa Prevista" 
        value={formatCurrency(insights.expectedExpenses)} 
        icon={<TrendingDown className="h-4 w-4" />} 
        valueClassName="text-destructive"
      />
      <MetricTile 
        title="Balanço Líquido" 
        value={formatCurrency(insights.netCashFlow)} 
        icon={<Activity className="h-4 w-4" />} 
        valueClassName={insights.netCashFlow > 0 ? "text-primary" : "text-destructive"}
      />
      <MetricTile 
        title="Contas a Pagar" 
        value="5" 
        trendLabel="Nesta semana"
        icon={<AlertCircle className="h-4 w-4" />} 
        valueClassName="text-warning"
      />
    </div>
  )
}
