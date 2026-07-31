import { AnalyticsService } from "@/features/analytics/services"
import type { ReportsSummaryDTO, SmartInsightDTO, ReportsFilterState } from "./types"

// This service wraps the AnalyticsService and adds Mocks for the new Reports features 
// until the backend is fully updated with the new RPCs.
export const ReportsService = {
  
  async getReportsSummary(familyId: string, filters: ReportsFilterState): Promise<ReportsSummaryDTO> {
    // Attempt to get real data from the analytics engine
    let analyticsBase;
    try {
      analyticsBase = await AnalyticsService.getDashboardSummary(familyId!, filters.startDate, filters.endDate)
    } catch (err) {
      console.warn("AnalyticsService failed or returned no data. Using mock baseline.")
      analyticsBase = {
        totalBalance: 45000,
        totalIncome: 12500,
        totalExpense: 8200,
        netCashFlow: 4300
      }
    }

    // Enhance with Reports logic (Mocked for now)
    const savings = analyticsBase.totalIncome - analyticsBase.totalExpense
    const savingsRate = analyticsBase.totalIncome > 0 ? (savings / analyticsBase.totalIncome) * 100 : 0
    
    // Simple health score formula mock
    let healthScore = 70
    if (savingsRate > 20) healthScore += 15
    if (savingsRate > 40) healthScore += 10
    if (analyticsBase.totalExpense > analyticsBase.totalIncome) healthScore = 40

    return {
      currentNetWorth: analyticsBase.totalBalance + 125000, // mock adding investments
      monthlyIncome: analyticsBase.totalIncome,
      monthlyExpenses: analyticsBase.totalExpense,
      monthlySavings: savings,
      savingsRate: savingsRate,
      financialHealthScore: Math.min(100, Math.max(0, healthScore)),
      trends: {
        netWorth: 2.5, // +2.5%
        income: 1.2,   // +1.2%
        expenses: -5.4, // -5.4% (good)
        savingsRate: 15.0 // +15%
      }
    }
  },

  async getSmartInsights(familyId: string, filters: ReportsFilterState): Promise<SmartInsightDTO[]> {
    // Mocked intelligence engine
    return [
      {
        id: "insight-1",
        type: "WARNING",
        title: "Maior Despesa",
        description: "Alimentação representa 35% dos seus gastos deste mês.",
        value: "R$ 2.870,00"
      },
      {
        id: "insight-2",
        type: "SUCCESS",
        title: "Taxa de Poupança",
        description: "Você poupou 20% a mais que no mês anterior. Excelente trabalho!",
        value: "+20%"
      },
      {
        id: "insight-3",
        type: "INFO",
        title: "Assinaturas",
        description: "Identificamos 3 serviços de streaming recorrentes.",
        value: "R$ 145,90",
        actionLabel: "Revisar"
      }
    ]
  }

}
