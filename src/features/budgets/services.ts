import { supabase } from "@/services/auth.service"
import type { Budget, BudgetItem } from "./types"
import type { BudgetFormData } from "./schemas"

export const BudgetService = {
  async getBudgets(familyId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*, budget_items(*)")
      .eq("family_id", familyId)
      .order("start_date", { ascending: false })

    if (error) throw error
    return data as Budget[]
  },

  async getBudgetById(id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*, budget_items(*)")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Budget | null
  },

  async createBudget(familyId: string, payload: BudgetFormData): Promise<Budget> {
    if (!familyId) throw new Error("Família não selecionada ou não autenticada.")
    const { items, ...budgetData } = payload

    // 1. Create Budget
    const { data: budget, error: budgetError } = await supabase
      .from("budgets")
      .insert([{ family_id: familyId, ...budgetData }])
      .select()
      .single()

    if (budgetError) throw budgetError

    // 2. Create Budget Items
    if (items && items.length > 0) {
      const budgetItemsToInsert = items.map(item => ({
        budget_id: budget.id,
        category_id: item.category_id,
        limit_amount: item.limit_amount,
      }))

      const { error: itemsError } = await supabase
        .from("budget_items")
        .insert(budgetItemsToInsert)

      if (itemsError) throw itemsError
    }

    return await this.getBudgetById(budget.id) as Budget
  },

  /**
   * Calculates the current usage of a budget based on transactions.
   * This retrieves transactions dynamically to avoid trigger fragility.
   */
  async getBudgetUsage(budgetId: string, familyId: string): Promise<number> {
    const budget = await this.getBudgetById(budgetId)
    if (!budget) return 0

    // Get all items/categories being tracked in this budget
    const categoryIds = budget.items?.map(i => i.category_id) || []
    if (categoryIds.length === 0) return 0

    const { data, error } = await supabase
      .from("transactions")
      .select("amount")
      .eq("family_id", familyId)
      .eq("transaction_type", "EXPENSE")
      .in("category_id", categoryIds)
      .gte("transaction_date", budget.start_date)
      .lte("transaction_date", budget.end_date)
      .neq("status", "CANCELED")

    if (error) throw error

    // Sum all matching transactions
    return data.reduce((sum, tx) => sum + Number(tx.amount), 0)
  },

  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
