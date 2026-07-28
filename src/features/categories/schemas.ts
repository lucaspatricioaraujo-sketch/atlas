import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório").max(50, "Nome muito longo"),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "O tipo da categoria é obrigatório",
  }),
  parent_category_id: z.string().uuid().nullable().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>
