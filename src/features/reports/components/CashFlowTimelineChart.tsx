"use client"

import * as React from "react"
import { useCashFlowChart } from "../hooks/use-reports"
import type { ReportsFilterState } from "../types"
import { formatCurrency } from "@/lib/formatters"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CashFlowTimelineChartProps {
  filters: ReportsFilterState
}

export function CashFlowTimelineChart({ filters }: CashFlowTimelineChartProps) {
  const { data, isLoading, error } = useCashFlowChart(filters)

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-6 min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-6 min-h-[400px] flex items-center justify-center flex-col gap-2 text-muted-foreground">
        <p>Dados insuficientes para gerar o gráfico</p>
      </div>
    )
  }

  const formattedData = data.map(item => ({
    ...item,
    displayDate: format(parseISO(item.date), "dd/MM"),
  }))

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col h-[400px]">
      <div>
        <h3 className="font-semibold text-lg">Evolução de Fluxo de Caixa</h3>
        <p className="text-sm text-muted-foreground">Receitas x Despesas ao longo do tempo</p>
      </div>

      <div className="flex-1 mt-6 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card/95 border border-border p-3 rounded-lg shadow-lg backdrop-blur-sm">
                      <p className="font-medium mb-2">{label}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Receitas:</span>
                          <span className="font-semibold text-success">{formatCurrency(payload[0].value as number)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Despesas:</span>
                          <span className="font-semibold text-destructive">{formatCurrency(payload[1].value as number)}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="var(--success)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
              activeDot={{ r: 4, strokeWidth: 0, fill: "var(--success)" }}
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              stroke="var(--destructive)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
              activeDot={{ r: 4, strokeWidth: 0, fill: "var(--destructive)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
