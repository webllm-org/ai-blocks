"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Wrench, Calculator, Clock, CloudSun } from "lucide-react"

// Simulated tool functions
const tools = {
  calculate: (expr: string) => {
    try {
      // Simple safe evaluation for demo
      const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '')
      const result = Function(`"use strict"; return (${sanitized})`)()
      return `Result: ${result}`
    } catch {
      return "Could not calculate"
    }
  },
  getTime: () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  },
  getWeather: (city: string) => {
    // Simulated weather data
    const weather: Record<string, string> = {
      "new york": "72°F, Partly Cloudy",
      "london": "58°F, Rainy",
      "tokyo": "68°F, Clear",
      "paris": "65°F, Sunny",
      "default": "70°F, Clear skies"
    }
    return weather[city.toLowerCase()] || weather["default"]
  }
}

type Message = {
  role: "user" | "assistant" | "tool"
  content: string
  toolName?: string
}

export function ChatWithToolsDemo() {
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

  const parseToolCall = (text: string): { tool: string; args: string } | null => {
    // Match patterns like [TOOL: calculate(2+2)] or [TIME] or [WEATHER: london]
    const calcMatch = text.match(/\[TOOL:\s*calculate\(([^)]+)\)\]/i)
    if (calcMatch) return { tool: "calculate", args: calcMatch[1] }

    const timeMatch = text.match(/\[TIME\]/i)
    if (timeMatch) return { tool: "time", args: "" }

    const weatherMatch = text.match(/\[WEATHER:\s*([^\]]+)\]/i)
    if (weatherMatch) return { tool: "weather", args: weatherMatch[1] }

    return null
  }

  const sendMessage = async () => {
    if (!clientRef.current || !input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const result = await clientRef.current.generateText({
        prompt: `You are an assistant with access to tools. Use these tools when helpful:
- [TOOL: calculate(expression)] - Do math, e.g., [TOOL: calculate(15*3)]
- [TIME] - Get current time
- [WEATHER: city] - Get weather, e.g., [WEATHER: London]

Include the tool call in your response. After the tool result, provide a natural response.

User: ${userMessage}
Assistant:`,
        temperature: 0.7,
        maxTokens: 150,
      })

      const responseText = result.text.trim()
      const toolCall = parseToolCall(responseText)

      if (toolCall) {
        // Execute tool
        let toolResult = ""
        let toolName = ""

        if (toolCall.tool === "calculate") {
          toolResult = tools.calculate(toolCall.args)
          toolName = "Calculator"
        } else if (toolCall.tool === "time") {
          toolResult = tools.getTime()
          toolName = "Clock"
        } else if (toolCall.tool === "weather") {
          toolResult = tools.getWeather(toolCall.args)
          toolName = "Weather"
        }

        setMessages(prev => [
          ...prev,
          { role: "tool", content: toolResult, toolName }
        ])

        // Get final response with tool result
        const finalResult = await clientRef.current.generateText({
          prompt: `Tool result: ${toolResult}

Provide a brief, natural response to the user incorporating this result.`,
          temperature: 0.7,
          maxTokens: 80,
        })

        setMessages(prev => [...prev, { role: "assistant", content: finalResult.text.trim() }])
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: responseText }])
      }
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

  const getToolIcon = (toolName?: string) => {
    switch (toolName) {
      case "Calculator": return <Calculator className="h-3 w-3" />
      case "Clock": return <Clock className="h-3 w-3" />
      case "Weather": return <CloudSun className="h-3 w-3" />
      default: return <Wrench className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      {/* Available Tools */}
      <div className="flex gap-2 justify-center">
        <Badge variant="outline" className="text-xs">
          <Calculator className="h-3 w-3 mr-1" /> Math
        </Badge>
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" /> Time
        </Badge>
        <Badge variant="outline" className="text-xs">
          <CloudSun className="h-3 w-3 mr-1" /> Weather
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-72 pr-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Try asking for calculations, time, or weather...
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" :
                      message.role === "tool" ? "justify-center" : "justify-start"
                    }`}
                  >
                    {message.role === "tool" ? (
                      <Badge variant="secondary" className="gap-1">
                        {getToolIcon(message.toolName)}
                        {message.toolName}: {message.content}
                      </Badge>
                    ) : (
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                    )}
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
              placeholder="Ask something..."
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 justify-center">
        {["What's 145 × 23?", "What time is it?", "Weather in Tokyo?"].map(q => (
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
