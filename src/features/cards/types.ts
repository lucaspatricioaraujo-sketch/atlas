export interface Card {
  id: string
  family_id: string
  account_id: string | null
  name: string
  brand: string | null
  last_four_digits: string | null
  limit_amount: number
  closing_day: number | null
  due_day: number | null
  color: string | null
  archived: boolean
  created_at: string
  updated_at: string
}
