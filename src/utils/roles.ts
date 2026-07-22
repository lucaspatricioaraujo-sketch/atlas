import type { Role, Permissions } from "@/types"

export const RolePermissions: Record<Role, Permissions> = {
  ADMIN: {
    canManageUsers: true,
    canAccessPremiumFeatures: true,
    canManageFamily: true,
  },
  PREMIUM: {
    canManageUsers: false,
    canAccessPremiumFeatures: true,
    canManageFamily: true,
  },
  USER: {
    canManageUsers: false,
    canAccessPremiumFeatures: false,
    canManageFamily: false,
  },
}

export function hasPermission(role: Role, permission: keyof Permissions): boolean {
  return RolePermissions[role]?.[permission] ?? false
}
