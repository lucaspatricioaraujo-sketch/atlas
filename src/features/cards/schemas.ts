import { z } from "zod"

export const cardSchema = z.object({
  name: z.string().min(1, "O nome do cartão é obrigatório").max(50, "Nome muito longo"),
  account_id: z.string().uuid().nullable().optional(),
  brand: z.string().nullable().optional(),
  last_four_digits: z.string().length(4, "Deve conter exatamente 4 dígitos").nullable().optional(),
  limit_amount: z.number().min(0, "O limite não pode ser negativo").default(0),
  closing_day: z.number().min(1).max(31).nullable().optional(),
  due_day: z.number().min(1).max(31).nullable().optional(),
  color: z.string().nullable().optional(),
})

export type CardFormData = z.infer<typeof cardSchema>
