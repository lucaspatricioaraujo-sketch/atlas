import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Singleton — shared with SupabaseProvider to ensure the same session/cookies
// are used across all service calls and React context updates.
let _supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabaseClient
}

// Named export for backwards compatibility with all existing service imports
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop]
  },
})

export const AuthService = {
  async signOut() {
    return await getSupabaseClient().auth.signOut()
  },

  async getSession() {
    return await getSupabaseClient().auth.getSession()
  },

  async getUser() {
    return await getSupabaseClient().auth.getUser()
  },
}
