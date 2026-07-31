import { supabase } from "@/services/auth.service"
import type { AIDailyBriefing, AIRecommendation, CopilotMessage } from "./types"

export const AICopilotService = {
  async getDailyBriefing(familyId: string): Promise<AIDailyBriefing> {
    // Fake latency to simulate context fetching
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      date: new Date().toISOString(),
      financialHealthScore: 85,
      currentBalance: 12500,
      monthlySavingsRate: 15.4,
      upcomingBillsCount: 3,
      budgetStatus: "On Track",
      summaryText: "Bom dia, Lucas. Sua saúde financeira está excelente hoje! Você tem 3 contas que vencem nos próximos dias, mas o seu saldo atual de R$ 12.500 cobre tranquilamente essas despesas. Seu ritmo de gastos está 10% menor que o mês passado. Continue assim!"
    }
  },

  async getRecommendations(familyId: string): Promise<AIRecommendation[]> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return [
      {
        id: "rec-1",
        title: "Assinaturas Recorrentes Identificadas",
        description: "Notei que você possui 4 serviços de streaming ativos que totalizam R$ 180 mensais. Analisar essas assinaturas pode ajudar a atingir sua meta de poupança mais rápido.",
        severity: "medium",
        actionType: "OPEN_REPORT",
        actionLabel: "Revisar Assinaturas"
      },
      {
        id: "rec-2",
        title: "Orçamento de Lazer em Risco",
        description: "Você já gastou 85% do seu orçamento de Restaurantes e ainda faltam 15 dias para o fim do mês.",
        severity: "high",
        actionType: "CREATE_BUDGET",
        actionLabel: "Ajustar Orçamento"
      },
      {
        id: "rec-3",
        title: "Reserva de Emergência Próxima",
        description: "Faltam apenas R$ 500 para você atingir a meta da sua Reserva de Emergência!",
        severity: "low",
        actionType: "CREATE_GOAL",
        actionLabel: "Ver Meta"
      }
    ]
  },

  // Fake streaming implementation for the UI until real Vercel AI SDK is attached
  async *streamChatResponse(familyId: string, messages: CopilotMessage[]): AsyncGenerator<string, void, unknown> {
    const lastMessage = messages[messages.length - 1].content.toLowerCase()
    
    let fullResponse = "Desculpe, não entendi sua pergunta."
    
    if (lastMessage.includes("comida") || lastMessage.includes("food") || lastMessage.includes("alimentação")) {
      fullResponse = "Com base nos seus dados deste mês, você gastou **R$ 1.250,00** em Alimentação. Isso representa um aumento de `12%` em relação ao mês anterior.\n\nVocê gostaria que eu criasse um **Orçamento** para ajudar a controlar essa categoria?"
    } else if (lastMessage.includes("comprar") || lastMessage.includes("purchase") || lastMessage.includes("afford")) {
      fullResponse = "Fazendo uma simulação rápida: \nSe você gastar **R$ 2.500,00** hoje, seu saldo disponível cairá para **R$ 10.000,00**. Considerando suas despesas fixas cadastradas até o final do mês (R$ 4.200,00), você ainda terminará o mês no azul. \n\n✅ **Sim, você pode arcar com essa compra sem comprometer suas contas básicas.**"
    } else if (lastMessage.includes("guardado") || lastMessage.includes("poupança") || lastMessage.includes("saved")) {
      fullResponse = "Este ano você já poupou **R$ 14.500,00**!\n\nIsso equivale a uma média de `R$ 2.071,00` por mês. Você está no caminho certo para atingir sua meta anual."
    } else {
      fullResponse = "Analisando seu fluxo de caixa... \n\nSeu saldo previsto para o final da próxima semana é de **R$ 8.900,00**, já descontando o fechamento do seu Cartão Nubank.\n\nPosso te ajudar com algo mais específico?"
    }

    const words = fullResponse.split(" ")
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 40)) // 40ms per word fake typing
      yield word + " "
    }
  },

  // Expose Goals and Budgets to AI Copilot context builder payload
  async buildContextPayload(familyId: string) {
    const { data: goals } = await supabase
      .from("goals")
      .select("id, name, target_amount, current_amount, status")
      .eq("family_id", familyId)

    const { data: budgets } = await supabase
      .from("budgets")
      .select("id, name, total_limit, period")
      .eq("family_id", familyId)

    return {
      goals: goals || [],
      budgets: budgets || [],
    }
  }
}
