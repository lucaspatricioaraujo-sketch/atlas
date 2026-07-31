"use client"

import * as React from "react"
import { useSmartInsights } from "../hooks/use-reports"
import type { ReportsFilterState } from "../types"
import { AlertCircle, CheckCircle2, Info, ArrowUpRight, Sparkles } from "lucide-react"

interface SmartInsightsWidgetProps {
  filters: ReportsFilterState
}

export function SmartInsightsWidget({ filters }: SmartInsightsWidgetProps) {
  const { data: insights, isLoading } = useSmartInsights(filters)

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-6 min-h-[350px] animate-pulse">
        <div className="h-6 w-1/3 bg-muted rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!insights || insights.length === 0) {
    return null
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "WARNING": return <AlertCircle className="w-5 h-5 text-warning" />
      case "SUCCESS": return <CheckCircle2 className="w-5 h-5 text-success" />
      case "INFO": return <Info className="w-5 h-5 text-info" />
      default: return <Sparkles className="w-5 h-5 text-primary" />
    }
  }

  const getInsightBg = (type: string) => {
    switch (type) {
      case "WARNING": return "bg-warning/10 border-warning/20"
      case "SUCCESS": return "bg-success/10 border-success/20"
      case "INFO": return "bg-info/10 border-info/20"
      default: return "bg-secondary border-border/50"
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 flex flex-col min-h-[350px]">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Smart Insights</h3>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {insights.map(insight => (
          <div 
            key={insight.id} 
            className={`p-4 rounded-xl border flex gap-4 items-start ${getInsightBg(insight.type)}`}
          >
            <div className="shrink-0 mt-0.5">
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                {insight.value && (
                  <span className="font-bold text-sm">{insight.value}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
              {insight.actionLabel && (
                <button className="text-xs font-medium text-primary flex items-center gap-1 mt-2 hover:underline">
                  {insight.actionLabel}
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
