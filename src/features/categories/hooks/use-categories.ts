import { useQuery } from "@tanstack/react-query"
import { useSupabase } from "@/providers/supabase-provider"
import { CategoryService } from "../services"

export function useCategories() {
  const { user } = useSupabase()
  const familyId = user?.id

  return useQuery({
    queryKey: ["categories", familyId],
    queryFn: () => {
      if (!familyId) throw new Error("Family ID is required")
      return CategoryService.getCategories(familyId!)
    },
    enabled: !!familyId,
  })
}
