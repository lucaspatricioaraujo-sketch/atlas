"use client"

import { DashboardSection, DashboardSectionSkeleton } from "./DashboardCards"
import { formatCurrency } from "@/utils/format"
import type { ExpenseByCategoryDTO } from "@/features/analytics/types"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

const DEFAULT_COLORS = [
  "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e",
  "#ec4899", "#3b82f6", "#14b8a6", "#a855f7", "#f97316",
]

interface ExpensesByCategoryChartProps {
  data: ExpenseByCategoryDTO[] | undefined
  isLoading: boolean
  isError: boolean
}

export function ExpensesByCategoryChart({ data, isLoading, isError }: ExpensesByCategoryChartProps) {
  if (isLoading) return <DashboardSectionSkeleton />

  if (isError) {
    return (
      <DashboardSection title="Despesas por Categoria" className="border-destructive/30">
        <p className="text-sm text-destructive">Erro ao carregar dados.</p>
      </DashboardSection>
    )
  }

  if (!data || data.length === 0) {
    return (
      <DashboardSection title="Despesas por Categoria">
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma despesa no período.</p>
      </DashboardSection>
    )
  }

  const totalExpense = data.reduce((sum, item) => sum + item.total_amount, 0)

  const chartData = data.map((item) => ({
    name: item.category_name,
    value: item.total_amount,
    color: item.category_color,
    percentage: totalExpense > 0 ? ((item.total_amount / totalExpense) * 100).toFixed(1) : "0",
  }))

  return (
    <DashboardSection title="Despesas por Categoria" description="Distribuição no período">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              formatter={(value) => formatCurrency(Number(value))}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend as a list below chart for clarity */}
      <div className="mt-4 space-y-2">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
              />
              <span className="text-muted-foreground truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">{formatCurrency(item.value)}</span>
              <span className="text-muted-foreground w-12 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  )
}
