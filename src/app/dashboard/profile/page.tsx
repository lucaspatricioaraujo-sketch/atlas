"use client"

import * as React from "react"
import { useSupabase } from "@/providers/supabase-provider"
import { PremiumCard } from "@/components/design/PremiumCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, User as UserIcon } from "lucide-react"

export default function ProfilePage() {
  const { user, supabase } = useSupabase()
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!user) return
    async function loadProfile() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user!.id)
          .maybeSingle()

        if (data) {
          setFirstName(data.first_name || "")
          setLastName(data.last_name || "")
        }
      } catch (err: any) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user, supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      toast.success("Perfil atualizado com sucesso!")
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar perfil")
    } finally {
      setSaving(false)
    }
  }

  const initials = (firstName?.[0] || user?.email?.[0] || "U").toUpperCase()

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Perfil do Usuário</h2>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e conta.</p>
      </div>

      <PremiumCard className="p-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-4 border-b border-border/50 pb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{user?.email}</h3>
                <p className="text-sm text-muted-foreground">ID: {user?.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Seu primeiro nome"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Seu sobrenome"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail (Autenticação)</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}
      </PremiumCard>
    </div>
  )
}
