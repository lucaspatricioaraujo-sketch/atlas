export type GoalStatus = "ACTIVE" | "COMPLETED" | "CANCELLED"

export interface Goal {
  id: string
  family_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
  icon: string | null
  color: string | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface GoalContribution {
  id: string
  goal_id: string
  transaction_id: string | null
  amount: number
  contribution_date: string
  notes: string | null
}
