import { z } from "zod"

export const accountSchema = z.object({
  name: z.string().min(1, "O nome da conta é obrigatório").max(50, "Nome muito longo"),
  institution: z.string().nullable().optional(),
  type: z.enum(["CHECKING", "SAVINGS", "CASH", "INVESTMENT", "DIGITAL_WALLET", "OTHER"], {
    message: "O tipo da conta é obrigatório",
  }),
  initial_balance: z.number().optional(),
  available_balance: z.number().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  include_in_total_balance: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  is_active: z.boolean().optional(),
  
  // Open Finance Architecture
  sync_status: z.enum(["SYNCED", "PENDING", "ERROR", "NOT_CONFIGURED"]).optional(),
  last_sync: z.string().nullable().optional(),
  provider_name: z.string().nullable().optional(),
  provider_id: z.string().nullable().optional(),
  manual_account: z.boolean().optional(),
  sync_error: z.string().nullable().optional(),
})

export type AccountFormData = z.infer<typeof accountSchema>
