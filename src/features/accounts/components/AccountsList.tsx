"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, Filter } from "lucide-react"
import { toast } from "sonner"

import { useAccounts, useToggleFavorite, useToggleActive, useArchiveAccount } from "../hooks/use-accounts"
import { AccountCard } from "./AccountCard"
import { PageHeader } from "@/components/design/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSkeleton } from "@/components/design/LoadingSkeleton"
import { EmptyState } from "@/components/design/EmptyState"
import { MetricTile } from "@/components/design/MetricTile"
import { formatCurrency } from "@/utils/format"

export function AccountsList() {
  const { data: accounts = [], isLoading } = useAccounts()
  const toggleFavorite = useToggleFavorite()
  const toggleActive = useToggleActive()
  const archiveAccount = useArchiveAccount()

  const [searchQuery, setSearchQuery] = React.useState("")

  const handleToggleFavorite = (id: string, current: boolean) => {
    toggleFavorite.mutate({ id, isFavorite: !current })
  }

  const handleToggleActive = (id: string, current: boolean) => {
    toggleActive.mutate({ id, isActive: !current }, {
      onSuccess: () => toast.success(current ? "Conta desativada" : "Conta reativada")
    })
  }

  const handleArchive = (id: string) => {
    if (window.confirm("Tem certeza que deseja arquivar esta conta? Ela não aparecerá mais nos resumos.")) {
      archiveAccount.mutate(id, {
        onSuccess: () => toast.success("Conta arquivada com sucesso")
      })
    }
  }

  const filteredAccounts = React.useMemo(() => {
    let result = accounts

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(acc => 
        acc.name.toLowerCase().includes(q) || 
        (acc.institution && acc.institution.toLowerCase().includes(q))
      )
    }

    // Sort: Favorites first, then active, then name
    return result.sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1
      if (!a.is_favorite && b.is_favorite) return 1
      if (a.is_active && !b.is_active) return -1
      if (!a.is_active && b.is_active) return 1
      return a.name.localeCompare(b.name)
    })
  }, [accounts, searchQuery])

  const totalBalance = React.useMemo(() => {
    return accounts
      .filter(a => a.is_active && a.include_in_total_balance)
      .reduce((sum, a) => sum + a.balance, 0)
  }, [accounts])

  const numActive = accounts.filter(a => a.is_active).length
  const numFavorites = accounts.filter(a => a.is_favorite).length
  const numInstitutions = new Set(accounts.map(a => a.institution || a.type)).size

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto">
      <PageHeader 
        title="Contas" 
        description="Gerencie suas contas bancárias, carteiras digitais e investimentos."
        action={
          <Link href="/dashboard/accounts/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <MetricTile 
          title="Saldo Total" 
          value={formatCurrency(totalBalance)}
          className="col-span-2 md:col-span-1"
        />
        <MetricTile 
          title="Total de Contas" 
          value={accounts.length.toString()}
        />
        <MetricTile 
          title="Instituições" 
          value={numInstitutions.toString()}
        />
        <MetricTile 
          title="Contas Ativas" 
          value={numActive.toString()}
        />
        <MetricTile 
          title="Favoritas" 
          value={numFavorites.toString()}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Suas Contas</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border/50 h-10"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 bg-card border-border/50">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <LoadingSkeleton className="h-[280px] w-full" />
          <LoadingSkeleton className="h-[280px] w-full" />
          <LoadingSkeleton className="h-[280px] w-full" />
        </div>
      ) : filteredAccounts.length === 0 ? (
        <EmptyState 
          title="Nenhuma conta encontrada" 
          description={searchQuery ? "Tente mudar os termos da sua busca." : "Você ainda não tem nenhuma conta cadastrada."}
          action={
            !searchQuery ? (
              <Link href="/dashboard/accounts/new">
                <Button>Criar Primeira Conta</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAccounts.map(account => (
            <AccountCard 
              key={account.id} 
              account={account} 
              onToggleFavorite={handleToggleFavorite}
              onToggleActive={handleToggleActive}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
