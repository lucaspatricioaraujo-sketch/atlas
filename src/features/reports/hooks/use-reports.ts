import { useQuery } from "@tanstack/react-query"
import { ReportsService } from "../services"
import { AnalyticsService } from "@/features/analytics/services"
import type { ReportsFilterState } from "../types"
import { useSupabase } from "@/providers/supabase-provider"

export const REPORTS_SUMMARY_KEY = "reports_summary"
export const REPORTS_INSIGHTS_KEY = "reports_insights"
export const REPORTS_CASHFLOW_KEY = "reports_cashflow_chart"
export const REPORTS_CATEGORY_KEY = "reports_category_chart"

export function useReportsSummary(filters: ReportsFilterState) {
  const { familyId } = useSupabase()

  return useQuery({
    queryKey: [REPORTS_SUMMARY_KEY, familyId, filters],
    queryFn: () => ReportsService.getReportsSummary(familyId!, filters),
    enabled: !!familyId && !!filters.startDate && !!filters.endDate
  })
}

export function useSmartInsights(filters: ReportsFilterState) {
  const { familyId } = useSupabase()

  return useQuery({
    queryKey: [REPORTS_INSIGHTS_KEY, familyId, filters],
    queryFn: () => ReportsService.getSmartInsights(familyId!, filters),
    enabled: !!familyId
  })
}

export function useCashFlowChart(filters: ReportsFilterState) {
  const { familyId } = useSupabase()

  return useQuery({
    queryKey: [REPORTS_CASHFLOW_KEY, familyId, filters],
    queryFn: () => AnalyticsService.getCashFlowChart(familyId!, filters.startDate, filters.endDate),
    enabled: !!familyId && !!filters.startDate && !!filters.endDate
  })
}

export function useExpensesByCategory(filters: ReportsFilterState) {
  const { familyId } = useSupabase()

  return useQuery({
    queryKey: [REPORTS_CATEGORY_KEY, familyId, filters],
    queryFn: () => AnalyticsService.getExpensesByCategory(familyId!, filters.startDate, filters.endDate),
    enabled: !!familyId && !!filters.startDate && !!filters.endDate
  })
}
