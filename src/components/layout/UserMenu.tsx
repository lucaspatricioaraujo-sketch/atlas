"use client"

import * as React from "react"
import { LogOut, Settings, User, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

import { useSupabase } from "@/providers/supabase-provider"

export function UserMenu() {
  const router = useRouter()
  const { user, supabase } = useSupabase()
  const [name, setName] = React.useState("Usuário Atlas")

  React.useEffect(() => {
    if (!user) return
    supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.first_name) {
          setName(`${data.first_name} ${data.last_name || ""}`.trim())
        }
      })
  }, [user, supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      toast.success("Você saiu da sua conta.")
    } catch (err) {
      toast.error("Erro ao deslogar")
    }
  }

  const initials = (name?.[0] || user?.email?.[0] || "A").toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none">
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage src="" alt="User avatar" />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email || "usuario@exemplo.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="cursor-pointer gap-2"
            onClick={() => router.push("/dashboard/profile")}
          >
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer gap-2"
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings className="h-4 w-4" />
            <span>Configurações da Família</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer gap-2"
            onClick={() => router.push("/dashboard/settings")}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Preferências</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer gap-2">
          <LogOut className="h-4 w-4" />
          <span>Sair da conta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
