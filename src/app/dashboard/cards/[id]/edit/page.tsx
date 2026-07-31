"use client"

import * as React from "react"
import { useCard } from "@/features/cards/hooks/use-cards"
import { CardForm } from "@/features/cards/components/CardForm"
import { Loader2, AlertCircle } from "lucide-react"

export default function EditCardPage({ params }: { params: { id: string } }) {
  const { data: card, isLoading, error } = useCard(params.id)

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
        <h3 className="text-lg font-medium text-destructive">Erro ao carregar cartão</h3>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Editar Cartão</h2>
        <p className="text-muted-foreground">
          Atualize os dados e limites do seu cartão.
        </p>
      </div>
      <CardForm initialData={card} />
    </div>
  )
}
