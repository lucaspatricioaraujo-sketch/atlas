import { createBrowserClient } from "@supabase/ssr"

// A reusable client for services if needed outside of components
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const AuthService = {
  async signOut() {
    return await supabase.auth.signOut()
  },
  
  async getSession() {
    return await supabase.auth.getSession()
  },

  async getUser() {
    return await supabase.auth.getUser()
  }
}
