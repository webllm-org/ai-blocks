"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, HelpCircle, Send, RotateCcw, Lightbulb } from "lucide-react"

interface Message { role: "user" | "tutor"; content: string }

export function SocraticTutorDemo() {
  const [topic, setTopic] = useState("Why does ice float on water?")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)

  const startSession = async () => {
    if (!topic.trim()) return
    setIsLoading(true)
    setStarted(true)
    setMessages([])

    try {
      const result = await generateText({
        prompt: `You are a Socratic tutor. The student wants to understand: "${topic}"

Instead of explaining directly, ask ONE thought-provoking question that guides them to discover the answer themselves. Be encouraging but don't give away the answer.

Your first guiding question:`,
        temperature: 0.8,
        maxTokens: 150,
      })
      setMessages([{ role: "tutor", content: result.text.trim() }])
    } catch (error) {
      setMessages([{ role: "tutor", content: "Let's explore this together. What do you already know about this topic?" }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponse = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setInput("")
    setIsLoading(true)

    const history = messages.map(m => `${m.role === "tutor" ? "Tutor" : "Student"}: ${m.content}`).join("\n")

    try {
      const result = await generateText({
        prompt: `You are a Socratic tutor helping a student understand: "${topic}"

Conversation so far:
${history}
Student: ${userMsg}

Continue guiding with questions. If they're on the right track, acknowledge it and dig deeper. If they're stuck, give a small hint then ask another question. NEVER give the full answer directly. Keep responses brief (1-2 sentences).

Your response:`,
        temperature: 0.8,
        maxTokens: 150,
      })
      setMessages(prev => [...prev, { role: "tutor", content: result.text.trim() }])
    } catch {
      setMessages(prev => [...prev, { role: "tutor", content: "That's interesting! Can you tell me more about your thinking?" }])
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setStarted(false)
    setMessages([])
    setInput("")
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {!started ? (
        <>
          <div className="text-center py-4">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-sm text-muted-foreground">Learn through guided discovery</p>
          </div>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What do you want to understand?" />
          <Button onClick={startSession} disabled={isLoading || !topic.trim()} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HelpCircle className="h-4 w-4 mr-2" />}
            Start Learning
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Topic: {topic}</p>
            <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="h-3 w-3 mr-1" />New Topic</Button>
          </div>
          <Card className="min-h-[200px]">
            <CardContent className="p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-lg px-3 py-2 max-w-[85%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.role === "tutor" && <Lightbulb className="h-3 w-3 inline mr-1 text-yellow-500" />}
                    <span className="text-sm">{m.content}</span>
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex justify-start"><Loader2 className="h-4 w-4 animate-spin" /></div>}
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Your answer or thoughts..."
              onKeyDown={(e) => e.key === "Enter" && handleResponse()} disabled={isLoading} />
            <Button onClick={handleResponse} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
