import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabase } from "@/providers/supabase-provider"
import { TransactionService } from "../services"
import type { TransactionFormData } from "../schemas"

export function useTransactions() {
  const { familyId } = useSupabase()

  return useQuery({
    queryKey: ["transactions", familyId],
    queryFn: () => {
      if (!familyId) throw new Error("Family ID is required")
      return TransactionService.getTransactions(familyId!)
    },
    enabled: !!familyId,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transactions", "detail", id],
    queryFn: () => TransactionService.getTransactionById(id),
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { user, familyId } = useSupabase()

  return useMutation({
    mutationFn: (data: TransactionFormData) => {
      if (!familyId || !user) throw new Error("Not authenticated")
      return TransactionService.createTransaction(familyId!, user.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}

export function useUpdateTransaction(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<TransactionFormData>) => {
      return TransactionService.updateTransaction(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TransactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}
