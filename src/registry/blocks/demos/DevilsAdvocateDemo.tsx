"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Scale, ArrowRight, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const MODES = [
  { id: "devils-advocate", label: "Devil's Advocate", description: "Argues against your position" },
  { id: "steelman", label: "Steelman", description: "Makes the strongest case for opposing view" },
  { id: "socratic", label: "Socratic Questions", description: "Challenges with probing questions" },
]

interface CounterPoint {
  point: string
  strength: "strong" | "moderate" | "weak"
}

export interface DevilsAdvocateDemoProps {
  /** Default position */
  defaultPosition?: string
}

export function DevilsAdvocateDemo({
  defaultPosition = "I think we should rewrite our codebase in Rust",
}: DevilsAdvocateDemoProps = {}) {
  const [position, setPosition] = useState(defaultPosition)
  const [mode, setMode] = useState("devils-advocate")
  const [intensity, setIntensity] = useState([50])
  const [counterArguments, setCounterArguments] = useState<string>("")
  const [conversation, setConversation] = useState<Array<{ role: "user" | "ai"; content: string }>>([])
  const [counterInput, setCounterInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!position.trim()) return
    setIsLoading(true)
    setCounterArguments("")
    setConversation([])

    const selectedMode = MODES.find(m => m.id === mode)
    const intensityLevel = intensity[0] < 33 ? "mild" : intensity[0] < 66 ? "moderate" : "aggressive"

    try {
      const result = await generateText({
        prompt: `You are playing ${selectedMode?.label}. The user holds this position:

"${position.trim()}"

${mode === "socratic"
  ? `Ask 3-5 probing questions that challenge their thinking. Be ${intensityLevel} in your questioning.`
  : `Present ${intensityLevel} counter-arguments against this position. Give 3-4 strong points.`
}

End with a summary of the strongest counter-points they should consider.`,
        maxTokens: 600,
      })

      setCounterArguments(result.text)
      setConversation([
        { role: "user", content: position },
        { role: "ai", content: result.text },
      ])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCounter = async () => {
    if (!counterInput.trim()) return
    setIsLoading(true)

    const newConversation = [
      ...conversation,
      { role: "user" as const, content: counterInput },
    ]
    setConversation(newConversation)
    setCounterInput("")

    try {
      const result = await generateText({
        prompt: `Continue playing Devil's Advocate. The debate so far:

${newConversation.map(m => `${m.role === "user" ? "User" : "You"}: ${m.content}`).join("\n\n")}

Respond to their latest point, continuing to challenge their position.`,
        maxTokens: 400,
      })

      setConversation([
        ...newConversation,
        { role: "ai", content: result.text },
      ])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {conversation.length === 0 ? (
        <>
          <div className="space-y-3">
            <div>
              <Label className="text-sm mb-2 block">Your Position</Label>
              <Textarea
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="State a position you hold..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Mode</Label>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <Button
                    key={m.id}
                    variant={mode === m.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode(m.id)}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {MODES.find(m => m.id === mode)?.description}
              </p>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Intensity</Label>
              <div className="flex items-center gap-3">
                <span className="text-xs">Mild</span>
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs">Aggressive</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !position.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Scale className="h-4 w-4 mr-2" />
                Challenge My Thinking
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto space-y-4">
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-lg",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground ml-8"
                      : "bg-muted mr-8"
                  )}
                >
                  <div className="text-xs font-medium mb-1">
                    {msg.role === "user" ? "Your Position" : "Devil's Advocate"}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
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
              value={counterInput}
              onChange={(e) => setCounterInput(e.target.value)}
              placeholder="Counter that point..."
              className="min-h-[60px]"
            />
            <Button
              onClick={handleCounter}
              disabled={isLoading || !counterInput.trim()}
              className="self-end"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setConversation([])
              setCounterArguments("")
            }}
            className="w-full"
          >
            Start New Debate
          </Button>
        </>
      )}
    </div>
  )
}
