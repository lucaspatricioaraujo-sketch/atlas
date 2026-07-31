import { ReportsDashboard } from "@/features/reports/components/ReportsDashboard"

export const metadata = {
  title: "Relatórios & Insights | Atlas",
  description: "Centro de inteligência e saúde financeira.",
}

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ReportsDashboard />
    </div>
  )
}
