export type AccountType = "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT" | "DIGITAL_WALLET" | "OTHER"
export type SyncStatus = "SYNCED" | "PENDING" | "ERROR" | "NOT_CONFIGURED"

export interface Institution {
  id: string
  name: string
  logo?: string
  primary_color?: string
  gradient?: string
  icon?: string
  website?: string
  provider_id?: string
}

export interface Account {
  id: string
  family_id: string
  name: string
  institution: string | null
  type: AccountType
  balance: number
  available_balance: number
  initial_balance: number
  color: string | null
  icon: string | null
  include_in_total_balance: boolean
  is_favorite: boolean
  is_active: boolean
  archived: boolean
  created_at: string
  updated_at: string
  
  // Open Finance Architecture
  sync_status: SyncStatus
  last_sync: string | null
  provider_name: string | null
  provider_id: string | null
  manual_account: boolean
  sync_error: string | null
}
