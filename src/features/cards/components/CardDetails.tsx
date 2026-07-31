"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Edit, AlertCircle, Loader2, Calendar, Receipt, TrendingUp, History } from "lucide-react"

import { useCard } from "../hooks/use-cards"
import { PREDEFINED_INSTITUTIONS } from "@/features/accounts/constants/institutions"

import { Button } from "@/components/ui/button"
import { PremiumCard } from "@/components/design/PremiumCard"
import { WidgetContainer } from "@/components/design/WidgetContainer"
import { MetricTile } from "@/components/design/MetricTile"
import { StatusBadge } from "@/components/design/StatusBadge"
import { formatCurrency } from "@/lib/formatters"

export function CardDetails({ id }: { id: string }) {
  const { data: card, isLoading, error } = useCard(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-medium text-destructive">Cartão não encontrado</h3>
        <Link href="/dashboard/cards">
          <Button variant="outline" className="mt-4">
            Voltar para Cartões
          </Button>
        </Link>
      </div>
    )
  }

  const institution = PREDEFINED_INSTITUTIONS.find(
    (inst) => inst.name.toLowerCase() === card.institution?.toLowerCase()
  )
  const bgColor = institution ? institution.primary_color : card.color || "#0f172a"
  
  const currentInvoiceAmount = (card.limit_amount - card.available_limit) || 0
  const utilizationPercentage = card.limit_amount > 0 ? (currentInvoiceAmount / card.limit_amount) * 100 : 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cards">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{card.name}</h2>
            {!card.is_active && (
              <StatusBadge variant="neutral">Inativo</StatusBadge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/transactions/new?type=EXPENSE&card_id=${card.id}`}>
            <Button variant="default" className="shadow-md">
              <Receipt className="h-4 w-4 mr-2" />
              Lançar
            </Button>
          </Link>
          <Link href={`/dashboard/cards/${card.id}/edit`}>
            <Button variant="outline" className="shadow-sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Card Summary */}
        <div className="lg:col-span-1 space-y-6">
          <PremiumCard className="overflow-hidden">
            <div 
              className="h-32 p-6 flex flex-col justify-between text-white"
              style={{ backgroundColor: bgColor }}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-lg drop-shadow-md">{card.institution || card.name}</span>
                {card.brand && <span className="font-medium opacity-80">{card.brand}</span>}
              </div>
              {card.last_four_digits && (
                <div className="font-mono text-lg tracking-widest mt-auto drop-shadow-md">
                  •••• {card.last_four_digits}
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Fechamento</p>
                  <div className="flex items-center gap-2 font-semibold">
                    <Calendar className="h-4 w-4 text-primary" />
                    Dia {card.closing_day || "--"}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Vencimento</p>
                  <div className="flex items-center gap-2 font-semibold">
                    <Calendar className="h-4 w-4 text-destructive" />
                    Dia {card.due_day || "--"}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground font-medium mb-2">Fatura Atual</p>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {formatCurrency(currentInvoiceAmount)}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Limite Disponível</span>
                    <span className="font-semibold text-success">{formatCurrency(card.available_limit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Limite Total</span>
                    <span className="font-semibold">{formatCurrency(card.limit_amount)}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full ${utilizationPercentage > 85 ? 'bg-destructive' : utilizationPercentage > 60 ? 'bg-warning' : 'bg-primary'}`} 
                      style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </PremiumCard>
          
          <WidgetContainer title="Open Finance" className="p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge variant={card.sync_status === "SYNCED" ? "success" : "warning"}>{card.sync_status}</StatusBadge>
            </div>
            <div className="flex items-center justify-between text-sm mt-3">
              <span className="text-muted-foreground">Última Sincronização</span>
              <span className="font-medium">{card.last_sync ? new Date(card.last_sync).toLocaleDateString() : "Nunca"}</span>
            </div>
          </WidgetContainer>
        </div>

        {/* Right Column: Invoice Mocks & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricTile 
              title="Parcelas Futuras (Estimado)" 
              value={formatCurrency(currentInvoiceAmount * 0.4)} 
              icon={<History className="h-4 w-4" />}
            />
            <MetricTile 
              title="Próxima Fatura (Estimada)" 
              value={formatCurrency(currentInvoiceAmount * 0.6)} 
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          <PremiumCard className="p-6 h-[400px] flex flex-col items-center justify-center border-dashed">
            <Receipt className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Timeline de Fatura e Parcelamentos</h3>
            <p className="text-muted-foreground text-center max-w-sm mt-2">
              A arquitetura de faturas será conectada automaticamente quando o motor de transações de crédito for inicializado.
            </p>
            <Button variant="outline" className="mt-6 pointer-events-none opacity-50">
              Visualizar Fatura Detalhada
            </Button>
          </PremiumCard>
        </div>

      </div>
    </div>
  )
}
