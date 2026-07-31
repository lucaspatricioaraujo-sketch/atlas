"use client"

import * as React from "react"
import { useCalendarEvents } from "../hooks/use-calendar"
import { CalendarEvent } from "./CalendarEvent"
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday,
  parseISO
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2 } from "lucide-react"

interface MonthViewProps {
  currentDate: Date
}

export function MonthView({ currentDate }: MonthViewProps) {
  const { data: events, isLoading } = useCalendarEvents(currentDate)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return events?.filter(e => e.date === dateStr) || []
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Dias da semana */}
      <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de Dias */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, monthStart)
          
          return (
            <div 
              key={day.toString()}
              className={`
                min-h-[100px] p-2 border-r border-b border-border/40 flex flex-col gap-1 transition-colors
                ${!isCurrentMonth ? "bg-muted/10 opacity-50" : "hover:bg-accent/5"}
                ${isToday(day) ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}
                ${dayIdx % 7 === 6 ? "border-r-0" : ""}
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
                }`}>
                  {format(day, "d")}
                </span>
                
                {/* Indicador sutil para dias muito cheios */}
                {dayEvents.length > 4 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 mr-1" />
                )}
              </div>

              <div className="flex flex-col gap-1 mt-1 overflow-y-auto no-scrollbar flex-1">
                {dayEvents.slice(0, 4).map(evt => (
                  <CalendarEvent 
                    key={evt.id} 
                    event={evt} 
                    compact 
                    onClick={(e) => console.log("Clicked event", e)}
                  />
                ))}
                
                {dayEvents.length > 4 && (
                  <div className="text-[10px] text-muted-foreground font-medium px-1 mt-auto">
                    + {dayEvents.length - 4} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
