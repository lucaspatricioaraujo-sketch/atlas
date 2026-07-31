export type EventType = 
  | "INCOME" 
  | "EXPENSE" 
  | "TRANSFER" 
  | "CREDIT_CARD_DUE" 
  | "CREDIT_CARD_CLOSING" 
  | "GOAL_CONTRIBUTION" 
  | "BUDGET_ALERT" 
  | "RECURRING"

export type EventStatus = "PENDING" | "COMPLETED" | "OVERDUE" | "SKIPPED"

export interface CalendarEvent {
  id: string
  title: string
  amount: number
  date: string // ISO date string YYYY-MM-DD
  type: EventType
  status: EventStatus
  category_id?: string
  account_id?: string
  card_id?: string
  notes?: string
  is_recurring?: boolean
  recurrence_rule?: string
  created_at: string
  updated_at: string
}

export interface DailySummary {
  date: string
  totalIncome: number
  totalExpense: number
  netCashFlow: number
  events: CalendarEvent[]
}

export interface MonthlyInsightsData {
  expectedIncome: number
  expectedExpenses: number
  netCashFlow: number
  highestSpendingDay: { date: string; amount: number } | null
  highestIncomeDay: { date: string; amount: number } | null
  largestExpense: CalendarEvent | null
  largestIncome: CalendarEvent | null
}
