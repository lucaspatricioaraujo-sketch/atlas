import { supabase } from "@/services/auth.service"
import type { Card } from "./types"
import type { CardFormData } from "./schemas"

export const CardService = {
  async getCards(familyId: string): Promise<Card[]> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("family_id", familyId)
      .eq("archived", false)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Card[]
  },

  async getCardById(id: string): Promise<Card | null> {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Card | null
  },

  async createCard(familyId: string, payload: CardFormData): Promise<Card> {
    const { data, error } = await supabase
      .from("cards")
      .insert([
        {
          family_id: familyId,
          ...payload,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Card
  },

  async updateCard(id: string, payload: Partial<CardFormData>): Promise<Card> {
    const { data, error } = await supabase
      .from("cards")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Card
  },

  async archiveCard(id: string): Promise<void> {
    const { error } = await supabase
      .from("cards")
      .update({ archived: true })
      .eq("id", id)

    if (error) throw error
  },

  async deleteCard(id: string): Promise<void> {
    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", id)

    if (error) throw error
  }
}
