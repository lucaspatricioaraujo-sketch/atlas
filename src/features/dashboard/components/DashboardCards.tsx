"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

// ──────────────────────────────────────────────
// KPI Card (Financial Summary)
// ──────────────────────────────────────────────

interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function KpiCard({ title, value, icon: Icon, description, trend, className }: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className={cn(
            "text-xs mt-1",
            trend === "up" && "text-emerald-500",
            trend === "down" && "text-destructive",
            !trend && "text-muted-foreground"
          )}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Loading skeleton
export function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

// Error state
export function KpiCardError({ title }: { title: string }) {
  return (
    <Card className="border-destructive/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">Erro ao carregar</p>
      </CardContent>
    </Card>
  )
}

// Empty state
export function KpiCardEmpty({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Sem dados</p>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────
// Dashboard Section Card (reusable wrapper)
// ──────────────────────────────────────────────

interface DashboardSectionProps {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function DashboardSection({ title, description, children, action, className }: DashboardSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

// Section loading skeleton
export function DashboardSectionSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  )
}
