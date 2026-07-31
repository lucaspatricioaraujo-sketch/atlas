"use client"

import * as React from "react"
import { CalendarSummary } from "./CalendarSummary"
import { MonthView } from "./MonthView"
import { AgendaView } from "./AgendaView"
import { MonthlyInsights } from "./MonthlyInsights"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react"
import { addMonths, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function FinancialCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [view, setView] = React.useState<"month" | "agenda">("month")

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <p className="text-muted-foreground">
            Acompanhe seu fluxo de caixa e compromissos financeiros.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as "month" | "agenda")} className="h-10">
            <TabsList className="grid w-full grid-cols-2 h-10">
              <TabsTrigger value="month" className="h-8"><CalendarIcon className="w-4 h-4 mr-2" /> Mês</TabsTrigger>
              <TabsTrigger value="agenda" className="h-8"><List className="w-4 h-4 mr-2" /> Agenda</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 font-medium px-3 rounded-md" onClick={handleToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CalendarSummary currentDate={currentDate} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
        
        <div className="xl:col-span-3 flex flex-col min-h-0 bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          {view === "month" ? (
            <MonthView currentDate={currentDate} />
          ) : (
            <AgendaView currentDate={currentDate} />
          )}
        </div>

        <div className="xl:col-span-1 hidden xl:flex flex-col gap-6 overflow-y-auto">
          <MonthlyInsights currentDate={currentDate} />
        </div>
      </div>

    </div>
  )
}
