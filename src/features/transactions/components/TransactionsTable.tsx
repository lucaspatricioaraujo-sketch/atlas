"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal, ArrowUpRight, ArrowDownRight, RefreshCw, FileEdit, Trash2 } from "lucide-react"
import Link from "next/link"

import type { Transaction } from "../types"
import { formatCurrency } from "@/utils/format"
import { cn } from "@/lib/utils"

import { PremiumCard } from "@/components/design/PremiumCard"
import { StatusBadge } from "@/components/design/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/design/EmptyState"
import { LoadingSkeleton } from "@/components/design/LoadingSkeleton"

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading: boolean
  onDelete: (id: string) => void
}

export function TransactionsTable({ transactions, isLoading, onDelete }: TransactionsTableProps) {
  if (isLoading) {
    return (
      <PremiumCard className="overflow-hidden">
        <div className="p-4 space-y-4">
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-12 w-full" />
        </div>
      </PremiumCard>
    )
  }

  if (!transactions.length) {
    return (
      <PremiumCard>
        <EmptyState
          title="Nenhuma transação encontrada"
          description="Você ainda não possui transações neste período ou nenhuma bate com os filtros aplicados."
        />
      </PremiumCard>
    )
  }

  return (
    <PremiumCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/40">
            <tr>
              <th className="px-6 py-4 font-medium">Descrição</th>
              <th className="px-6 py-4 font-medium">Data</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Valor</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {transactions.map((tx) => (
              <tr 
                key={tx.id} 
                className="bg-card hover:bg-muted/30 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      tx.transaction_type === "INCOME" && "bg-success/15 text-success",
                      tx.transaction_type === "EXPENSE" && "bg-danger/15 text-danger",
                      tx.transaction_type === "TRANSFER" && "bg-info/15 text-info",
                    )}>
                      {tx.transaction_type === "INCOME" && <ArrowUpRight className="h-5 w-5" />}
                      {tx.transaction_type === "EXPENSE" && <ArrowDownRight className="h-5 w-5" />}
                      {tx.transaction_type === "TRANSFER" && <RefreshCw className="h-5 w-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{tx.description}</span>
                      <span className="text-xs text-muted-foreground">
                        {tx.transaction_type === "TRANSFER" ? "Transferência" : tx.payment_type}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                  {format(new Date(tx.transaction_date), "dd MMM yyyy", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge 
                    variant={
                      tx.status === "PAID" ? "success" : 
                      tx.status === "PENDING" ? "warning" : "neutral"
                    }
                  >
                    {tx.status === "PAID" ? "Pago" : 
                     tx.status === "PENDING" ? "Pendente" : "Cancelado"}
                  </StatusBadge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={cn(
                    "font-semibold tracking-tight",
                    tx.transaction_type === "INCOME" ? "text-success" : 
                    tx.transaction_type === "EXPENSE" ? "text-foreground" : "text-info"
                  )}>
                    {tx.transaction_type === "INCOME" ? "+" : 
                     tx.transaction_type === "EXPENSE" ? "-" : ""}
                    {formatCurrency(tx.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent bg-transparent hover:bg-muted text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem>
                        <Link href={`/dashboard/transactions/${tx.id}/edit`} className="flex w-full items-center">
                          <FileEdit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                        onClick={() => onDelete(tx.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PremiumCard>
  )
}
