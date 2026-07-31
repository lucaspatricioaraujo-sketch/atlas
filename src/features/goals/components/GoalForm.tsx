"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { goalSchema, type GoalFormData } from "../schemas"
import { useCreateGoal, useUpdateGoal } from "../hooks/use-goals"
import type { Goal } from "../types"
import { toast } from "sonner"

interface GoalFormProps {
  initialData?: Goal
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#6366F1", // Indigo
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
]

export function GoalForm({ initialData }: GoalFormProps) {
  const router = useRouter()
  const createMutation = useCreateGoal()
  const updateMutation = useUpdateGoal(initialData?.id || "")

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      target_amount: initialData ? Number(initialData.target_amount) : 1000,
      target_date: initialData?.target_date || "",
      color: initialData?.color || "#3B82F6",
      icon: initialData?.icon || "target",
    },
  })

  const isLoading = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (values: GoalFormData) => {
    try {
      if (initialData) {
        await updateMutation.mutateAsync(values)
      } else {
        await createMutation.mutateAsync(values)
      }
      router.push("/dashboard/goals")
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "Erro ao salvar meta")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Meta</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reserva de Emergência, Viagem..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva detalhes ou motivações para essa meta..." 
                  value={field.value || ""} 
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="target_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Objetivo (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Limite (Opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    value={field.value || ""} 
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Color Picker */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor de Destaque</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => field.onChange(c)}
                      className={`h-8 w-8 rounded-full transition-transform ${
                        field.value === c ? "ring-2 ring-primary ring-offset-2 scale-110" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/dashboard/goals")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : initialData ? "Atualizar Meta" : "Criar Meta"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
