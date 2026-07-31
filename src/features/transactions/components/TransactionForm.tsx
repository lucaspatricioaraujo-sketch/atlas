"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { ArrowDownRight, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react"

import { transactionSchema, type TransactionFormData } from "../schemas"
import { useCreateTransaction, useUpdateTransaction } from "../hooks/use-transactions"
import { useAccounts } from "@/features/accounts/hooks/use-accounts"
import { useCategories } from "@/features/categories/hooks/use-categories"

import { cn } from "@/lib/utils"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PremiumCard } from "@/components/design/PremiumCard"
import { toast } from "sonner"

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData> & { id?: string }
}

export function TransactionForm({ initialData }: TransactionFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  // Data Hooks
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts()
  const { data: categories = [], isLoading: loadingCategories } = useCategories()

  // Mutations
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction(initialData?.id || "")

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transaction_type: initialData?.transaction_type || "EXPENSE",
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      account_id: initialData?.account_id || "",
      category_id: initialData?.category_id || "",
      payment_type: initialData?.payment_type || "PIX",
      status: initialData?.status || "PAID",
      transaction_date: initialData?.transaction_date || new Date().toISOString(),
      notes: initialData?.notes || "",
      installments: initialData?.installments || 1,
      destination_account_id: initialData?.destination_account_id || "",
      card_id: initialData?.card_id || "",
    },
  })

  const transactionType = form.watch("transaction_type")
  const isTransfer = transactionType === "TRANSFER"

  // Filter categories by type (unless transfer)
  const filteredCategories = React.useMemo(() => {
    if (isTransfer) return categories // Transf pode ter cat genérica ou desabilitada
    return categories.filter(c => c.type === transactionType)
  }, [categories, transactionType, isTransfer])

  const onSubmit = (data: TransactionFormData) => {
    // If it's a transfer, we force payment_type to BANK_TRANSFER
    if (data.transaction_type === "TRANSFER") {
      data.payment_type = "BANK_TRANSFER"
      if (!data.destination_account_id) {
        form.setError("destination_account_id", { message: "Conta de destino é obrigatória para transferências" })
        return
      }
      if (data.account_id === data.destination_account_id) {
        form.setError("destination_account_id", { message: "Conta de destino deve ser diferente da origem" })
        return
      }
    }

    const mutation = isEditing ? updateMutation : createMutation

    mutation.mutate(data, {
      onSuccess: () => {
        toast.success(isEditing ? "Transação atualizada!" : "Transação criada!")
        router.push("/dashboard/transactions")
      },
      onError: (err) => {
        toast.error("Erro ao salvar transação.")
        console.error(err)
      }
    })
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || loadingAccounts || loadingCategories

  return (
    <PremiumCard className="max-w-2xl mx-auto overflow-hidden">
      <div className="p-6 sm:p-8">
        
        {!isEditing && (
          <Tabs 
            defaultValue="EXPENSE" 
            value={transactionType}
            onValueChange={(val) => {
              form.setValue("transaction_type", val as any)
              form.setValue("category_id", "") // reset category on type change
            }}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50">
              <TabsTrigger value="EXPENSE" className="data-[state=active]:bg-danger/10 data-[state=active]:text-danger">
                <ArrowDownRight className="w-4 h-4 mr-2" /> Despesa
              </TabsTrigger>
              <TabsTrigger value="INCOME" className="data-[state=active]:bg-success/10 data-[state=active]:text-success">
                <ArrowUpRight className="w-4 h-4 mr-2" /> Receita
              </TabsTrigger>
              <TabsTrigger value="TRANSFER" className="data-[state=active]:bg-info/10 data-[state=active]:text-info">
                <RefreshCw className="w-4 h-4 mr-2" /> Transferência
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className={cn(
                          "text-2xl h-14 font-semibold tracking-tight bg-background/50",
                          transactionType === "INCOME" && "text-success",
                          transactionType === "EXPENSE" && "text-danger",
                          transactionType === "TRANSFER" && "text-info"
                        )}
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Conta de Luz" className="h-14 bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isTransfer ? "Conta de Origem" : "Conta"}</FormLabel>
                    <Select onValueChange={(val) => val && field.onChange(val)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isTransfer ? (
                <FormField
                  control={form.control}
                  name="destination_account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta de Destino</FormLabel>
                      <Select onValueChange={(val) => val && field.onChange(val)} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Selecione a conta destino" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={(val) => val && field.onChange(val)} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <FormField
                control={form.control}
                name="transaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="bg-background/50" 
                        {...field} 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = new Date(e.target.value)
                          field.onChange(date.toISOString())
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isTransfer && (
                <FormField
                  control={form.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma Pagamento</FormLabel>
                      <Select onValueChange={(val) => val && field.onChange(val)} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="CREDIT">Crédito</SelectItem>
                          <SelectItem value="DEBIT">Débito</SelectItem>
                          <SelectItem value="CASH">Dinheiro</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Transferência</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={(val) => val && field.onChange(val)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PAID">Pago / Concluído</SelectItem>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="CANCELED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isEditing && transactionType === "EXPENSE" && (
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel>Parcelamento (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="72"
                        className="bg-background/50 w-[120px]" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Deixe 1 para pagamento à vista.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="pt-2">
                  <FormLabel>Anotações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhes adicionais..." 
                      className="resize-none bg-background/50" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isEditing ? "Salvar Alterações" : "Criar Transação"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PremiumCard>
  )
}
