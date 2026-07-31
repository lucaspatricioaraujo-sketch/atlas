"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { accountSchema, type AccountFormData } from "../schemas"
import { useCreateAccount, useUpdateAccount } from "../hooks/use-accounts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PremiumCard } from "@/components/design/PremiumCard"
import { toast } from "sonner"

interface AccountFormProps {
  initialData?: Partial<AccountFormData> & { id?: string }
}

export function AccountForm({ initialData }: AccountFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount(initialData?.id || "")

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: initialData?.name || "",
      institution: initialData?.institution || "",
      type: initialData?.type || "CHECKING",
      initial_balance: initialData?.initial_balance ?? 0,
      color: initialData?.color || "",
      icon: initialData?.icon || "",
      include_in_total_balance: initialData?.include_in_total_balance ?? true,
      is_active: initialData?.is_active ?? true,
      is_favorite: initialData?.is_favorite ?? false,
      sync_status: initialData?.sync_status ?? "NOT_CONFIGURED",
      manual_account: initialData?.manual_account ?? true,
    },
  })

  const onSubmit = (data: AccountFormData) => {
    const mutation = isEditing ? updateMutation : createMutation

    mutation.mutate(data, {
      onSuccess: () => {
        toast.success(isEditing ? "Conta atualizada!" : "Conta criada com sucesso!")
        router.push("/dashboard/accounts")
      },
      onError: (err: any) => {
        toast.error(err?.message || "Erro ao salvar conta.")
        console.error(err)
      }
    })
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <PremiumCard className="max-w-2xl mx-auto overflow-hidden">
      <div className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Conta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: NuBank, Carteira..." className="h-14 bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instituição (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nubank, Itaú..." className="h-14 bg-background/50" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Conta</FormLabel>
                    <Select onValueChange={(val) => val && field.onChange(val)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CHECKING">Conta Corrente</SelectItem>
                        <SelectItem value="SAVINGS">Conta Poupança</SelectItem>
                        <SelectItem value="INVESTMENT">Investimento</SelectItem>
                        <SelectItem value="CASH">Dinheiro Físico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initial_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className={cn(
                          "h-14 font-semibold tracking-tight bg-background/50",
                          field.value && field.value >= 0 ? "text-success" : "text-danger"
                        )}
                        {...field}
                        value={field.value ?? 0}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isEditing} // Geralmente saldo inicial não se edita facilmente depois de criada
                      />
                    </FormControl>
                    {isEditing && <p className="text-xs text-muted-foreground">O saldo inicial não pode ser editado. Use as transações de ajuste.</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor de Identificação</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="h-10 w-14 p-1 cursor-pointer bg-background/50" 
                          {...field} 
                          value={field.value || "#6366f1"}
                        />
                        <Input 
                          type="text" 
                          placeholder="#000000" 
                          className="h-10 flex-1 bg-background/50" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? "Salvar Alterações" : "Criar Conta"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PremiumCard>
  )
}
