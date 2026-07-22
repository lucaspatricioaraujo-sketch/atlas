import { z } from "zod"

export const transactionSchema = z.object({
  account_id: z.string().uuid(),
  card_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid(),
  
  description: z.string().min(1, "A descrição é obrigatória").max(100),
  amount: z.number().positive("O valor deve ser maior que zero"),
  
  transaction_type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  payment_type: z.enum(["CASH", "DEBIT", "CREDIT", "PIX", "BANK_TRANSFER"]),
  status: z.enum(["PENDING", "PAID", "CANCELED"]).default("PAID"),
  
  transaction_date: z.string().datetime({ offset: true }),
  due_date: z.string().datetime({ offset: true }).nullable().optional(),
  paid_at: z.string().datetime({ offset: true }).nullable().optional(),
  
  notes: z.string().nullable().optional(),
  
  // Custom controls for frontend logic
  destination_account_id: z.string().uuid().nullable().optional(), // For transfers
  installments: z.number().int().min(1).max(72).default(1), // For installments
})

export type TransactionFormData = z.infer<typeof transactionSchema>
