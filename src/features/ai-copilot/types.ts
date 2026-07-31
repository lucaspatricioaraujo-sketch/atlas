export type CopilotRole = "user" | "assistant" | "system"

export interface CopilotMessage {
  id: string
  role: CopilotRole
  content: string
  timestamp: string
  status?: "streaming" | "done" | "error"
}

export type RecommendationSeverity = "high" | "medium" | "low"
export type RecommendationActionType = "CREATE_BUDGET" | "SCHEDULE_PAYMENT" | "OPEN_REPORT" | "CREATE_GOAL" | "VIEW_CALENDAR" | "OPEN_TRANSACTION"

export interface AIRecommendation {
  id: string
  title: string
  description: string
  severity: RecommendationSeverity
  actionType?: RecommendationActionType
  actionLabel?: string
  actionData?: any
}

export interface AIDailyBriefing {
  date: string
  financialHealthScore: number
  currentBalance: number
  monthlySavingsRate: number
  upcomingBillsCount: number
  budgetStatus: "On Track" | "At Risk" | "Over Budget"
  summaryText: string
}

export interface AIProviderContext {
  familyId: string
  // Context to be passed into the provider (e.g. recent transactions, accounts, etc)
  kpis: any
  timeframe: { start: string, end: string }
}
