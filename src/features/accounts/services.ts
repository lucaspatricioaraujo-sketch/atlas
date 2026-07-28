import { supabase } from "@/services/auth.service"
import type { Account } from "./types"
import type { AccountFormData } from "./schemas"

export const AccountService = {
  async getAccounts(familyId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("family_id", familyId)
      .eq("archived", false)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Account[]
  },

  async getAccountById(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Account | null
  },

  async createAccount(familyId: string, payload: AccountFormData): Promise<Account> {
    const { data, error } = await supabase
      .from("accounts")
      .insert([
        {
          family_id: familyId,
          ...payload,
          balance: payload.initial_balance // Balance starts as initial_balance
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Account
  },

  async updateAccount(id: string, payload: Partial<AccountFormData>): Promise<Account> {
    const { data, error } = await supabase
      .from("accounts")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Account
  },

  async archiveAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from("accounts")
      .update({ archived: true })
      .eq("id", id)

    if (error) throw error
  },

  async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
