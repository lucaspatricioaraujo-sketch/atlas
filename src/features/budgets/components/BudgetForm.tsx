"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { budgetSchema, type BudgetFormData } from "../schemas"
import { useCreateBudget } from "../hooks/use-budgets"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { toast } from "sonner"

export function BudgetForm() {
  const router = useRouter()
  const createMutation = useCreateBudget()
  const { data: categories } = useCategories()

  const now = new Date()
  const defaultStart = format(startOfMonth(now), "yyyy-MM-dd")
  const defaultEnd = format(endOfMonth(now), "yyyy-MM-dd")

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      period: "MONTHLY",
      start_date: defaultStart,
      end_date: defaultEnd,
      total_limit: 1000,
      items: [],
    },
  })

  const isLoading = createMutation.isPending

  const onSubmit = async (values: BudgetFormData) => {
    try {
      await createMutation.mutateAsync(values)
      router.push("/dashboard/budgets")
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "Erro ao salvar orçamento")
    }
  }

  const handleCategorySelect = (categoryId: string | null) => {
    if (!categoryId) return
    const selectedCategory = categories?.find(c => c.id === categoryId)
    if (selectedCategory) {
      form.setValue("name", `Orçamento - ${selectedCategory.name}`)
      form.setValue("items", [
        {
          category_id: categoryId,
          limit_amount: form.getValues("total_limit") || 1000,
        }
      ])
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
              <FormLabel>Nome do Orçamento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Alimentação Mensal, Orçamento Geral..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Categoria (Opcional)</FormLabel>
            <Select onValueChange={handleCategorySelect}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          <FormField
            control={form.control}
            name="total_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite Total (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0
                      field.onChange(val)
                      const currentItems = form.getValues("items")
                      if (currentItems && currentItems.length > 0) {
                        form.setValue("items", [
                          { ...currentItems[0], limit_amount: val }
                        ])
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Fim</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/dashboard/budgets")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Orçamento"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
