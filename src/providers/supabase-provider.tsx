"use client"

import { createContext, useContext, useEffect, useState } from "react"
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

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )
  const [user, setUser] = useState<User | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchFamilyId = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle()

      if (data?.family_id) {
        setFamilyId(data.family_id)
      } else {
        setFamilyId(userId)
      }
    } catch {
      setFamilyId(userId)
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
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
  }, [supabase])

  const refreshFamilyId = async () => {
    if (user) {
      await fetchFamilyId(user.id)
    }
  }

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
