"use client"

import * as React from "react"
import { AIDailyBriefing } from "./AIDailyBriefing"
import { RecommendationCard } from "./RecommendationCard"
import { ChatWindow } from "./ChatWindow"
import { useAIRecommendations } from "../hooks/use-ai-copilot"
import { Sparkles, Loader2 } from "lucide-react"

export function AICopilotWorkspace() {
  const { data: recommendations, isLoading } = useAIRecommendations()

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-background relative">
      
      {/* Esquerda: Contexto, Daily Briefing e Recomendações */}
      <div className="w-full md:w-[400px] xl:w-[500px] border-r border-border/50 flex flex-col h-full bg-muted/10 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">AI Copilot</h2>
          </div>

          <AIDailyBriefing />

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Recomendações Pró-ativas
            </h3>

            <div className="flex flex-col gap-4">
              {isLoading && (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {recommendations?.map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Direita: Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
        <ChatWindow />
      </div>

    </div>
  )
}
