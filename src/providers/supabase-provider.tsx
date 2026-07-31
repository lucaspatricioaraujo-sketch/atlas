"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient, User } from "@supabase/supabase-js"

type SupabaseContextType = {
  supabase: SupabaseClient
  user: User | null
  familyId: string | null
  isLoading: boolean
  refreshFamilyId: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Singleton client — one instance shared across provider and services
let _supabaseClient: SupabaseClient | null = null
function getSupabaseClient(): SupabaseClient {
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabaseClient
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => getSupabaseClient())
  const [user, setUser] = useState<User | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchFamilyId = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error("[SupabaseProvider] Error fetching family_id:", error.message)
        setFamilyId(null)
        return
      }

      if (data?.family_id) {
        setFamilyId(data.family_id)
      } else {
        // User is authenticated but has no family yet — do NOT fallback to userId
        // This would silently corrupt the family_id used in all RLS-protected queries
        setFamilyId(null)
      }
    } catch (err) {
      console.error("[SupabaseProvider] Unexpected error fetching family_id:", err)
      setFamilyId(null)
    }
  }, [supabase])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchFamilyId(currentUser.id)
      } else {
        setFamilyId(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchFamilyId])

  const refreshFamilyId = useCallback(async () => {
    if (user) {
      await fetchFamilyId(user.id)
    }
  }, [user, fetchFamilyId])

  return (
    <SupabaseContext.Provider value={{ supabase, user, familyId, isLoading, refreshFamilyId }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}

// Export the shared client so services can use the same instance
export { getSupabaseClient }
