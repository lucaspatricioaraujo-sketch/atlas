export interface Card {
  id: string
  family_id: string
  account_id: string | null
  name: string
  institution: string | null
  brand: string | null
  last_four_digits: string | null
  limit_amount: number
  available_limit: number
  closing_day: number | null
  due_day: number | null
  color: string | null
  is_active: boolean
  is_favorite: boolean
  archived: boolean
  created_at: string
  updated_at: string
  
  // Open Finance Architecture
  sync_status: "SYNCED" | "PENDING" | "ERROR" | "NOT_CONFIGURED"
  last_sync: string | null
  provider_name: string | null
  provider_id: string | null
  manual_card: boolean
  sync_error: string | null
}
