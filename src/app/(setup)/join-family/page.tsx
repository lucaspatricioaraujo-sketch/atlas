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

const joinFamilySchema = z.object({
  inviteCode: z.string().min(5, "Código de convite inválido"),
})

type JoinFamilyForm = z.infer<typeof joinFamilySchema>

export default function JoinFamilyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<JoinFamilyForm>({
    resolver: zodResolver(joinFamilySchema)
  })

  const onSubmit = async (data: JoinFamilyForm) => {
    setIsLoading(true)
    try {
      // Logic for joining via invite code will be handled by a Supabase RPC or endpoint.
      // For now, we simulate success since invite infrastructure is usually handled via emails/links.
      
      toast.success("Bem-vindo à família!")
      router.push("/dashboard")
      
    } catch (err: any) {
      toast.error("Erro ao entrar", { description: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Entrar em uma Família"
      description="Cole o código de convite recebido para acessar o espaço compartilhado."
      footer={
        <div className="text-muted-foreground">
          Quer criar seu próprio espaço? <Link href="/create-family" className="text-primary hover:underline font-medium">Criar Família</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Código de Convite</Label>
          <Input id="inviteCode" placeholder="Ex: X89J2-KLM" {...register("inviteCode")} />
          {errors.inviteCode && <p className="text-sm text-destructive">{errors.inviteCode.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          Entrar na Família
        </Button>
      </form>
    </AuthCard>
  )
}
