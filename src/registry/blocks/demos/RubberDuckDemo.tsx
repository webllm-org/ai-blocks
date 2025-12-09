"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Bug, ArrowRight, PartyPopper, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "duck"
  content: string
}

export interface RubberDuckDemoProps {
  /** Initial bug description */
  defaultProblem?: string
}

export function RubberDuckDemo({
  defaultProblem = "",
}: RubberDuckDemoProps = {}) {
  const [problem, setProblem] = useState(defaultProblem)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [solved, setSolved] = useState(false)

  const handleStart = async () => {
    if (!problem.trim()) return
    setIsLoading(true)
    setStarted(true)
    setMessages([])
    setSolved(false)

    try {
      const result = await generateText({
        prompt: `You are a rubber duck debugger—a curious, friendly duck that helps developers debug by asking clarifying questions. You never give direct solutions; you help them discover the answer themselves.

The developer says: "${problem.trim()}"

Respond as the duck: acknowledge the problem warmly, then ask ONE simple clarifying question like a curious junior developer would. Keep it short and friendly. Use a duck emoji occasionally.`,
        maxTokens: 150,
      })

      setMessages([{ role: "duck", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!input.trim()) return
    setIsLoading(true)

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    try {
      const result = await generateText({
        prompt: `You are a rubber duck debugger helping with: "${problem}"

Conversation so far:
${messages.map(m => `${m.role === "duck" ? "Duck" : "Developer"}: ${m.content}`).join("\n\n")}

Developer: ${input.trim()}

As the rubber duck, ask ONE more clarifying question. Questions like:
- "What did you expect to happen?"
- "When did it last work?"
- "What changed since then?"
- "Can you walk me through that part?"
- "What happens right before the error?"

Be warm and curious. If they seem close to the answer, gently point them there with a question. Keep it short.`,
        maxTokens: 150,
      })

      setMessages(prev => [...prev, { role: "duck", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiguredOut = async () => {
    setIsLoading(true)
    setSolved(true)

    try {
      const result = await generateText({
        prompt: `The developer figured out their bug! Celebrate with them as the rubber duck. Be enthusiastic and congratulatory. Use duck and celebration emojis. Keep it short and fun.`,
        maxTokens: 80,
      })

      setMessages(prev => [...prev, { role: "duck", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStillStuck = async () => {
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `You are a rubber duck debugger. The developer is still stuck on: "${problem}"

Conversation:
${messages.map(m => `${m.role === "duck" ? "Duck" : "Developer"}: ${m.content}`).join("\n\n")}

Now, as the duck, give a gentle hint—not the solution, but point them in a direction they might not have considered. Stay in character but be a bit more helpful.`,
        maxTokens: 200,
      })

      setMessages(prev => [...prev, { role: "duck", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!started) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
          <CardContent className="p-6 text-center">
            <span className="text-4xl">🦆</span>
            <h3 className="font-medium mb-2 mt-2">Rubber Duck Debugger</h3>
            <p className="text-sm text-muted-foreground">
              Explain your bug to me. Talking it through often reveals the solution!
            </p>
          </CardContent>
        </Card>

        <div>
          <Textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Explain your bug or problem. What are you trying to do? What's happening instead?"
            className="min-h-[100px]"
          />
        </div>

        <Button onClick={handleStart} disabled={isLoading || !problem.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <>
              <Bug className="h-4 w-4 mr-2" />
              Talk to the Duck
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardContent className="p-4 max-h-[350px] overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg text-sm",
                msg.role === "duck"
                  ? "bg-yellow-50 dark:bg-yellow-950 mr-8"
                  : "bg-primary text-primary-foreground ml-8"
              )}
            >
              {msg.role === "duck" && <span className="text-lg mr-1">🦆</span>}
              <span className="whitespace-pre-wrap">{msg.content}</span>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Quack...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {!solved && (
        <>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Explain more..."
              className="min-h-[60px]"
            />
            <Button onClick={handleRespond} disabled={isLoading || !input.trim()} className="self-end">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleFiguredOut}
              disabled={isLoading}
              className="flex-1 bg-green-50 hover:bg-green-100 dark:bg-green-950"
            >
              <PartyPopper className="h-4 w-4 mr-1" />
              I figured it out!
            </Button>
            <Button
              variant="ghost"
              onClick={handleStillStuck}
              disabled={isLoading}
              className="flex-1"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Still stuck
            </Button>
          </div>
        </>
      )}

      {solved && (
        <Button
          onClick={() => {
            setStarted(false)
            setProblem("")
            setSolved(false)
          }}
          className="w-full"
        >
          Debug Another Issue
        </Button>
      )}
    </div>
  )
}
