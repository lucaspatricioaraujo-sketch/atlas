import * as React from "react"
import Link from "next/link"
import { MoreHorizontal, CreditCard, Star, Activity, Receipt, TrendingUp, History, Archive, PowerOff, Wallet } from "lucide-react"

import type { Card } from "../types"
import { PREDEFINED_INSTITUTIONS } from "@/features/accounts/constants/institutions"

import { PremiumCard } from "@/components/design/PremiumCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/formatters"

interface CreditCardItemProps {
  card: Card
  onArchive?: (id: string) => void
  onToggleFavorite?: (id: string, isFavorite: boolean) => void
  onToggleActive?: (id: string, isActive: boolean) => void
}

export function CreditCardItem({ card, onArchive, onToggleFavorite, onToggleActive }: CreditCardItemProps) {
  // Find predefined institution if exists
  const institution = PREDEFINED_INSTITUTIONS.find(
    (inst) => inst.name.toLowerCase() === card.institution?.toLowerCase()
  )

  const bgColor = institution ? institution.primary_color : card.color || "#0f172a"
  const gradient = institution?.gradient || `from-[${bgColor}] to-slate-900`
  
  // Mocks for visual representation since we don't have invoices yet
  const currentInvoiceAmount = (card.limit_amount - card.available_limit) || 0
  const utilizationPercentage = card.limit_amount > 0 ? (currentInvoiceAmount / card.limit_amount) * 100 : 0
  
  // Format closing/due dates safely
  const closingDayStr = card.closing_day ? `Dia ${card.closing_day}` : "N/A"
  const dueDayStr = card.due_day ? `Dia ${card.due_day}` : "N/A"

  return (
    <PremiumCard className="flex flex-col overflow-visible group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Visual Card Representation */}
      <div 
        className={`relative h-48 m-4 rounded-xl overflow-hidden bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between text-white shadow-lg`}
        style={!institution?.gradient ? { backgroundColor: bgColor } : undefined}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h3 className="font-semibold text-lg tracking-tight drop-shadow-md">
              {card.name}
            </h3>
            {card.institution && (
              <p className="text-white/80 text-sm font-medium">{card.institution}</p>
            )}
          </div>
          <div className="flex gap-2">
            {card.is_favorite && (
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
            )}
            <CreditCard className="w-6 h-6 opacity-80" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-1 mt-auto">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                Limite Disponível
              </p>
              <p className="font-mono text-2xl font-bold tracking-tight">
                {formatCurrency(card.available_limit)}
              </p>
            </div>
            {card.last_four_digits && (
              <p className="font-mono text-white/80 text-lg tracking-widest drop-shadow-sm">
                •••• {card.last_four_digits}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Details & Actions section */}
      <div className="px-6 pb-6 pt-2 flex flex-col gap-5 flex-1">
        
        {/* Progress & Invoices */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Fatura Atual</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(currentInvoiceAmount)}
            </span>
          </div>
          <Progress value={utilizationPercentage} className="h-2" indicatorColor={utilizationPercentage > 85 ? "bg-destructive" : utilizationPercentage > 60 ? "bg-warning" : "bg-primary"} />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Uso: {utilizationPercentage.toFixed(1)}%</span>
            <span>Total: {formatCurrency(card.limit_amount)}</span>
          </div>
        </div>

        {/* Dates Info */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Fechamento</p>
            <p className="text-sm font-medium">{closingDayStr}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Vencimento</p>
            <p className="text-sm font-medium">{dueDayStr}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <Badge variant={card.is_active ? "outline" : "secondary"} className={card.is_active ? "text-success border-success/30 bg-success/5" : ""}>
            {card.is_active ? "Ativo" : "Inativo"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Ações do Cartão</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Lançamentos</DropdownMenuLabel>
              <DropdownMenuGroup>
                <Link href={`/dashboard/transactions/new?type=EXPENSE&card_id=${card.id}`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Receipt className="mr-2 h-4 w-4 text-rose-500" />
                    <span>Nova Compra</span>
                  </DropdownMenuItem>
                </Link>
                <Link href={`/dashboard/transactions/new?type=EXPENSE&account_id=${card.account_id}&description=Pagamento de Fatura`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <History className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>Pagar Fatura</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Gerenciamento</DropdownMenuLabel>
              <DropdownMenuGroup>
                <Link href={`/dashboard/cards/${card.id}`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Ver Detalhes</span>
                  </DropdownMenuItem>
                </Link>
                <Link href={`/dashboard/cards/${card.id}/edit`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Editar Cartão</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onToggleFavorite?.(card.id, !card.is_favorite)}
                >
                  <Star className={`mr-2 h-4 w-4 ${card.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  <span>{card.is_favorite ? 'Remover dos Favoritos' : 'Favoritar'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onToggleActive?.(card.id, !card.is_active)}
                >
                  <PowerOff className="mr-2 h-4 w-4" />
                  <span>{card.is_active ? 'Desativar Cartão' : 'Ativar Cartão'}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                onClick={() => onArchive?.(card.id)}
              >
                <Archive className="mr-2 h-4 w-4" />
                <span>Arquivar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </PremiumCard>
  )
}
