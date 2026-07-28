"use client"

interface WelcomeHeaderProps {
  familyName?: string
}

export function WelcomeHeader({ familyName = "Família" }: WelcomeHeaderProps) {
  const now = new Date()
  const hour = now.getHours()

  let greeting = "Bom dia"
  if (hour >= 12 && hour < 18) greeting = "Boa tarde"
  if (hour >= 18) greeting = "Boa noite"

  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        {greeting} 👋
      </h1>
      <p className="text-muted-foreground mt-1">
        {familyName} &middot; {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
      </p>
    </div>
  )
}
