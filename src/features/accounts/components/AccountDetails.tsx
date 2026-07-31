"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Edit2, Archive, PowerOff } from "lucide-react"

import { useAccount } from "../hooks/use-accounts"
import { formatCurrency } from "@/utils/format"

import { PageHeader } from "@/components/design/PageHeader"
import { PremiumCard } from "@/components/design/PremiumCard"
import { MetricTile } from "@/components/design/MetricTile"
import { StatusBadge } from "@/components/design/StatusBadge"
import { EmptyState } from "@/components/design/EmptyState"
import { Button } from "@/components/ui/button"

interface AccountDetailsProps {
  accountId: string
}

export function AccountDetails({ accountId }: AccountDetailsProps) {
  const { data: account, isLoading } = useAccount(accountId)

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando conta...</div>
  }

  if (!account) {
    return (
      <EmptyState 
        title="Conta não encontrada" 
        description="Esta conta não existe ou foi excluída."
        action={
          <Link href="/dashboard/accounts">
            <Button>Voltar para Contas</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/accounts">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <PageHeader 
            title={account.name} 
            description={account.institution || "Detalhes da conta"}
            action={
              <div className="flex gap-2">
                <Link href={`/dashboard/accounts/${account.id}/edit`}>
                  <Button variant="outline" className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-1 space-y-6">
          <PremiumCard className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Resumo</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge 
                  variant={account.is_active ? "success" : "danger"} 
                >
                  {account.is_active ? "Ativa" : "Desativada"} 
                </StatusBadge>
              </div>
            </div>
          </PremiumCard>
        </div>

        <div className="col-span-1 md:col-span-2">
          <PremiumCard className="p-6 h-full min-h-[300px] flex flex-col items-center justify-center text-center">
            {/* Placeholder for Transactions/Chart */}
            <h3 className="text-lg font-medium text-foreground mb-2">Transações Recentes</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Em breve o histórico de transações filtrado por esta conta aparecerá aqui.
            </p>
            <Link href="/dashboard/transactions">
              <Button variant="secondary">Ir para Transações</Button>
            </Link>
          </PremiumCard>
        </div>
      </div>
    </div>
  )
}
