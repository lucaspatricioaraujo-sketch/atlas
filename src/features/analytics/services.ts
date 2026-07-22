import { supabase } from "@/services/auth.service"
import type { 
  DashboardSummaryDTO, 
  UpcomingBillDTO, 
  ExpenseByCategoryDTO, 
  CashFlowChartDTO, 
  AIFinancialSummaryDTO 
} from "./types"

export const AnalyticsService = {
  
  /**
   * Retrieves the main KPIs for the dashboard using a single optimized RPC call.
   */
  async getDashboardSummary(familyId: string, startDate: string, endDate: string): Promise<DashboardSummaryDTO> {
    const { data, error } = await supabase.rpc("get_dashboard_summary", {
      p_family_id: familyId,
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) throw error
    return data as DashboardSummaryDTO
  },

  /**
   * Retrieves upcoming and pending bills (max 5 by default).
   */
  async getUpcomingBills(familyId: string, limit = 5): Promise<UpcomingBillDTO[]> {
    const { data, error } = await supabase.rpc("get_upcoming_bills", {
      p_family_id: familyId,
      p_limit: limit
    })

    if (error) throw error
    return data as UpcomingBillDTO[]
  },

  /**
   * Retrieves grouped expenses for Donut/Pie charts.
   */
  async getExpensesByCategory(familyId: string, startDate: string, endDate: string): Promise<ExpenseByCategoryDTO[]> {
    const { data, error } = await supabase.rpc("get_expenses_by_category", {
      p_family_id: familyId,
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) throw error
    return data as ExpenseByCategoryDTO[]
  },

  /**
   * Retrieves daily cash flow time series for Bar/Line charts.
   */
  async getCashFlowChart(familyId: string, startDate: string, endDate: string): Promise<CashFlowChartDTO[]> {
    const { data, error } = await supabase.rpc("get_cash_flow_chart", {
      p_family_id: familyId,
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) throw error
    return data as CashFlowChartDTO[]
  },

  /**
   * Retrieves a deeply aggregated context string/JSON ready to be injected into an LLM.
   */
  async getAIFinancialSummary(familyId: string, startDate: string, endDate: string): Promise<AIFinancialSummaryDTO> {
    const { data, error } = await supabase.rpc("get_ai_financial_summary", {
      p_family_id: familyId,
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) throw error
    return data as AIFinancialSummaryDTO
  }
}
