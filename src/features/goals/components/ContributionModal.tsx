"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAddContribution } from "../hooks/use-goals"

interface ContributionModalProps {
  goalId: string
}

export function ContributionModal({ goalId }: ContributionModalProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const addMutation = useAddContribution(goalId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    try {
      await addMutation.mutateAsync({
        amount: numAmount,
        contribution_date: new Date(date).toISOString(),
        notes: notes || undefined,
      })
      setOpen(false)
      setAmount("")
      setNotes("")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger 
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar Aporte
          </Button>
        }
      />
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Novo Aporte na Meta</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Aporte (R$)</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data do Aporte</Label>
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Nota sobre o depósito..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Registrando..." : "Confirmar Aporte"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
