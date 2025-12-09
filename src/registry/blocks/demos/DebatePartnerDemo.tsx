"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Swords, Timer, ArrowRight, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

const DEBATE_FORMATS = [
  { id: "oxford", label: "Oxford Style", description: "Formal proposition/opposition" },
  { id: "lincoln", label: "Lincoln-Douglas", description: "Value-based debate" },
  { id: "casual", label: "Casual", description: "Free-flowing discussion" },
]

interface DebateMessage {
  role: "you" | "opponent"
  content: string
  round?: string
}

export interface DebatePartnerDemoProps {
  /** Default debate topic */
  defaultTopic?: string
}

export function DebatePartnerDemo({
  defaultTopic = "AI will create more jobs than it eliminates",
}: DebatePartnerDemoProps = {}) {
  const [topic, setTopic] = useState(defaultTopic)
  const [yourSide, setYourSide] = useState<"for" | "against">("for")
  const [format, setFormat] = useState("casual")
  const [messages, setMessages] = useState<DebateMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(1)
  const [showScoring, setShowScoring] = useState(false)
  const [scoring, setScoring] = useState("")

  const handleStart = async () => {
    if (!topic.trim()) return
    setIsLoading(true)
    setStarted(true)
    setMessages([])
    setRound(1)

    const opponentSide = yourSide === "for" ? "against" : "for"
    const formatStyle = DEBATE_FORMATS.find(f => f.id === format)

    try {
      const result = await generateText({
        prompt: `You are debating ${opponentSide} the topic: "${topic}"
Format: ${formatStyle?.label}

Give your opening argument. Be persuasive, use logic and evidence. This is round 1 - Opening Statements.`,
        maxTokens: 300,
      })

      setMessages([{
        role: "opponent",
        content: result.text,
        round: "Opening Statement",
      }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!input.trim()) return
    setIsLoading(true)

    const userMessage: DebateMessage = {
      role: "you",
      content: input.trim(),
      round: round === 1 ? "Opening" : round === 2 ? "Rebuttal" : "Closing",
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    const opponentSide = yourSide === "for" ? "against" : "for"

    try {
      const result = await generateText({
        prompt: `You are debating ${opponentSide} the topic: "${topic}"

Debate so far:
${messages.map(m => `${m.role === "opponent" ? "You" : "Opponent"} (${m.round}): ${m.content}`).join("\n\n")}

Opponent: ${input.trim()}

${round >= 3 ? "This is the final round. Give your closing argument." : "Respond with a rebuttal, addressing their points directly."}`,
        maxTokens: 300,
      })

      setMessages(prev => [...prev, {
        role: "opponent",
        content: result.text,
        round: round === 1 ? "Rebuttal" : round >= 3 ? "Closing" : "Counter-Rebuttal",
      }])
      setRound(r => r + 1)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScoring = async () => {
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Judge this debate on: "${topic}"

Full debate:
${messages.map(m => `${m.role === "you" ? "Debater A (User)" : "Debater B (AI)"} - ${m.round}: ${m.content}`).join("\n\n")}

Provide scoring:
1. Argument strength (both sides)
2. Use of evidence
3. Rebuttal effectiveness
4. Key arguments the user missed
5. Overall winner and why`,
        maxTokens: 500,
      })

      setScoring(result.text)
      setShowScoring(true)
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
            <Label className="text-sm mb-2 block">Debate Topic</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a debate topic..."
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">Your Side</Label>
            <div className="flex gap-2">
              <Button
                variant={yourSide === "for" ? "default" : "outline"}
                onClick={() => setYourSide("for")}
                className="flex-1"
              >
                For / Pro
              </Button>
              <Button
                variant={yourSide === "against" ? "default" : "outline"}
                onClick={() => setYourSide("against")}
                className="flex-1"
              >
                Against / Con
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEBATE_FORMATS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <div>
                      <span className="font-medium">{f.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{f.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleStart} disabled={isLoading || !topic.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Swords className="h-4 w-4 mr-2" />
          )}
          Start Debate
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between text-sm">
        <Badge variant="outline">Round {round}</Badge>
        <span className="text-muted-foreground">
          You: {yourSide === "for" ? "Pro" : "Con"} | AI: {yourSide === "for" ? "Con" : "Pro"}
        </span>
      </div>

      <Card>
        <CardContent className="p-4 max-h-[350px] overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg",
                msg.role === "opponent"
                  ? "bg-muted mr-8"
                  : "bg-primary text-primary-foreground ml-8"
              )}
            >
              <div className="text-xs font-medium mb-1 flex items-center gap-2">
                {msg.role === "opponent" ? "🤖 Opponent" : "You"}
                {msg.round && (
                  <Badge variant="secondary" className="text-xs">
                    {msg.round}
                  </Badge>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>

      {showScoring && scoring && (
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-sm">Debate Scoring</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{scoring}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your argument..."
          className="min-h-[60px]"
        />
        <Button onClick={handleRespond} disabled={isLoading || !input.trim()} className="self-end">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleScoring}
          disabled={isLoading || messages.length < 4}
          className="flex-1"
        >
          <Trophy className="h-4 w-4 mr-1" />
          Get Scoring & Feedback
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setStarted(false)
            setMessages([])
            setShowScoring(false)
          }}
        >
          New Debate
        </Button>
      </div>
    </div>
  )
}
