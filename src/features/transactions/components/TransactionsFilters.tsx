"use client"

import * as React from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GlassCard } from "@/components/design/GlassCard"

export interface TransactionsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
}

export function TransactionsFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
}: TransactionsFiltersProps) {
  return (
    <GlassCard className="p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between border border-border/40">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar transações..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/30"
        />
      </div>
      
      <div className="flex w-full sm:w-auto items-center gap-3">
        <Select value={typeFilter} onValueChange={(val) => val && onTypeChange(val)}>
          <SelectTrigger className="w-full sm:w-[140px] bg-background/50 border-border/50">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os Tipos</SelectItem>
            <SelectItem value="INCOME">Receitas</SelectItem>
            <SelectItem value="EXPENSE">Despesas</SelectItem>
            <SelectItem value="TRANSFER">Transferências</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(val) => val && onStatusChange(val)}>
          <SelectTrigger className="w-full sm:w-[140px] bg-background/50 border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Qualquer Status</SelectItem>
            <SelectItem value="PAID">Pago</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="CANCELED">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" className="shrink-0 bg-background/50 border-border/50">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </GlassCard>
  )
}
