export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-xl shadow-lg bg-card text-card-foreground">
        {children}
      </div>
    </div>
  )
}
