import { supabase } from "@/services/auth.service"
import type { Category, CategoryTree } from "./types"
import type { CategoryFormData } from "./schemas"

export const CategoryService = {
  async getCategories(familyId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("family_id", familyId)
      .eq("archived", false)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as Category[]
  },

  async getCategoryTree(familyId: string): Promise<CategoryTree[]> {
    const categories = await this.getCategories(familyId)
    
    const rootCategories = categories.filter(c => !c.parent_category_id)
    const tree = rootCategories.map(root => {
      const subcategories = categories.filter(c => c.parent_category_id === root.id)
      return {
        ...root,
        subcategories
      }
    })

    return tree
  },

  async createCategory(familyId: string, payload: CategoryFormData): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          family_id: familyId,
          ...payload,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async updateCategory(id: string, payload: Partial<CategoryFormData>): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async archiveCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .update({ archived: true })
      .eq("id", id)

    if (error) throw error
  },

  async deleteCategory(id: string): Promise<void> {
    // Only non-system categories can be deleted according to RLS, but we can also double check here
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("system_category", false)

    if (error) throw error
  }
}
