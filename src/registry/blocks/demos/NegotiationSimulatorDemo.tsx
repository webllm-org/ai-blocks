"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Handshake, Send, Pause, Award } from "lucide-react"
import { cn } from "@/lib/utils"

const SCENARIOS = [
  { id: "salary", label: "Salary Negotiation", context: "negotiating a job offer salary" },
  { id: "vendor", label: "Vendor Contract", context: "negotiating a vendor/supplier contract" },
  { id: "real-estate", label: "Real Estate", context: "negotiating a property purchase" },
  { id: "freelance", label: "Freelance Rate", context: "negotiating freelance project rate" },
]

const DIFFICULTY_LEVELS = [
  { id: "easy", label: "Cooperative", style: "willing to compromise and find middle ground" },
  { id: "medium", label: "Firm", style: "professional but holds their position" },
  { id: "hard", label: "Tough", style: "uses negotiation tactics and pushback" },
]

interface Message {
  role: "other" | "you"
  content: string
}

export interface NegotiationSimulatorDemoProps {
  /** Default scenario description */
  defaultScenario?: string
}

export function NegotiationSimulatorDemo({
  defaultScenario = "",
}: NegotiationSimulatorDemoProps = {}) {
  const [scenarioType, setScenarioType] = useState("salary")
  const [customScenario, setCustomScenario] = useState(defaultScenario)
  const [otherPartyPosition, setOtherPartyPosition] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [coaching, setCoaching] = useState("")
  const [showCoaching, setShowCoaching] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    setStarted(true)
    setMessages([])

    const scenario = SCENARIOS.find(s => s.id === scenarioType)
    const diff = DIFFICULTY_LEVELS.find(d => d.id === difficulty)
    const scenarioDesc = customScenario || scenario?.context

    try {
      const result = await generateText({
        prompt: `You are playing the other party in a negotiation about ${scenarioDesc}. You are ${diff?.style}.

${otherPartyPosition ? `Your position: ${otherPartyPosition}` : ""}

Start the negotiation with your opening position or response. Be realistic and conversational.`,
        maxTokens: 200,
      })

      setMessages([{ role: "other", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!input.trim()) return
    setIsLoading(true)
    setShowCoaching(false)

    const userMessage: Message = { role: "you", content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    const scenario = SCENARIOS.find(s => s.id === scenarioType)
    const diff = DIFFICULTY_LEVELS.find(d => d.id === difficulty)

    try {
      const result = await generateText({
        prompt: `You are the other party in a negotiation about ${customScenario || scenario?.context}. You are ${diff?.style}.

${otherPartyPosition ? `Your initial position: ${otherPartyPosition}` : ""}

Negotiation so far:
${messages.map(m => `${m.role === "other" ? "You" : "Other person"}: ${m.content}`).join("\n\n")}

Other person: ${input.trim()}

Respond as the negotiating party. React to their offer/argument and make a counter-proposal or push back as appropriate for your difficulty level.`,
        maxTokens: 200,
      })

      setMessages(prev => [...prev, { role: "other", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCoaching = async () => {
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Analyze this negotiation and provide coaching:

Scenario: ${customScenario || SCENARIOS.find(s => s.id === scenarioType)?.context}
Other party's position: ${otherPartyPosition || "Not specified"}

Negotiation:
${messages.map(m => `${m.role === "other" ? "Other party" : "You"}: ${m.content}`).join("\n\n")}

Provide:
1. What negotiation tactics were used (by both parties)
2. What worked well
3. Better alternatives for the next response
4. General negotiation tips for this situation`,
        maxTokens: 400,
      })

      setCoaching(result.text)
      setShowCoaching(true)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSummary = async () => {
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Summarize this negotiation session:

${messages.map(m => `${m.role === "other" ? "Other party" : "You"}: ${m.content}`).join("\n\n")}

Provide:
1. Overall assessment of how the negotiation went
2. Key moments and turning points
3. What worked and what didn't
4. Final outcome assessment`,
        maxTokens: 400,
      })

      setMessages(prev => [...prev, { role: "other", content: `📊 **Negotiation Summary**\n\n${result.text}` }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!started) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <div className="space-y-3">
          <div>
            <Label className="text-sm mb-2 block">Scenario Type</Label>
            <Select value={scenarioType} onValueChange={setScenarioType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCENARIOS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Custom Scenario (optional)</Label>
            <Textarea
              value={customScenario}
              onChange={(e) => setCustomScenario(e.target.value)}
              placeholder="Describe specific details of your negotiation..."
              className="min-h-[60px]"
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">Other Party's Position (optional)</Label>
            <Textarea
              value={otherPartyPosition}
              onChange={(e) => setOtherPartyPosition(e.target.value)}
              placeholder="What is the other party likely to want?"
              className="min-h-[60px]"
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">AI Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleStart} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Handshake className="h-4 w-4 mr-2" />
          )}
          Start Negotiation
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg text-sm",
                msg.role === "other"
                  ? "bg-muted mr-8"
                  : "bg-primary text-primary-foreground ml-8"
              )}
            >
              <div className="text-xs font-medium mb-1">
                {msg.role === "other" ? "Other Party" : "You"}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>

      {showCoaching && coaching && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Pause className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Coaching</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{coaching}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Make your offer or counter..."
          className="min-h-[60px]"
        />
        <Button onClick={handleRespond} disabled={isLoading || !input.trim()} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCoaching} disabled={isLoading} className="flex-1">
          <Pause className="h-4 w-4 mr-1" />
          Pause & Coach
        </Button>
        <Button variant="outline" onClick={handleEndSummary} disabled={isLoading} className="flex-1">
          <Award className="h-4 w-4 mr-1" />
          End & Summary
        </Button>
      </div>
    </div>
  )
}
