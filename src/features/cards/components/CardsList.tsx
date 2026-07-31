"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, CreditCard, Wallet, TrendingUp, Activity, AlertCircle, Loader2 } from "lucide-react"

import { useCards, useArchiveCard, useToggleFavorite, useToggleActive } from "../hooks/use-cards"
import { CreditCardItem } from "./CreditCardItem"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WidgetContainer } from "@/components/design/WidgetContainer"
import { MetricTile } from "@/components/design/MetricTile"
import { EmptyState } from "@/components/design/EmptyState"
import { formatCurrency } from "@/lib/formatters"

export function CardsList() {
  const { data: cards, isLoading, error } = useCards()
  const archiveMutation = useArchiveCard()
  const toggleFavoriteMutation = useToggleFavorite()
  const toggleActiveMutation = useToggleActive()

  const [search, setSearch] = React.useState("")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-destructive">Erro ao carregar cartões</h3>
        <p className="text-muted-foreground">Tente novamente mais tarde.</p>
      </div>
    )
  }

  const activeCards = cards?.filter((c) => !c.archived) || []
  
  // KPI Calculations
  const totalLimit = activeCards.reduce((acc, curr) => acc + (curr.limit_amount || 0), 0)
  const totalAvailable = activeCards.reduce((acc, curr) => acc + (curr.available_limit || 0), 0)
  const currentInvoices = totalLimit - totalAvailable
  const utilizationRate = totalLimit > 0 ? (currentInvoices / totalLimit) * 100 : 0
  
  const filteredCards = activeCards
    .filter((c) => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(s) ||
        c.institution?.toLowerCase().includes(s) ||
        c.last_four_digits?.includes(s)
      )
    })
    .sort((a, b) => {
      // Favorites first
      if (a.is_favorite && !b.is_favorite) return -1
      if (!a.is_favorite && b.is_favorite) return 1
      // Then active
      if (a.is_active && !b.is_active) return -1
      if (!a.is_active && b.is_active) return 1
      // Then alphabetical
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Cartões</h2>
          <p className="text-muted-foreground">
            Gerencie limites, faturas e controle seu crédito.
          </p>
        </div>
        <Link href="/dashboard/cards/new">
          <Button size="lg" className="rounded-full shadow-md">
            <Plus className="mr-2 h-5 w-5" />
            Novo Cartão
          </Button>
        </Link>
      </div>

      {/* Credit Summary Dashboard */}
      {activeCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricTile 
            title="Limite Total" 
            value={formatCurrency(totalLimit)} 
            icon={<CreditCard className="h-4 w-4" />} 
          />
          <MetricTile 
            title="Limite Disponível" 
            value={formatCurrency(totalAvailable)} 
            icon={<Wallet className="h-4 w-4" />} 
            valueClassName="text-success"
          />
          <MetricTile 
            title="Faturas Atuais" 
            value={formatCurrency(currentInvoices)} 
            icon={<TrendingUp className="h-4 w-4" />} 
            valueClassName="text-warning"
          />
          <MetricTile 
            title="Taxa de Uso" 
            value={`${utilizationRate.toFixed(1)}%`} 
            icon={<Activity className="h-4 w-4" />} 
            valueClassName={utilizationRate > 80 ? "text-destructive" : utilizationRate > 50 ? "text-warning" : ""}
          />
        </div>
      )}

      {/* Filters */}
      {activeCards.length > 0 && (
        <WidgetContainer className="p-4 flex flex-col sm:flex-row gap-4 items-center bg-card/50">
          <div className="flex-1 w-full">
            <Input
              placeholder="Buscar cartão por nome, instituição ou final..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md h-12 bg-background/50 border-border/50"
            />
          </div>
        </WidgetContainer>
      )}

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCards.map((card) => (
            <CreditCardItem
              key={card.id}
              card={card}
              onArchive={(id) => {
                if (confirm("Tem certeza que deseja arquivar este cartão? O limite não será mais considerado.")) {
                  archiveMutation.mutate(id)
                }
              }}
              onToggleFavorite={(id, isFavorite) => toggleFavoriteMutation.mutate({ id, isFavorite })}
              onToggleActive={(id, isActive) => toggleActiveMutation.mutate({ id, isActive })}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CreditCard className="w-8 h-8" />}
          title={search ? "Nenhum cartão encontrado" : "Nenhum cartão de crédito"}
          description={
            search
              ? "Tente buscar por outros termos."
              : "Adicione seus cartões de crédito para centralizar suas faturas e limites."
          }
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                Limpar Busca
              </Button>
            ) : (
              <Link href="/dashboard/cards/new">
                <Button>Adicionar Primeiro Cartão</Button>
              </Link>
            )
          }
        />
      )}
    </div>
  )
}
