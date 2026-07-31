import { supabase } from "@/services/auth.service"
import type { Transaction } from "./types"
import type { TransactionFormData } from "./schemas"
import { v4 as uuidv4 } from "uuid"

export const TransactionService = {
  /**
   * Universal method to create transactions.
   * Automatically handles Installments and Transfers.
   */
  async createTransaction(
    familyId: string, 
    userId: string, 
    payload: TransactionFormData
  ): Promise<void> {
    
    // 1. Handle Internal Transfers (Double Entry)
    if (payload.transaction_type === "TRANSFER" && payload.destination_account_id) {
      const transferGroupId = uuidv4()
      
      const expenseEntry = {
        ...this.buildBasePayload(familyId, userId, payload),
        transaction_type: "EXPENSE", // Outflow from origin
        transfer_group_id: transferGroupId,
      }
      
      const incomeEntry = {
        ...this.buildBasePayload(familyId, userId, payload),
        account_id: payload.destination_account_id,
        transaction_type: "INCOME", // Inflow to destination
        transfer_group_id: transferGroupId,
      }
      
      const { error } = await supabase.from("transactions").insert([expenseEntry, incomeEntry])
      if (error) throw error
      return
    }

    // 2. Handle Installments
    if (payload.installments && payload.installments > 1) {
      const installmentGroupId = uuidv4()
      const installmentAmount = payload.amount / payload.installments
      const entries = []
      
      const baseDate = new Date(payload.transaction_date)

      for (let i = 0; i < payload.installments; i++) {
        const nextDate = new Date(baseDate)
        nextDate.setMonth(nextDate.getMonth() + i) // Adds 1 month per installment
        
        entries.push({
          ...this.buildBasePayload(familyId, userId, payload),
          amount: installmentAmount,
          transaction_date: nextDate.toISOString(),
          due_date: nextDate.toISOString(),
          description: `${payload.description} (${i + 1}/${payload.installments})`,
          installment_group_id: installmentGroupId,
          status: i === 0 && payload.status === "PAID" ? "PAID" : "PENDING", // Only first might be paid immediately
        })
      }
      
      const { error } = await supabase.from("transactions").insert(entries)
      if (error) throw error
      return
    }

    // 3. Handle Standard Transaction
    const singleEntry = this.buildBasePayload(familyId, userId, payload)
    const { error } = await supabase.from("transactions").insert([singleEntry])
    if (error) throw error
  },

  /**
   * Helper to strip UI-only fields and build DB payload
   */
  buildBasePayload(familyId: string, userId: string, payload: TransactionFormData) {
    const { destination_account_id, installments, ...dbPayload } = payload
    return {
      family_id: familyId,
      created_by: userId,
      ...dbPayload,
    }
  },

  async getTransactions(familyId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("family_id", familyId)
      .order("transaction_date", { ascending: false })

    if (error) throw error
    return data as Transaction[]
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Transaction
  },

  async updateTransaction(id: string, payload: Partial<TransactionFormData>): Promise<void> {
    const { destination_account_id, installments, ...dbPayload } = payload
    
    // Simplification for v1: updating a transfer or installment is limited, 
    // we only update the fields of the specific transaction entry.
    const { error } = await supabase
      .from("transactions")
      .update(dbPayload)
      .eq("id", id)

    if (error) throw error
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
    if (error) throw error
  }
}
