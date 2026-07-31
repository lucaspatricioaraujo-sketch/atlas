import { z } from "zod"

export const eventTypeSchema = z.enum([
  "INCOME", 
  "EXPENSE", 
  "TRANSFER", 
  "CREDIT_CARD_DUE", 
  "CREDIT_CARD_CLOSING", 
  "GOAL_CONTRIBUTION", 
  "BUDGET_ALERT", 
  "RECURRING"
])

export const eventStatusSchema = z.enum(["PENDING", "COMPLETED", "OVERDUE", "SKIPPED"])

export const calendarEventSchema = z.object({
  title: z.string().min(2, "Título deve ter no mínimo 2 caracteres"),
  amount: z.number().min(0, "O valor não pode ser negativo"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  type: eventTypeSchema,
  status: eventStatusSchema,
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  card_id: z.string().optional(),
  notes: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.string().optional()
})

export type CalendarEventFormData = z.infer<typeof calendarEventSchema>
