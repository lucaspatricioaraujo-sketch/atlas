import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabase } from "@/providers/supabase-provider"
import { AccountService } from "../services"
import type { AccountFormData } from "../schemas"

export function useAccounts() {
  const { user } = useSupabase()
  const familyId = user?.id

  return useQuery({
    queryKey: ["accounts", familyId],
    queryFn: () => {
      if (!familyId) throw new Error("Family ID is required")
      return AccountService.getAccounts(familyId!)
    },
    enabled: !!familyId,
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ["accounts", "detail", id],
    queryFn: () => AccountService.getAccountById(id),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (data: AccountFormData) => {
      if (!familyId) throw new Error("Family ID is required")
      return AccountService.createAccount(familyId!, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
  })
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<AccountFormData>) => {
      return AccountService.updateAccount(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["accounts", "detail", id] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AccountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
  })
}

export function useArchiveAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AccountService.archiveAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string, isFavorite: boolean }) => 
      AccountService.toggleFavorite(id, isFavorite),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["accounts", "detail", variables.id] })
    },
  })
}

export function useToggleActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      AccountService.toggleActive(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] })
      queryClient.invalidateQueries({ queryKey: ["accounts", "detail", variables.id] })
    },
  })
}
