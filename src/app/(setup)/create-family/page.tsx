"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/services/auth.service"

const createFamilySchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").max(50),
})

type CreateFamilyForm = z.infer<typeof createFamilySchema>

export default function CreateFamilyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CreateFamilyForm>({
    resolver: zodResolver(createFamilySchema)
  })

  const onSubmit = async (data: CreateFamilyForm) => {
    setIsLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      // Insert family
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert([{ name: data.name }])
        .select()
        .single()

      if (familyError) throw familyError

      // Link user to family as OWNER
      const { error: memberError } = await supabase
        .from("family_members")
        .insert([{
          family_id: family.id,
          user_id: user.id,
          role: "OWNER"
        }])

      if (memberError) throw memberError

      toast.success("Família criada com sucesso!")
      router.push("/onboarding")
      
    } catch (err: any) {
      toast.error("Erro ao criar família", { description: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Crie sua Família"
      description="O Atlas funciona focado no núcleo familiar. Dê um nome ao seu espaço financeiro."
      footer={
        <div className="text-muted-foreground">
          Recebeu um convite? <Link href="/join-family" className="text-primary hover:underline font-medium">Entrar em uma família</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Família</Label>
          <Input id="name" placeholder="Ex: Família Silva" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          Criar e Continuar
        </Button>
      </form>
    </AuthCard>
  )
}
