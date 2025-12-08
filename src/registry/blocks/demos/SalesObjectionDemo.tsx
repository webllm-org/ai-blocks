"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Target, MessageCircle, HelpCircle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const PROSPECT_TYPES = [
  { id: "price-sensitive", label: "Price Sensitive", avatar: "💰", style: "very focused on cost and ROI" },
  { id: "consensus", label: "Needs Consensus", avatar: "👥", style: "needs to get buy-in from multiple stakeholders" },
  { id: "happy-current", label: "Happy with Current", avatar: "😌", style: "satisfied with their current solution" },
  { id: "just-browsing", label: "Just Browsing", avatar: "👀", style: "not ready to buy, just exploring options" },
]

interface Message {
  role: "prospect" | "you"
  content: string
}

export interface SalesObjectionDemoProps {
  /** Default product/pitch description */
  defaultPitch?: string
}

export function SalesObjectionDemo({
  defaultPitch = "A CRM platform that uses AI to automate follow-ups and predict deal outcomes, starting at $99/user/month.",
}: SalesObjectionDemoProps = {}) {
  const [pitch, setPitch] = useState(defaultPitch)
  const [prospectType, setProspectType] = useState("price-sensitive")
  const [difficulty, setDifficulty] = useState([50])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [showCoaching, setShowCoaching] = useState(false)
  const [coaching, setCoaching] = useState("")

  const handleStart = async () => {
    if (!pitch.trim()) return
    setIsLoading(true)
    setStarted(true)
    setMessages([])

    const prospect = PROSPECT_TYPES.find(p => p.id === prospectType)
    const difficultyLevel = difficulty[0] < 33 ? "easy" : difficulty[0] < 66 ? "moderate" : "tough"

    try {
      const result = await generateText({
        prompt: `You are a ${difficultyLevel} prospect who is ${prospect?.style}. A salesperson is pitching:

"${pitch.trim()}"

Start with your initial reaction and an objection that matches your persona. Be realistic and conversational.`,
        maxTokens: 200,
      })

      setMessages([{ role: "prospect", content: result.text }])
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

    const prospect = PROSPECT_TYPES.find(p => p.id === prospectType)

    try {
      const result = await generateText({
        prompt: `You are a prospect who is ${prospect?.style}. The product being pitched is:
"${pitch}"

Conversation so far:
${messages.map(m => `${m.role === "prospect" ? "You" : "Salesperson"}: ${m.content}`).join("\n\n")}

Salesperson: ${input.trim()}

Respond as the prospect. Either raise another objection, ask a clarifying question, or show signs of warming up if they handled your objection well. Stay in character.`,
        maxTokens: 200,
      })

      setMessages(prev => [...prev, { role: "prospect", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetCoaching = async () => {
    if (messages.length < 2) return
    setIsLoading(true)

    const lastProspectMessage = messages.filter(m => m.role === "prospect").pop()
    const lastUserMessage = messages.filter(m => m.role === "you").pop()

    try {
      const result = await generateText({
        prompt: `A salesperson responded to this objection:

Prospect (${prospectType}): "${lastProspectMessage?.content}"
Salesperson: "${lastUserMessage?.content}"

How should they have handled this better? Give specific alternative responses and explain why they would work better for this type of prospect.`,
        maxTokens: 300,
      })

      setCoaching(result.text)
      setShowCoaching(true)
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
            <Label className="text-sm mb-2 block">Your Product/Pitch</Label>
            <Textarea
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Describe your product and value proposition..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">Prospect Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROSPECT_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={prospectType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setProspectType(type.id)}
                  className="justify-start"
                >
                  <span className="mr-2">{type.avatar}</span>
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Difficulty</Label>
            <div className="flex items-center gap-3">
              <span className="text-xs">Easy</span>
              <Slider
                value={difficulty}
                onValueChange={setDifficulty}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs">Tough</span>
            </div>
          </div>
        </div>

        <Button onClick={handleStart} disabled={isLoading || !pitch.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Target className="h-4 w-4 mr-2" />
          )}
          Start Roleplay
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{PROSPECT_TYPES.find(p => p.id === prospectType)?.avatar}</span>
        <span>{PROSPECT_TYPES.find(p => p.id === prospectType)?.label} Prospect</span>
      </div>

      <Card>
        <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg text-sm",
                msg.role === "prospect"
                  ? "bg-muted mr-8"
                  : "bg-primary text-primary-foreground ml-8"
              )}
            >
              <div className="text-xs font-medium mb-1">
                {msg.role === "prospect" ? "Prospect" : "You"}
              </div>
              {msg.content}
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
              <HelpCircle className="h-4 w-4 text-blue-500" />
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
          placeholder="Handle the objection..."
          className="min-h-[60px]"
        />
        <Button onClick={handleRespond} disabled={isLoading || !input.trim()} className="self-end">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleGetCoaching}
          disabled={isLoading || messages.length < 2}
          className="flex-1"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          How should I have handled that?
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setStarted(false)
            setMessages([])
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
