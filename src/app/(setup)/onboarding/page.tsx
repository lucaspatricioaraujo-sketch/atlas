"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
// Notice: Real application would update user profile via Supabase or backend endpoint

const onboardingSchema = z.object({
  currency: z.string().min(1),
  timezone: z.string().min(1),
  firstGoalName: z.string().optional(),
  firstGoalAmount: z.string().optional(),
})

type OnboardingForm = z.infer<typeof onboardingSchema>

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      currency: "BRL",
      timezone: "America/Sao_Paulo"
    }
  })

  const onSubmit = async (data: OnboardingForm) => {
    setIsLoading(true)
    try {
      // Logic to save preferences to the database would go here.
      // Example: Update profiles table with currency/timezone, and create a Goal if provided.
      
      toast.success("Tudo pronto! Vamos para o Dashboard.")
      router.push("/dashboard")
      
    } catch (err: any) {
      toast.error("Erro ao salvar", { description: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Quase lá!"
      description="Configure suas preferências regionais e defina sua primeira grande meta."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Moeda Padrão</Label>
            <Input id="currency" disabled {...register("currency")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Fuso Horário</Label>
            <Input id="timezone" disabled {...register("timezone")} />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <div>
            <h4 className="text-sm font-semibold">Sua Primeira Meta (Opcional)</h4>
            <p className="text-xs text-muted-foreground">O que você está planejando alcançar?</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstGoalName">Nome da Meta</Label>
            <Input id="firstGoalName" placeholder="Ex: Viagem para Europa" {...register("firstGoalName")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstGoalAmount">Qual o valor alvo?</Label>
            <Input id="firstGoalAmount" type="number" placeholder="Ex: 15000" {...register("firstGoalAmount")} />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          Finalizar Configuração
        </Button>
      </form>
    </AuthCard>
  )
}
