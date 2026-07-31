"use client"

import * as React from "react"
import { AICopilotService } from "../services"
import type { CopilotMessage } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Send, Sparkles, User, Loader2 } from "lucide-react"

export function ChatWindow() {
  const [messages, setMessages] = React.useState<CopilotMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá, Lucas! Sou seu copiloto financeiro. Estou analisando seu fluxo de caixa, cartões e contas no momento. Como posso te ajudar a tomar melhores decisões hoje?",
      timestamp: new Date().toISOString()
    }
  ])
  
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Add empty assistant message for streaming
    const assistantMsgId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      status: "streaming",
      timestamp: new Date().toISOString()
    }])

    try {
      const allMessages = [...messages, userMsg]
      const stream = AICopilotService.streamChatResponse("mock-family-id", allMessages)
      
      let currentText = ""
      for await (const chunk of stream) {
        currentText += chunk
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { ...m, content: currentText } : m
        ))
      }
      
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, status: "done" } : m
      ))
      
    } catch (err) {
      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, content: "Ocorreu um erro ao processar sua requisição.", status: "error" } : m
      ))
    } finally {
      setIsTyping(false)
    }
  }

  // Very simple custom markdown parser for the demo
  const renderMarkdown = (text: string) => {
    // This is a naive implementation just to show the UI capability
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-[13px] font-mono text-primary">$1</code>')
      .replace(/\n/g, '<br />')
    
    return <span dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto border-x border-border/30 bg-background/50 backdrop-blur-sm">
      
      {/* Header */}
      <div className="h-16 border-b border-border/50 flex items-center px-6 shrink-0 bg-background/80 backdrop-blur">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Assistente Financeiro
          </h3>
          <p className="text-xs text-muted-foreground">Conectado ao seu Analytics Engine</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-6 pb-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user"
            return (
              <div key={msg.id} className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"}`}>
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  isUser 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-muted/50 border border-border/50 text-foreground rounded-tl-sm"
                }`}>
                  <div className={`text-sm leading-relaxed ${isUser ? "" : "prose prose-sm dark:prose-invert max-w-none"}`}>
                    {msg.status === "streaming" && msg.content === "" ? (
                      <Loader2 className="w-4 h-4 animate-spin my-1" />
                    ) : (
                      renderMarkdown(msg.content)
                    )}
                    {msg.status === "streaming" && <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border/50 shrink-0">
        <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Faça uma pergunta sobre suas finanças..."
            className="pr-12 h-14 rounded-2xl border-border/60 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 top-2 h-10 w-10 rounded-xl"
            disabled={!input.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-center text-[11px] text-muted-foreground mt-3">
          O Copiloto pode cometer erros. Verifique informações importantes no painel de relatórios.
        </p>
      </div>
      
    </div>
  )
}
