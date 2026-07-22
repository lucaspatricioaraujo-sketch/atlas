"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { AuthCard } from "@/components/auth/AuthCard"
import { PasswordField } from "@/components/auth/PasswordField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/services/auth.service"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast.error("Erro ao entrar", { description: error.message })
        return
      }

      toast.success("Login realizado com sucesso!")
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      toast.error("Erro inesperado", { description: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCard
      title="Bem-vindo de volta"
      description="Faça login no Atlas Financeiro para continuar."
      footer={
        <>
          <Link href="/forgot-password" className="text-primary hover:underline">
            Esqueceu a senha?
          </Link>
          <div className="text-muted-foreground">
            Não tem uma conta? <Link href="/register" className="text-primary hover:underline font-medium">Cadastre-se</Link>
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <PasswordField id="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2" /> : null}
          Entrar
        </Button>
      </form>
    </AuthCard>
  )
}
