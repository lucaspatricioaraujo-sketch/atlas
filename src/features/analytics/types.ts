export interface DashboardSummaryDTO {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  netCashFlow: number
}

export interface UpcomingBillDTO {
  id: string
  description: string
  amount: number
  due_date: string
  transaction_type: string
  status: string
}

export interface ExpenseByCategoryDTO {
  category_name: string
  category_color: string | null
  total_amount: number
}

export interface CashFlowChartDTO {
  date: string
  income: number
  expense: number
}

export interface AIFinancialSummaryDTO {
  period: {
    start: string
    end: string
  }
  kpis: DashboardSummaryDTO
  expense_distribution: ExpenseByCategoryDTO[]
  goals_progress: Array<{
    name: string
    target_amount: number
    current_amount: number
    status: string
  }>
}
