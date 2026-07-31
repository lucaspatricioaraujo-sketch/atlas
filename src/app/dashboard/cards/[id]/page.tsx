import { CardDetails } from "@/features/cards/components/CardDetails"

export const metadata = {
  title: "Detalhes do Cartão | Atlas",
  description: "Visualize faturas e configurações do cartão.",
}

export default function CardDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CardDetails id={params.id} />
    </div>
  )
}
