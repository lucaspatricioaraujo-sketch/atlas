export type BudgetPeriod = "MONTHLY" | "YEARLY"

export interface BudgetItem {
  id: string
  budget_id: string
  category_id: string
  limit_amount: number
}

export interface Budget {
  id: string
  family_id: string
  name: string
  period: BudgetPeriod
  start_date: string
  end_date: string
  total_limit: number
  created_at: string
  updated_at: string
  
  // This can be joined from the DB or calculated
  items?: BudgetItem[] 
}
