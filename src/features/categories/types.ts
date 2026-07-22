export type CategoryType = "INCOME" | "EXPENSE"

export interface Category {
  id: string
  family_id: string
  name: string
  icon: string | null
  color: string | null
  type: CategoryType
  parent_category_id: string | null
  system_category: boolean
  archived: boolean
  created_at: string
  updated_at: string
}

export interface CategoryTree extends Category {
  subcategories?: CategoryTree[]
}
