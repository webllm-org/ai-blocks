"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, FileText, RefreshCw } from "lucide-react"

const sampleArticle = {
  title: "The Future of Renewable Energy",
  content: `Solar power capacity has grown 20x in the last decade, making it the fastest-growing energy source globally. In 2023, solar installations exceeded 1.2 terawatts worldwide.

Wind energy has also seen remarkable growth, with offshore wind farms now capable of powering millions of homes. The largest offshore wind farm, Dogger Bank in the UK, will generate 3.6 GW when complete.

Battery storage technology is the key enabler for renewable adoption. Lithium-ion battery costs have dropped 90% since 2010, making grid-scale storage economically viable.

The International Energy Agency predicts renewables will account for 90% of new power capacity through 2025.`
}

type Message = {
  role: "user" | "assistant"
  content: string
}

export function ChatWithContextDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!clientRef.current || !input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const conversationContext = messages
        .slice(-6)
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n")

      const result = await clientRef.current.generateText({
        prompt: `You are a helpful assistant. Answer questions based on this article:

Title: ${sampleArticle.title}
Content: ${sampleArticle.content}

${conversationContext ? `Previous conversation:\n${conversationContext}\n` : ""}
User: ${userMessage}

Answer concisely based on the article content. If the question isn't covered, say so.
Assistant:`,
        temperature: 0.7,
        maxTokens: 200,
      })

      setMessages(prev => [...prev, { role: "assistant", content: result.text.trim() }])
    } catch (error) {
      console.error("Error:", error)
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => setMessages([])

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Context Article */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <CardTitle className="text-sm">{sampleArticle.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {sampleArticle.content.slice(0, 200)}...
          </p>
          <Badge variant="outline" className="mt-2 text-xs">
            Context loaded • {sampleArticle.content.split(" ").length} words
          </Badge>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-64 pr-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Ask questions about the article above...
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the article..."
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button onClick={clearChat} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-muted-foreground">Try asking:</span>
        {["How much has solar grown?", "What is Dogger Bank?", "Battery cost trends?"].map(q => (
          <Badge
            key={q}
            variant="secondary"
            className="cursor-pointer text-xs"
            onClick={() => setInput(q)}
          >
            {q}
          </Badge>
        ))}
      </div>
    </div>
  )
}
