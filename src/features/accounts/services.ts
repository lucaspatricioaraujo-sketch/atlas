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
    if (!familyId) throw new Error("Família não selecionada ou não autenticada.")

    const {
      is_active,
      is_favorite,
      sync_status,
      manual_account,
      ...accountData
    } = payload as any

    const { data, error } = await supabase
      .from("accounts")
      .insert([
        {
          family_id: familyId,
          ...accountData,
          balance: payload.initial_balance ?? 0,
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
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from("accounts")
      .update({ is_favorite: isFavorite })
      .eq("id", id)

    if (error) throw error
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("accounts")
      .update({ is_active: isActive })
      .eq("id", id)

    if (error) throw error
  }
}
