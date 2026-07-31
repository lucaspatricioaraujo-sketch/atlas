"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { useTransactions, useDeleteTransaction } from "../hooks/use-transactions"
import { TransactionsFilters } from "./TransactionsFilters"
import { TransactionsTable } from "./TransactionsTable"
import { MetricTile } from "@/components/design/MetricTile"
import { PageHeader } from "@/components/design/PageHeader"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/format"

export function TransactionsList() {
  const { data: transactions = [], isLoading } = useTransactions()
  const deleteMutation = useDeleteTransaction()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("ALL")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  const handleDelete = (id: string) => {
    // Basic confirmation for now, later could be a TransactionDeleteDialog
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Transação excluída com sucesso."),
        onError: () => toast.error("Erro ao excluir transação.")
      })
    }
  }

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "ALL" || tx.transaction_type === typeFilter
      const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter
      
      return matchesSearch && matchesType && matchesStatus
    })
  }, [transactions, searchQuery, typeFilter, statusFilter])

  // Simple analytics for the current view
  const summary = React.useMemo(() => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        if (tx.status !== "CANCELED") {
          if (tx.transaction_type === "INCOME") acc.income += tx.amount
          if (tx.transaction_type === "EXPENSE") acc.expense += tx.amount
        }
        return acc
      },
      { income: 0, expense: 0 }
    )
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Transações" 
        description="Gerencie suas receitas, despesas e transferências."
        action={
          <Link href="/dashboard/transactions/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Transação
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricTile 
          title="Receitas no período" 
          value={formatCurrency(summary.income)}
          className="bg-card"
        />
        <MetricTile 
          title="Despesas no período" 
          value={formatCurrency(summary.expense)}
          className="bg-card"
        />
        <MetricTile 
          title="Saldo Líquido" 
          value={formatCurrency(summary.income - summary.expense)}
          trend={summary.income - summary.expense >= 0 ? "up" : "down"}
          trendValue={summary.income - summary.expense >= 0 ? "Positivo" : "Negativo"}
          className="bg-card"
        />
      </div>

      <TransactionsFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <TransactionsTable 
        transactions={filteredTransactions} 
        isLoading={isLoading} 
        onDelete={handleDelete}
      />
    </div>
  )
}
