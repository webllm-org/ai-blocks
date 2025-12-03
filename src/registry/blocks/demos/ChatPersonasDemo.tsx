"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, User } from "lucide-react"

const PERSONAS = [
  { id: "helpful", name: "Helpful Assistant", icon: "🤖", system: "You are a helpful, friendly assistant. Be concise and clear." },
  { id: "pirate", name: "Pirate Captain", icon: "🏴‍☠️", system: "You are a pirate captain. Respond in pirate speak with 'arr', 'matey', nautical terms, and pirate slang. Be enthusiastic!" },
  { id: "shakespeare", name: "Shakespeare", icon: "🎭", system: "You are William Shakespeare. Respond in Elizabethan English with thee, thou, hath, doth. Be poetic and dramatic." },
  { id: "chef", name: "French Chef", icon: "👨‍🍳", system: "You are a passionate French chef. Sprinkle in French words, be dramatic about food, and express strong culinary opinions." },
  { id: "detective", name: "Noir Detective", icon: "🕵️", system: "You are a 1940s noir detective. Be cynical, use metaphors, speak in short punchy sentences. The world is a dark place." },
] as const

interface Message {
  role: "user" | "assistant"
  content: string
}

export function ChatPersonasDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [persona, setPersona] = useState(PERSONAS[0])
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !clientRef.current || isLoading) return

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await clientRef.current.generateText({
        prompt: `${persona.system}\n\nUser: ${input.trim()}\n\nAssistant:`,
        temperature: 0.8,
        maxTokens: 200,
      })

      const assistantMessage: Message = { role: "assistant", content: result.text.trim() }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePersonaChange = (newPersona: typeof PERSONAS[number]) => {
    setPersona(newPersona)
    setMessages([])
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex flex-wrap gap-2">
        {PERSONAS.map((p) => (
          <Button
            key={p.id}
            variant={persona.id === p.id ? "default" : "outline"}
            size="sm"
            onClick={() => handlePersonaChange(p)}
          >
            <span className="mr-1">{p.icon}</span>
            {p.name}
          </Button>
        ))}
      </div>

      <Card>
        <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <span className="text-4xl mb-2">{persona.icon}</span>
              <p className="text-sm">Chat with {persona.name}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <span className="text-lg shrink-0">{persona.icon}</span>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <User className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center">
                  <span className="text-lg">{persona.icon}</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <CardContent className="p-4 pt-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Talk to ${persona.name}...`}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
