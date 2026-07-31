import { CardsList } from "@/features/cards/components/CardsList"

export const metadata = {
  title: "Cartões de Crédito | Atlas",
  description: "Gerencie seus cartões de crédito e limites.",
}

export default function CardsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CardsList />
    </div>
  )
}
