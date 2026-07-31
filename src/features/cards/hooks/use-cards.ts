import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CardService } from "../services"
import type { CardFormData } from "../schemas"
import { useSupabase } from "@/providers/supabase-provider"

export const CARDS_QUERY_KEY = "cards"

export function useCards() {
  const { user } = useSupabase()
  const familyId = user?.id
  return useQuery({
    queryKey: [CARDS_QUERY_KEY, familyId],
    queryFn: () => CardService.getCards(familyId!),
    enabled: !!familyId,
  })
}

export function useCard(id: string) {
  return useQuery({
    queryKey: [CARDS_QUERY_KEY, id],
    queryFn: () => CardService.getCardById(id),
    enabled: !!id,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (data: CardFormData) => CardService.createCard(familyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARDS_QUERY_KEY, familyId] })
    },
  })
}

export function useUpdateCard(id: string) {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (data: Partial<CardFormData>) => CardService.updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARDS_QUERY_KEY, familyId] })
      queryClient.invalidateQueries({ queryKey: [CARDS_QUERY_KEY, id] })
    },
  })
}

export function useArchiveCard() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: (id: string) => CardService.archiveCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CARDS_QUERY_KEY, familyId] })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string, isFavorite: boolean }) => 
      CardService.toggleFavorite(id, isFavorite),
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: [CARDS_QUERY_KEY, familyId] })
      const previousCards = queryClient.getQueryData([CARDS_QUERY_KEY, familyId])
      
      queryClient.setQueryData([CARDS_QUERY_KEY, familyId], (old: any) => 
        old?.map((card: any) => card.id === id ? { ...card, is_favorite: isFavorite } : card)
      )
      
      return { previousCards }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([CARDS_QUERY_KEY, familyId], context?.previousCards)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CARDS_QUERY_KEY, familyId] })
    },
  })
}

export function useToggleActive() {
  const queryClient = useQueryClient()
  const { user } = useSupabase()
  const familyId = user?.id

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => 
      CardService.toggleActive(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: [CARDS_QUERY_KEY, familyId] })
      const previousCards = queryClient.getQueryData([CARDS_QUERY_KEY, familyId])
      
      queryClient.setQueryData([CARDS_QUERY_KEY, familyId], (old: any) => 
        old?.map((card: any) => card.id === id ? { ...card, is_active: isActive } : card)
      )
      
      return { previousCards }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([CARDS_QUERY_KEY, familyId], context?.previousCards)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CARDS_QUERY_KEY, familyId] })
    },
  })
}
