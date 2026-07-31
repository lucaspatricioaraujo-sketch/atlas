export interface ReportsFilterState {
  startDate: string
  endDate: string
  accountId?: string
  categoryId?: string
}

export interface ReportsSummaryDTO {
  currentNetWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlySavings: number
  savingsRate: number
  financialHealthScore: number // 0 to 100
  // Comparison vs previous period
  trends: {
    netWorth: number
    income: number
    expenses: number
    savingsRate: number
  }
}

export type SmartInsightType = "WARNING" | "SUCCESS" | "INFO" | "NEUTRAL"

export interface SmartInsightDTO {
  id: string
  type: SmartInsightType
  title: string
  description: string
  value?: string | number
  actionLabel?: string
}
