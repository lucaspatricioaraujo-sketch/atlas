// Global Domain Types for Atlas Financeiro

export type Role = "ADMIN" | "USER" | "PREMIUM"

export interface Permissions {
  canManageUsers: boolean
  canAccessPremiumFeatures: boolean
  canManageFamily: boolean
}

export interface User {
  id: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  avatarUrl?: string
  currency: string // e.g. BRL
  timezone: string
}

export interface Family {
  id: string
  name: string
  ownerId: string
  createdAt: string
}

export interface Pagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
  meta?: Pagination
}
