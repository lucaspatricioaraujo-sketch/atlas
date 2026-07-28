"use client"

import { DashboardSection, DashboardSectionSkeleton } from "./DashboardCards"
import { formatCurrency, formatCurrencyCompact } from "@/utils/format"
import type { CashFlowChartDTO } from "@/features/analytics/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface CashFlowChartProps {
  data: CashFlowChartDTO[] | undefined
  isLoading: boolean
  isError: boolean
}

export function CashFlowChart({ data, isLoading, isError }: CashFlowChartProps) {
  if (isLoading) return <DashboardSectionSkeleton className="col-span-full lg:col-span-2" />

  if (isError) {
    return (
      <DashboardSection title="Fluxo de Caixa" className="col-span-full lg:col-span-2 border-destructive/30">
        <p className="text-sm text-destructive">Erro ao carregar dados do gráfico.</p>
      </DashboardSection>
    )
  }

  if (!data || data.length === 0) {
    return (
      <DashboardSection title="Fluxo de Caixa" className="col-span-full lg:col-span-2">
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum dado disponível para o período.</p>
      </DashboardSection>
    )
  }

  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
  }))

  return (
    <DashboardSection title="Fluxo de Caixa" description="Receitas vs Despesas no período" className="col-span-full lg:col-span-2">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" tickFormatter={(v) => formatCurrencyCompact(v)} />
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
            <Legend wrapperStyle={{ fontSize: "13px" }} />
            <Bar dataKey="income" name="Receita" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Despesa" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardSection>
  )
}
