import { supabase } from "@/services/auth.service"
import type { Goal, GoalContribution } from "./types"
import type { GoalFormData, GoalContributionFormData } from "./schemas"

export const GoalService = {
  async getGoals(familyId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Goal[]
  },

  async getGoalById(id: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Goal | null
  },

  async createGoal(familyId: string, payload: GoalFormData): Promise<Goal> {
    if (!familyId) throw new Error("Família não selecionada ou não autenticada.")
    const { data, error } = await supabase
      .from("goals")
      .insert([{ family_id: familyId, ...payload }])
      .select()
      .single()

    if (error) throw error
    return data as Goal
  },

  async updateGoal(id: string, payload: Partial<GoalFormData>): Promise<Goal> {
    const { data, error } = await supabase
      .from("goals")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Goal
  },

  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  // ---------------------------------------------------------------------------
  // Goal Contributions
  // ---------------------------------------------------------------------------

  async getContributions(goalId: string): Promise<GoalContribution[]> {
    const { data, error } = await supabase
      .from("goal_contributions")
      .select("*")
      .eq("goal_id", goalId)
      .order("contribution_date", { ascending: false })

    if (error) throw error
    return data as GoalContribution[]
  },

  async addContribution(goalId: string, payload: GoalContributionFormData): Promise<GoalContribution> {
    const { data, error } = await supabase
      .from("goal_contributions")
      .insert([{ goal_id: goalId, ...payload }])
      .select()
      .single()

    // Note: The SQL trigger 'handle_goal_contribution' will automatically
    // update the parent Goal's current_amount and status.
    if (error) throw error
    return data as GoalContribution
  },

  async removeContribution(id: string): Promise<void> {
    const { error } = await supabase
      .from("goal_contributions")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
