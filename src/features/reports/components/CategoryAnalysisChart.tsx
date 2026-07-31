"use client"

import * as React from "react"
import { useExpensesByCategory } from "../hooks/use-reports"
import type { ReportsFilterState } from "../types"
import { formatCurrency } from "@/lib/formatters"
import { Loader2 } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface CategoryAnalysisChartProps {
  filters: ReportsFilterState
}

export function CategoryAnalysisChart({ filters }: CategoryAnalysisChartProps) {
  const { data, isLoading, error } = useExpensesByCategory(filters)

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-6 min-h-[350px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-6 min-h-[350px] flex items-center justify-center flex-col gap-2 text-muted-foreground">
        <p>Dados insuficientes para gerar o gráfico</p>
      </div>
    )
  }

  const DEFAULT_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"]

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col h-[350px]">
      <div>
        <h3 className="font-semibold text-lg">Despesas por Categoria</h3>
        <p className="text-sm text-muted-foreground">Aonde seu dinheiro está indo</p>
      </div>

      <div className="flex-1 mt-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="total_amount"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.category_color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-card/95 border border-border p-3 rounded-lg shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.category_color || DEFAULT_COLORS[0] }} />
                        <p className="font-medium">{data.category_name}</p>
                      </div>
                      <p className="font-bold text-lg">{formatCurrency(data.total_amount)}</p>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
