import { z } from "zod"

export const cardSchema = z.object({
  name: z.string().min(1, "O nome do cartão é obrigatório").max(50, "Nome muito longo"),
  account_id: z.string().uuid().nullable().optional(),
  institution: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  last_four_digits: z.string().length(4, "Deve conter exatamente 4 dígitos").nullable().optional(),
  limit_amount: z.number().min(0, "O limite não pode ser negativo"),
  available_limit: z.number().optional(),
  closing_day: z.number().min(1).max(31).nullable().optional(),
  due_day: z.number().min(1).max(31).nullable().optional(),
  color: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  
  // Open Finance Architecture
  sync_status: z.enum(["SYNCED", "PENDING", "ERROR", "NOT_CONFIGURED"]).optional(),
  last_sync: z.string().nullable().optional(),
  provider_name: z.string().nullable().optional(),
  provider_id: z.string().nullable().optional(),
  manual_card: z.boolean().optional(),
  sync_error: z.string().nullable().optional(),
})

export type CardFormData = z.infer<typeof cardSchema>
