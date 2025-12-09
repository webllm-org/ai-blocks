"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, MessageCircle, RefreshCw, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Excuse {
  excuse: string
  believability: number
  tone: string
  followUp: string
}

const SITUATIONS = [
  { id: "late-work", label: "Late to work", emoji: "🏃" },
  { id: "missed-meeting", label: "Missed a meeting", emoji: "📅" },
  { id: "forgot-birthday", label: "Forgot a birthday", emoji: "🎂" },
  { id: "late-reply", label: "Late email reply", emoji: "📧" },
  { id: "missed-deadline", label: "Missed a deadline", emoji: "⏰" },
  { id: "cancel-plans", label: "Need to cancel plans", emoji: "🙈" },
  { id: "homework", label: "Didn't do homework", emoji: "📚" },
  { id: "gym", label: "Skipped the gym", emoji: "💪" },
]

export interface ExcuseGeneratorDemoProps {
  /** Default situation */
  defaultSituation?: string
}

export function ExcuseGeneratorDemo({
  defaultSituation = "late-work",
}: ExcuseGeneratorDemoProps = {}) {
  const [situation, setSituation] = useState(defaultSituation)
  const [creativityLevel, setCreativityLevel] = useState([50])
  const [excuse, setExcuse] = useState<Excuse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const getCreativityLabel = () => {
    const level = creativityLevel[0]
    if (level < 33) return "Realistic"
    if (level < 66) return "Creative"
    return "Absurd"
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setExcuse(null)

    const situationInfo = SITUATIONS.find(s => s.id === situation)
    const level = creativityLevel[0]

    try {
      const response = await generateText({
        prompt: `Generate an excuse for this situation:

Situation: ${situationInfo?.label}
Creativity level: ${getCreativityLabel()} (${level}/100)

${level < 33 ? "Make it believable and realistic. Something that could actually happen." : ""}
${level >= 33 && level < 66 ? "Be creative but keep it plausible. Add interesting details." : ""}
${level >= 66 ? "Go wild! Make it absurd and funny. The more ridiculous the better." : ""}

Return as JSON:
{
  "excuse": "The full excuse (1-2 sentences)",
  "believability": ${level < 33 ? "85-95" : level < 66 ? "50-70" : "10-30"},
  "tone": "serious/apologetic/dramatic/comedic",
  "followUp": "What to say if they ask follow-up questions"
}

Be creative and entertaining!`,
        maxTokens: 250,
      })

      const parsed = JSON.parse(response.text)
      setExcuse(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!excuse) return
    await navigator.clipboard.writeText(excuse.excuse)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getBelievabilityColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-800"
    if (score >= 40) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">What situation do you need an excuse for?</Label>
          <Select value={situation} onValueChange={setSituation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITUATIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="flex items-center gap-2">
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Creativity level</Label>
            <Badge variant="outline">{getCreativityLabel()}</Badge>
          </div>
          <Slider
            value={creativityLevel}
            onValueChange={setCreativityLevel}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Realistic</span>
            <span>Absurd</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Thinking...
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4 mr-2" />
            Generate Excuse
          </>
        )}
      </Button>

      {excuse && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={getBelievabilityColor(excuse.believability)}>
                {excuse.believability}% believable
              </Badge>
              <Badge variant="outline">{excuse.tone}</Badge>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-lg">"{excuse.excuse}"</p>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">If they ask questions...</p>
              <p className="text-sm">"{excuse.followUp}"</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerate}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              ⚠️ For entertainment purposes only. Honesty is usually the best policy!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
