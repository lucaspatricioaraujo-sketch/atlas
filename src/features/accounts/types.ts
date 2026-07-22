export type AccountType = "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT"

export interface Account {
  id: string
  family_id: string
  name: string
  institution: string | null
  type: AccountType
  balance: number
  initial_balance: number
  color: string | null
  icon: string | null
  include_in_total_balance: boolean
  archived: boolean
  created_at: string
  updated_at: string
}
