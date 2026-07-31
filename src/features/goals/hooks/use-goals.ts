import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabase } from "@/providers/supabase-provider"
import { GoalService } from "../services"
import type { GoalFormData, GoalContributionFormData } from "../schemas"

export const GOALS_QUERY_KEY = "goals"
export const GOAL_CONTRIBUTIONS_KEY = "goal_contributions"

export function useGoals() {
  const { user } = useSupabase()
  const familyId = user?.id

  return useQuery({
    queryKey: [GOALS_QUERY_KEY, familyId],
    queryFn: () => GoalService.getGoals(familyId!),
    enabled: !!familyId,
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: [GOALS_QUERY_KEY, id],
    queryFn: () => GoalService.getGoalById(id),
    enabled: !!id,
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (data: GoalFormData) => {
      if (!familyId) throw new Error("Family ID is required")
      return GoalService.createGoal(familyId!, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, familyId] })
    },
  })
}

export function useUpdateGoal(id: string) {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (data: Partial<GoalFormData>) => GoalService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, familyId] })
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, id] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (id: string) => GoalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, familyId] })
    },
  })
}

export function useGoalContributions(goalId: string) {
  return useQuery({
    queryKey: [GOAL_CONTRIBUTIONS_KEY, goalId],
    queryFn: () => GoalService.getContributions(goalId),
    enabled: !!goalId,
  })
}

export function useAddContribution(goalId: string) {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (data: GoalContributionFormData) => GoalService.addContribution(goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOAL_CONTRIBUTIONS_KEY, goalId] })
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, familyId] })
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, goalId] })
    },
  })
}

export function useRemoveContribution(goalId: string) {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (id: string) => GoalService.removeContribution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOAL_CONTRIBUTIONS_KEY, goalId] })
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, familyId] })
      queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY, goalId] })
    },
  })
}
