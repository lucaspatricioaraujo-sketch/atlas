import { useQuery } from "@tanstack/react-query"
import { CalendarService } from "../services"
import { useSupabase } from "@/providers/supabase-provider"
import { startOfMonth, endOfMonth, format } from "date-fns"

export const CALENDAR_EVENTS_QUERY_KEY = "calendar_events"
export const CALENDAR_INSIGHTS_QUERY_KEY = "calendar_insights"

export function useCalendarEvents(currentDate: Date) {
  const { user } = useSupabase()
  const familyId = user?.id
  
  // Obter o primeiro e último dia do mês ativo
  const start = format(startOfMonth(currentDate), "yyyy-MM-dd")
  const end = format(endOfMonth(currentDate), "yyyy-MM-dd")

  return useQuery({
    queryKey: [CALENDAR_EVENTS_QUERY_KEY, familyId, start, end],
    queryFn: () => CalendarService.getEventsByDateRange(familyId!, start, end),
    enabled: !!familyId,
  })
}

export function useMonthlyInsights(currentDate: Date) {
  const { user } = useSupabase()
  const familyId = user?.id
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  return useQuery({
    queryKey: [CALENDAR_INSIGHTS_QUERY_KEY, familyId, year, month],
    queryFn: () => CalendarService.getMonthlyInsights(familyId!, year, month),
    enabled: !!familyId,
  })
}
