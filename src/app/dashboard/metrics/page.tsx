import { ReportsDashboard } from "@/features/reports/components/ReportsDashboard"

export const metadata = {
  title: "Métricas & Insights | Atlas",
  description: "Métricas e inteligência financeira do Atlas.",
}

export default function MetricsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ReportsDashboard />
    </div>
  )
}
