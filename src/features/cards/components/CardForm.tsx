"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { cardSchema, type CardFormData } from "../schemas"
import { useCreateCard, useUpdateCard } from "../hooks/use-cards"

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

interface CardFormProps {
  initialData?: Partial<CardFormData> & { id?: string }
}

export function CardForm({ initialData }: CardFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const createMutation = useCreateCard()
  const updateMutation = useUpdateCard(initialData?.id || "")

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: initialData?.name || "",
      institution: initialData?.institution || "",
      brand: initialData?.brand || "",
      last_four_digits: initialData?.last_four_digits || "",
      limit_amount: initialData?.limit_amount ?? 0,
      available_limit: initialData?.available_limit ?? initialData?.limit_amount ?? 0,
      closing_day: initialData?.closing_day || undefined,
      due_day: initialData?.due_day || undefined,
      color: initialData?.color || "",
      is_active: initialData?.is_active ?? true,
      is_favorite: initialData?.is_favorite ?? false,
      sync_status: initialData?.sync_status ?? "NOT_CONFIGURED",
      manual_card: initialData?.manual_card ?? true,
    },
  })

  const onSubmit = (data: CardFormData) => {
    const mutation = isEditing ? updateMutation : createMutation

    mutation.mutate(data, {
      onSuccess: () => {
        toast.success(isEditing ? "Cartão atualizado!" : "Cartão criado com sucesso!")
        router.push("/dashboard/cards")
      },
      onError: (err) => {
        toast.error("Erro ao salvar cartão.")
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
                    <FormLabel>Nome do Cartão (Apelido)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nubank Ultravioleta" className="h-14 bg-background/50" {...field} />
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
                    <FormLabel>Instituição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nubank, Itaú..." className="h-14 bg-background/50" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="limit_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite Total (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className={cn(
                          "h-14 font-semibold tracking-tight bg-background/50",
                          field.value && field.value >= 0 ? "text-primary" : ""
                        )}
                        {...field}
                        value={field.value ?? 0}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="available_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite Disponível Atual (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className="h-14 font-semibold tracking-tight bg-background/50 text-success"
                        {...field}
                        value={field.value ?? 0}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bandeira</FormLabel>
                    <Select onValueChange={(val) => val && field.onChange(val)} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-background/50">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mastercard">Mastercard</SelectItem>
                        <SelectItem value="Visa">Visa</SelectItem>
                        <SelectItem value="Elo">Elo</SelectItem>
                        <SelectItem value="Amex">American Express</SelectItem>
                        <SelectItem value="Hipercard">Hipercard</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="closing_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia Fechamento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" max="31"
                        placeholder="Ex: 25" 
                        className="h-12 bg-background/50"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia Vencimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" max="31"
                        placeholder="Ex: 5" 
                        className="h-12 bg-background/50"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <FormField
                control={form.control}
                name="last_four_digits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Últimos 4 Dígitos (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 1234" 
                        maxLength={4}
                        className="h-12 font-mono tracking-widest bg-background/50" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor do Cartão</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="h-12 w-14 p-1 cursor-pointer bg-background/50" 
                          {...field} 
                          value={field.value || "#0f172a"}
                        />
                        <Input 
                          type="text" 
                          placeholder="#000000" 
                          className="h-12 flex-1 font-mono uppercase bg-background/50" 
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
                {isEditing ? "Salvar Alterações" : "Adicionar Cartão"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PremiumCard>
  )
}
