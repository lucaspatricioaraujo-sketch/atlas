export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER"
export type PaymentType = "CASH" | "DEBIT" | "CREDIT" | "PIX" | "BANK_TRANSFER"
export type TransactionStatus = "PENDING" | "PAID" | "CANCELED"

export interface Transaction {
  id: string
  family_id: string
  account_id: string
  card_id: string | null
  category_id: string
  created_by: string
  
  description: string
  amount: number
  
  transaction_type: TransactionType
  payment_type: PaymentType
  status: TransactionStatus
  
  transaction_date: string
  due_date: string | null
  paid_at: string | null
  
  notes: string | null
  attachment_url: string | null
  
  recurring: boolean
  recurrence_group_id: string | null
  installment_group_id: string | null
  transfer_group_id: string | null
  
  created_at: string
  updated_at: string
}
