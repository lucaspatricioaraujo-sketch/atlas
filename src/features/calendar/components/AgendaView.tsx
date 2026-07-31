"use client"

import * as React from "react"
import { useCalendarEvents } from "../hooks/use-calendar"
import { CalendarEvent } from "./CalendarEvent"
import { format, parseISO, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, CalendarX2 } from "lucide-react"

interface AgendaViewProps {
  currentDate: Date
}

export function AgendaView({ currentDate }: AgendaViewProps) {
  const { data: events, isLoading } = useCalendarEvents(currentDate)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Filter out events that are not from this month to avoid overflow from week calendar logic if they came together
  const monthEvents = events?.filter(evt => isSameMonth(parseISO(evt.date), currentDate))
  
  if (!monthEvents || monthEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
        <CalendarX2 className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Nenhum evento neste mês</p>
        <p className="text-sm">Os compromissos aparecerão aqui.</p>
      </div>
    )
  }

  // Group events by date
  const groupedEvents = monthEvents.reduce((acc, evt) => {
    if (!acc[evt.date]) acc[evt.date] = []
    acc[evt.date].push(evt)
    return acc
  }, {} as Record<string, typeof monthEvents>)

  const sortedDates = Object.keys(groupedEvents).sort()

  return (
    <div className="flex flex-col h-full bg-card overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {sortedDates.map(dateStr => {
          const date = parseISO(dateStr)
          const dayEvents = groupedEvents[dateStr]

          return (
            <div key={dateStr} className="flex gap-4 md:gap-8">
              {/* Date Header Sidebar */}
              <div className="w-16 md:w-24 shrink-0 flex flex-col items-end text-right">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {format(date, "EEE", { locale: ptBR })}
                </span>
                <span className="text-2xl md:text-3xl font-bold">
                  {format(date, "dd")}
                </span>
              </div>

              {/* Events List */}
              <div className="flex-1 space-y-2 pt-1 border-l border-border/50 pl-4 md:pl-8 pb-4">
                {dayEvents.map(evt => (
                  <div key={evt.id} className="max-w-md">
                    <CalendarEvent 
                      event={evt} 
                      onClick={(e) => console.log("Agenda click", e)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
