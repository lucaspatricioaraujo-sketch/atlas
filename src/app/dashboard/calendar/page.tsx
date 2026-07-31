import { FinancialCalendar } from "@/features/calendar/components/FinancialCalendar"

export const metadata = {
  title: "Calendário Financeiro | Atlas",
  description: "Planejamento e visão mensal do seu fluxo de caixa.",
}

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full flex flex-col">
      <FinancialCalendar />
    </div>
  )
}
