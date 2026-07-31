"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Building2, 
  Landmark, 
  Wallet, 
  PiggyBank, 
  SmartphoneNfc, 
  MoreVertical, 
  Star,
  Archive,
  PowerOff,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Activity
} from "lucide-react"

import type { Account, AccountType } from "../types"
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

interface AccountCardProps {
  account: Account
  onToggleFavorite: (id: string, current: boolean) => void
  onToggleActive: (id: string, current: boolean) => void
  onArchive: (id: string) => void
}

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case "CHECKING": return Landmark
    case "SAVINGS": return PiggyBank
    case "CASH": return Wallet
    case "INVESTMENT": return Building2
    case "DIGITAL_WALLET": return SmartphoneNfc
    case "OTHER": return Wallet
    default: return Wallet
  }
}

const getAccountTypeName = (type: AccountType) => {
  switch (type) {
    case "CHECKING": return "Conta Corrente"
    case "SAVINGS": return "Conta Poupança"
    case "CASH": return "Dinheiro"
    case "INVESTMENT": return "Investimento"
    case "DIGITAL_WALLET": return "Carteira Digital"
    case "OTHER": return "Outro"
    default: return "Conta"
  }
}

export function AccountCard({ account, onToggleFavorite, onToggleActive, onArchive }: AccountCardProps) {
  const Icon = getAccountIcon(account.type)
  const isInactive = !account.is_active

  return (
    <PremiumCard className={cn(
      "relative transition-all duration-300 hover:shadow-md",
      isInactive && "opacity-75 grayscale-[0.5]"
    )}>
      {/* Absolute Favorite Star */}
      {account.is_favorite && (
        <div className="absolute top-4 left-4 text-warning">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: account.color || "var(--primary)" }}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground leading-tight">
                {account.name}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                {account.institution || getAccountTypeName(account.type)}
                {!account.is_active && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-xs font-medium text-danger">Inativa</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 -mr-2 items-center justify-center rounded-md border border-transparent bg-transparent hover:bg-muted text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Opções da conta</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <Link href={`/dashboard/accounts/${account.id}`}>
                <DropdownMenuItem className="cursor-pointer">
                  Ver detalhes
                </DropdownMenuItem>
              </Link>
              <Link href={`/dashboard/accounts/${account.id}/edit`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar conta
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lançamentos
              </div>
              <Link href={`/dashboard/transactions/new?type=INCOME&account_id=${account.id}`}>
                <DropdownMenuItem className="cursor-pointer text-success focus:text-success focus:bg-success/10">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Nova Receita
                </DropdownMenuItem>
              </Link>
              <Link href={`/dashboard/transactions/new?type=EXPENSE&account_id=${account.id}`}>
                <DropdownMenuItem className="cursor-pointer text-danger focus:text-danger focus:bg-danger/10">
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Nova Despesa
                </DropdownMenuItem>
              </Link>
              <Link href={`/dashboard/transactions/new?type=TRANSFER&account_id=${account.id}`}>
                <DropdownMenuItem className="cursor-pointer text-info focus:text-info focus:bg-info/10">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Transferência
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => onToggleFavorite(account.id, account.is_favorite)}
              >
                <Star className={cn("h-4 w-4 mr-2", account.is_favorite && "fill-current text-warning")} />
                {account.is_favorite ? "Remover favorito" : "Favoritar"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => onToggleActive(account.id, account.is_active)}
              >
                <PowerOff className="h-4 w-4 mr-2" />
                {account.is_active ? "Desativar conta" : "Reativar conta"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
                onClick={() => onArchive(account.id)}
              >
                <Archive className="h-4 w-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Saldo atual</p>
            {account.sync_status === "SYNCED" && (
              <div className="flex items-center text-[10px] text-muted-foreground/70" title="Última sincronização">
                <Clock className="h-3 w-3 mr-1" />
                {account.last_sync ? new Date(account.last_sync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hoje'}
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(account.balance)}
            </h4>
          </div>
          <div className="flex justify-between items-end pt-2">
            <p className="text-xs text-muted-foreground">
              Disponível: <span className="font-medium text-foreground">{formatCurrency(account.available_balance ?? account.balance)}</span>
            </p>
            {/* Sparkline Placeholder */}
            <div className="flex items-center text-success text-xs font-medium bg-success/10 px-1.5 py-0.5 rounded">
              <Activity className="h-3 w-3 mr-1" />
              +0.0%
            </div>
          </div>
        </div>

        {/* 30-day metrics placeholders */}
        <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Entradas (30d)</p>
            <p className="text-sm font-semibold text-success flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {formatCurrency(0)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Saídas (30d)</p>
            <p className="text-sm font-semibold text-foreground flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1 text-danger" />
              {formatCurrency(0)}
            </p>
          </div>
        </div>

        {/* Action button to view details */}
        <div className="mt-5 pt-3">
          <Link href={`/dashboard/accounts/${account.id}`}>
            <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5">
              Acessar Workspace
            </Button>
          </Link>
        </div>
      </div>
    </PremiumCard>
  )
}
