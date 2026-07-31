"use client"

import * as React from "react"
import type { ReportsFilterState } from "../types"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Filter, Download } from "lucide-react"

interface ReportsFilterBarProps {
  filters: ReportsFilterState
  onFilterChange: (filters: ReportsFilterState) => void
}

export function ReportsFilterBar({ filters, onFilterChange }: ReportsFilterBarProps) {
  
  // Here we would use a DatePicker / DateRangePicker component.
  // For the sake of UI preview without building a complex DatePicker from scratch,
  // we will show a styled placeholder button that represents the active filter.
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border/50 p-3 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
        
        <Button variant="outline" size="sm" className="h-9 gap-2 shrink-0">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>Este Mês</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="h-9 gap-2 shrink-0 border border-dashed border-border text-muted-foreground hover:text-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtros Adicionais</span>
        </Button>
        
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </Button>
      </div>
    </div>
  )
}
