import { useQuery } from "@tanstack/react-query"
import { AICopilotService } from "../services"
import { useSupabase } from "@/providers/supabase-provider"

export const COPILOT_DAILY_BRIEFING_KEY = "copilot_daily_briefing"
export const COPILOT_RECOMMENDATIONS_KEY = "copilot_recommendations"

export function useAIDailyBriefing() {
  const { familyId } = useSupabase()

  return useQuery({
    queryKey: [COPILOT_DAILY_BRIEFING_KEY, familyId],
    queryFn: () => AICopilotService.getDailyBriefing(familyId!),
    enabled: !!familyId
  })
}

export function useAIRecommendations() {
  const { familyId } = useSupabase()

  return useQuery({
    queryKey: [COPILOT_RECOMMENDATIONS_KEY, familyId],
    queryFn: () => AICopilotService.getRecommendations(familyId!),
    enabled: !!familyId
  })
}
