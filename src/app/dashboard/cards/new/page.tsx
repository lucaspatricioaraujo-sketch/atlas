import { CardForm } from "@/features/cards/components/CardForm"

export const metadata = {
  title: "Novo Cartão | Atlas",
  description: "Adicione um novo cartão de crédito.",
}

export default function NewCardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Adicionar Cartão</h2>
        <p className="text-muted-foreground">
          Preencha os dados do seu novo cartão de crédito.
        </p>
      </div>
      <CardForm />
    </div>
  )
}
