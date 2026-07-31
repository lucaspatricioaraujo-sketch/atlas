"use client"

import * as React from "react"
import { useSupabase } from "@/providers/supabase-provider"
import { PremiumCard } from "@/components/design/PremiumCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Users, Building2, ShieldCheck } from "lucide-react"

export default function SettingsPage() {
  const { user, supabase } = useSupabase()
  const [familyName, setFamilyName] = React.useState("")
  const [role, setRole] = React.useState("Membro")
  const [members, setMembers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!user) return
    async function loadSettings() {
      try {
        const { data: member } = await supabase
          .from("family_members")
          .select("family_id, role, families(name)")
          .eq("user_id", user!.id)
          .limit(1)
          .maybeSingle()

        if (member) {
          setFamilyName((member as any).families?.name || "Espaço Familiar")
          setRole(member.role === "OWNER" ? "Proprietário" : member.role === "ADMIN" ? "Administrador" : "Membro")

          // Load family members
          const { data: allMembers } = await supabase
            .from("family_members")
            .select("id, role, profiles(first_name, last_name, id)")
            .eq("family_id", member.family_id)

          if (allMembers) {
            setMembers(allMembers)
          }
        }
      } catch (err: any) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [user, supabase])

  const handleSaveFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const { data: member } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user.id)
        .limit(1)
        .single()

      if (member?.family_id) {
        const { error } = await supabase
          .from("families")
          .update({ name: familyName, updated_at: new Date().toISOString() })
          .eq("id", member.family_id)

        if (error) throw error
        toast.success("Configurações da família salvas!")
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar família")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie seu espaço familiar e permissões.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <PremiumCard className="p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" /> Espaço Familiar
            </h3>
            <form onSubmit={handleSaveFamily} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">Nome da Família</Label>
                <Input
                  id="familyName"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Nome do seu espaço familiar"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-success" /> Sua permissão: <span className="font-medium text-foreground">{role}</span>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salvar
                </Button>
              </div>
            </form>
          </PremiumCard>

          <PremiumCard className="p-6">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" /> Membros da Família ({members.length})
            </h3>
            <div className="divide-y divide-border/50">
              {members.map((m: any) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {m.profiles?.first_name ? `${m.profiles.first_name} ${m.profiles.last_name || ""}` : "Membro do Espaço"}
                    </p>
                    <p className="text-xs text-muted-foreground">ID: {m.profiles?.id}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  )
}
