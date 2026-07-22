"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import Link from "next/link"

import { AuthCard } from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/services/auth.service"

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema)
  })

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error("Erro ao enviar e-mail", { description: error.message })
        return
      }

      setSuccess(true)
      toast.success("E-mail de recuperação enviado!")
      
    } catch (err: any) {
      toast.error("Erro inesperado", { description: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthCard
        title="Verifique seu e-mail"
        description="Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
        footer={
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Voltar para o Login
            </Button>
          </Link>
        }
      >
         <div className="flex justify-center p-6 text-primary">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Esqueceu a senha?"
      description="Digite seu e-mail para receber um link de redefinição de senha."
      footer={
        <div className="text-muted-foreground">
          Lembrou a senha? <Link href="/login" className="text-primary hover:underline font-medium">Faça login</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          Enviar Link
        </Button>
      </form>
    </AuthCard>
  )
}
