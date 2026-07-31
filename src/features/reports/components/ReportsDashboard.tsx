"use client"

import * as React from "react"
import { ReportsFilterBar } from "./ReportsFilterBar"
import { TopSummaryKPIs } from "./TopSummaryKPIs"
import { CashFlowTimelineChart } from "./CashFlowTimelineChart"
import { CategoryAnalysisChart } from "./CategoryAnalysisChart"
import { SmartInsightsWidget } from "./SmartInsightsWidget"
import { startOfMonth, endOfMonth, format } from "date-fns"
import type { ReportsFilterState } from "../types"

export function ReportsDashboard() {
  const [filters, setFilters] = React.useState<ReportsFilterState>({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Intelligence Center</h2>
          <p className="text-muted-foreground">
            Análises profundas e insights sobre sua saúde financeira.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Action buttons (Export, Share) placeholder */}
        </div>
      </div>

      {/* Global Filters */}
      <ReportsFilterBar filters={filters} onFilterChange={setFilters} />

      {/* Top Summary */}
      <TopSummaryKPIs filters={filters} />

      {/* Main Charts & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CashFlowTimelineChart filters={filters} />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <CategoryAnalysisChart filters={filters} />
          <SmartInsightsWidget filters={filters} />
        </div>

      </div>

    </div>
  )
}
