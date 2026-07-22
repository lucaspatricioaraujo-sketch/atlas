import { useSupabase } from "@/providers/supabase-provider"

export function useAuth() {
  const { user, supabase, isLoading } = useSupabase()

  return {
    user,
    supabase,
    isLoading,
    isAuthenticated: !!user,
  }
}
