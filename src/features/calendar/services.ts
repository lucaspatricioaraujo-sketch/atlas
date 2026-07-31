import type { CalendarEvent, MonthlyInsightsData } from "./types"
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO } from "date-fns"

// Mock Data Storage
let MOCK_EVENTS: CalendarEvent[] = []

// Initialize some mock data for the current month
const initMockData = () => {
  if (MOCK_EVENTS.length > 0) return

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")

  MOCK_EVENTS = [
    {
      id: "evt_1",
      title: "Salário",
      amount: 8500,
      date: `${year}-${month}-05`,
      type: "INCOME",
      status: "COMPLETED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "evt_2",
      title: "Aluguel",
      amount: 2500,
      date: `${year}-${month}-10`,
      type: "EXPENSE",
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "evt_3",
      title: "Fatura Nubank",
      amount: 1850.5,
      date: `${year}-${month}-12`,
      type: "CREDIT_CARD_DUE",
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "evt_4",
      title: "Fechamento Nubank",
      amount: 0,
      date: `${year}-${month}-05`,
      type: "CREDIT_CARD_CLOSING",
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "evt_5",
      title: "Reserva de Emergência",
      amount: 500,
      date: `${year}-${month}-15`,
      type: "GOAL_CONTRIBUTION",
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const CalendarService = {
  getEventsByDateRange: async (familyId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> => {
    initMockData()
    await delay(600) // Simulate network
    
    // Filter events by date range
    return MOCK_EVENTS.filter(evt => evt.date >= startDate && evt.date <= endDate)
  },

  getMonthlyInsights: async (familyId: string, year: number, month: number): Promise<MonthlyInsightsData> => {
    initMockData()
    await delay(300)

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const end = endOfMonth(parseISO(startDate))
    const endDate = format(end, "yyyy-MM-dd")

    const monthEvents = MOCK_EVENTS.filter(evt => evt.date >= startDate && evt.date <= endDate)

    let expectedIncome = 0
    let expectedExpenses = 0
    let largestExpense: CalendarEvent | null = null
    let largestIncome: CalendarEvent | null = null

    const dailyTotals: Record<string, { income: number, expense: number }> = {}

    monthEvents.forEach(evt => {
      if (!dailyTotals[evt.date]) {
        dailyTotals[evt.date] = { income: 0, expense: 0 }
      }

      if (evt.type === "INCOME") {
        expectedIncome += evt.amount
        dailyTotals[evt.date].income += evt.amount
        if (!largestIncome || evt.amount > largestIncome.amount) {
          largestIncome = evt
        }
      } else if (evt.type === "EXPENSE" || evt.type === "CREDIT_CARD_DUE") {
        expectedExpenses += evt.amount
        dailyTotals[evt.date].expense += evt.amount
        if (!largestExpense || evt.amount > largestExpense.amount) {
          largestExpense = evt
        }
      }
    })

    let highestSpendingDay = null
    let highestIncomeDay = null
    
    for (const [date, totals] of Object.entries(dailyTotals)) {
      if (!highestSpendingDay || totals.expense > highestSpendingDay.amount) {
        highestSpendingDay = { date, amount: totals.expense }
      }
      if (!highestIncomeDay || totals.income > highestIncomeDay.amount) {
        highestIncomeDay = { date, amount: totals.income }
      }
    }

    return {
      expectedIncome,
      expectedExpenses,
      netCashFlow: expectedIncome - expectedExpenses,
      highestSpendingDay: highestSpendingDay?.amount ? highestSpendingDay : null,
      highestIncomeDay: highestIncomeDay?.amount ? highestIncomeDay : null,
      largestExpense,
      largestIncome
    }
  }
}
