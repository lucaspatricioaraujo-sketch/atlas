import { z } from "zod"

export const budgetItemSchema = z.object({
  category_id: z.string().uuid(),
  limit_amount: z.number().positive("O limite deve ser maior que zero"),
})

export const budgetSchema = z.object({
  name: z.string().min(1, "O nome do orçamento é obrigatório").max(100),
  period: z.enum(["MONTHLY", "YEARLY"]),
  start_date: z.string(), // Format YYYY-MM-DD
  end_date: z.string(),   // Format YYYY-MM-DD
  total_limit: z.number().positive("O limite total deve ser maior que zero"),
  items: z.array(budgetItemSchema).optional(),
}).refine(data => {
  return new Date(data.end_date) >= new Date(data.start_date);
}, {
  message: "A data final deve ser maior ou igual à data inicial",
  path: ["end_date"]
})

export type BudgetFormData = z.infer<typeof budgetSchema>
export type BudgetItemFormData = z.infer<typeof budgetItemSchema>
