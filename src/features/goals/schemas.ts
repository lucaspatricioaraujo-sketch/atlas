import { z } from "zod"

export const goalSchema = z.object({
  name: z.string().min(1, "O nome da meta é obrigatório").max(100),
  description: z.string().nullable().optional(),
  target_amount: z.number().positive("O valor alvo deve ser maior que zero"),
  target_date: z.string().nullable().optional(), // Format YYYY-MM-DD
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})

export const goalContributionSchema = z.object({
  amount: z.number().positive("O valor da contribuição deve ser maior que zero"),
  contribution_date: z.string().datetime({ offset: true }),
  notes: z.string().nullable().optional(),
  transaction_id: z.string().uuid().nullable().optional(),
})

export type GoalFormData = z.infer<typeof goalSchema>
export type GoalContributionFormData = z.infer<typeof goalContributionSchema>
