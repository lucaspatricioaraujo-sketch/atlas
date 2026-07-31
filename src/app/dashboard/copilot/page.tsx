import { AICopilotWorkspace } from "@/features/ai-copilot/components/AICopilotWorkspace"

export const metadata = {
  title: "AI Copilot | Atlas",
  description: "Seu assistente financeiro inteligente.",
}

export default function AICopilotPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AICopilotWorkspace />
    </div>
  )
}
