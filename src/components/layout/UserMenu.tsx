"use client"

import { useAuth } from "@/hooks/use-auth"
import { AuthService } from "@/services/auth.service"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export function UserMenu() {
  const { user } = useAuth()

  const handleSignOut = async () => {
    await AuthService.signOut()
    window.location.href = "/login"
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex flex-col text-right">
        <span className="text-sm font-medium">{user.email}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sair">
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  )
}
