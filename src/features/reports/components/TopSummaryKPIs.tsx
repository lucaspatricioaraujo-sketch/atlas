"use client"

import * as React from "react"
import { useReportsSummary } from "../hooks/use-reports"
import type { ReportsFilterState } from "../types"
import { MetricTile } from "@/components/design/MetricTile"
import { formatCurrency } from "@/lib/formatters"
import { Wallet, TrendingUp, TrendingDown, PiggyBank, HeartPulse, Activity } from "lucide-react"

interface TopSummaryKPIsProps {
  filters: ReportsFilterState
}

export function TopSummaryKPIs({ filters }: TopSummaryKPIsProps) {
  const { data: summary, isLoading } = useReportsSummary(filters)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-[120px] bg-card rounded-xl border border-border/50"></div>
        ))}
      </div>
    )
  }

  if (!summary) return null

  // Function to format percentage trend
  const renderTrend = (value: number, invertColors = false) => {
    const isPositive = value > 0
    let color = isPositive ? "text-success" : "text-destructive"
    if (invertColors) {
      color = isPositive ? "text-destructive" : "text-success"
    }
    
    return (
      <span className={color}>
        {isPositive ? "+" : ""}{value}%
      </span>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricTile 
        title="Patrimônio Líquido" 
        value={formatCurrency(summary.currentNetWorth)} 
        icon={<Wallet className="h-4 w-4" />} 
        trendLabel={<>vs mês anterior {renderTrend(summary.trends.netWorth)}</>}
      />
      <MetricTile 
        title="Receitas" 
        value={formatCurrency(summary.monthlyIncome)} 
        valueClassName="text-success"
        icon={<TrendingUp className="h-4 w-4" />} 
        trendLabel={<>vs mês anterior {renderTrend(summary.trends.income)}</>}
      />
      <MetricTile 
        title="Despesas" 
        value={formatCurrency(summary.monthlyExpenses)} 
        valueClassName="text-destructive"
        icon={<TrendingDown className="h-4 w-4" />} 
        trendLabel={<>vs mês anterior {renderTrend(summary.trends.expenses, true)}</>}
      />
      <MetricTile 
        title="Poupado" 
        value={formatCurrency(summary.monthlySavings)} 
        icon={<PiggyBank className="h-4 w-4" />} 
        trendLabel={<>Taxa: {summary.savingsRate.toFixed(1)}%</>}
      />
      <MetricTile 
        title="Saúde Financeira" 
        value={`${summary.financialHealthScore}/100`} 
        icon={<HeartPulse className="h-4 w-4" />} 
        valueClassName={summary.financialHealthScore > 70 ? "text-primary" : "text-warning"}
        trendLabel={summary.financialHealthScore > 70 ? "Excelente" : "Atenção"}
      />
    </div>
  )
}
