"use client"

import * as React from "react"
import type { AIRecommendation } from "../types"
import { AlertTriangle, Info, CheckCircle2, ArrowRight } from "lucide-react"

interface RecommendationCardProps {
  recommendation: AIRecommendation
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  
  const getIcon = () => {
    switch (recommendation.severity) {
      case "high": return <AlertTriangle className="w-5 h-5 text-destructive" />
      case "medium": return <Info className="w-5 h-5 text-warning" />
      case "low": return <CheckCircle2 className="w-5 h-5 text-success" />
    }
  }

  const getBorder = () => {
    switch (recommendation.severity) {
      case "high": return "border-l-4 border-l-destructive border-y-border/50 border-r-border/50"
      case "medium": return "border-l-4 border-l-warning border-y-border/50 border-r-border/50"
      case "low": return "border-l-4 border-l-success border-y-border/50 border-r-border/50"
    }
  }

  return (
    <div className={`bg-card rounded-r-xl rounded-l-sm border shadow-sm p-4 flex flex-col gap-2 ${getBorder()}`}>
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm leading-none">{recommendation.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            {recommendation.description}
          </p>
        </div>
      </div>

      {recommendation.actionLabel && (
        <div className="mt-2 ml-8">
          <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            {recommendation.actionLabel}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
