import { z } from "zod"

export const accountSchema = z.object({
  name: z.string().min(1, "O nome da conta é obrigatório").max(50, "Nome muito longo"),
  institution: z.string().nullable().optional(),
  type: z.enum(["CHECKING", "SAVINGS", "CASH", "INVESTMENT"], {
    required_error: "O tipo da conta é obrigatório",
  }),
  initial_balance: z.number().default(0),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  include_in_total_balance: z.boolean().default(true),
})

export type AccountFormData = z.infer<typeof accountSchema>
