import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabase } from "@/providers/supabase-provider"
import { BudgetService } from "../services"
import type { BudgetFormData } from "../schemas"

export const BUDGETS_QUERY_KEY = "budgets"
export const BUDGET_USAGE_KEY = "budget_usage"

export function useBudgets() {
  const { user } = useSupabase()
  const familyId = user?.id

  return useQuery({
    queryKey: [BUDGETS_QUERY_KEY, familyId],
    queryFn: () => BudgetService.getBudgets(familyId!),
    enabled: !!familyId,
  })
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: [BUDGETS_QUERY_KEY, id],
    queryFn: () => BudgetService.getBudgetById(id),
    enabled: !!id,
  })
}

export function useBudgetUsage(budgetId: string) {
  const { user } = useSupabase()
  const familyId = user?.id

  return useQuery({
    queryKey: [BUDGET_USAGE_KEY, budgetId, familyId],
    queryFn: () => BudgetService.getBudgetUsage(budgetId, familyId!),
    enabled: !!familyId && !!budgetId,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (data: BudgetFormData) => {
      if (!familyId) throw new Error("Family ID is required")
      return BudgetService.createBudget(familyId!, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY, familyId] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (id: string) => BudgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY, familyId] })
    },
  })
}
