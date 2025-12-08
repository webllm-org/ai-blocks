"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, HelpCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "ai"
  content: string
}

interface DecisionMatrix {
  options: string[]
  criteria: string[]
  scores: Record<string, Record<string, number>>
}

export interface DecisionHelperDemoProps {
  /** Initial decision description */
  defaultDecision?: string
}

export function DecisionHelperDemo({
  defaultDecision = "",
}: DecisionHelperDemoProps = {}) {
  const [decision, setDecision] = useState(defaultDecision)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [stage, setStage] = useState<"options" | "criteria" | "analysis" | "summary">("options")
  const [matrix, setMatrix] = useState<DecisionMatrix | null>(null)

  const handleStart = async () => {
    if (!decision.trim()) return
    setIsLoading(true)
    setStarted(true)
    setMessages([])

    try {
      const result = await generateText({
        prompt: `You are a decision-making coach helping someone think through: "${decision}"

Start by acknowledging their decision and asking what options they're considering. Ask one clear question at a time. Don't give advice—help them think it through.`,
        maxTokens: 200,
      })

      setMessages([{ role: "ai", content: result.text }])
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

    const stagePrompt = stage === "options"
      ? "Now ask what criteria matter most to them in making this decision."
      : stage === "criteria"
      ? "Now ask what they're most worried about or afraid of with each option."
      : "Help them see the decision more clearly by reflecting back what you've heard."

    try {
      const result = await generateText({
        prompt: `You are a decision-making coach. Decision: "${decision}"

Conversation so far:
${messages.map(m => `${m.role === "ai" ? "You" : "Them"}: ${m.content}`).join("\n\n")}

Them: ${input.trim()}

${stagePrompt}

Remember: Don't give advice. Ask thoughtful questions that help them discover their own answer. Be warm and supportive.`,
        maxTokens: 200,
      })

      setMessages(prev => [...prev, { role: "ai", content: result.text }])

      // Progress through stages
      if (stage === "options" && messages.length >= 2) setStage("criteria")
      else if (stage === "criteria" && messages.length >= 4) setStage("analysis")
      else if (stage === "analysis" && messages.length >= 6) setStage("summary")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSummary = async () => {
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Based on this decision-making conversation:

Decision: "${decision}"

${messages.map(m => `${m.role === "ai" ? "Coach" : "Person"}: ${m.content}`).join("\n\n")}

Provide a summary reflection:
1. "What I heard you say" - summarize their key points
2. The options they're weighing
3. What seems to matter most to them
4. Any patterns or insights from the conversation

Don't make the decision for them—reflect back what you learned about their priorities.`,
        maxTokens: 400,
      })

      setMessages(prev => [...prev, { role: "ai", content: `📋 **Summary**\n\n${result.text}` }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!started) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <h3 className="font-medium mb-2">Decision Helper</h3>
            <p className="text-sm text-muted-foreground">
              I'll help you think through your decision with guided questions—no advice, just clarity.
            </p>
          </CardContent>
        </Card>

        <div>
          <Label className="text-sm mb-2 block">What decision are you facing?</Label>
          <Textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="e.g., Should I take the new job offer or stay at my current company?"
            className="min-h-[80px]"
          />
        </div>

        <Button onClick={handleStart} disabled={isLoading || !decision.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <>
              <HelpCircle className="h-4 w-4 mr-2" />
              Start Thinking It Through
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 text-sm">
        {["options", "criteria", "analysis", "summary"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                ["options", "criteria", "analysis", "summary"].indexOf(stage) >= i
                  ? "bg-primary"
                  : "bg-muted"
              )}
            />
            {i < 3 && <div className="w-8 h-0.5 bg-muted" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 max-h-[350px] overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg text-sm",
                msg.role === "ai"
                  ? "bg-muted mr-8"
                  : "bg-primary text-primary-foreground ml-8"
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts..."
          className="min-h-[60px]"
        />
        <Button onClick={handleRespond} disabled={isLoading || !input.trim()} className="self-end">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {messages.length >= 4 && (
        <Button variant="outline" onClick={handleSummary} disabled={isLoading} className="w-full">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Get Summary & Reflection
        </Button>
      )}
    </div>
  )
}
