"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, Flame, RefreshCw, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Roast {
  roast: string
  constructiveBit: string
  rating: number
  emoji: string
}

export interface RoastMyIdeaDemoProps {
  /** Default idea text */
  defaultIdea?: string
}

export function RoastMyIdeaDemo({
  defaultIdea = "An app that lets you rent out your spare fridge space to neighbors",
}: RoastMyIdeaDemoProps = {}) {
  const [idea, setIdea] = useState(defaultIdea)
  const [roastLevel, setRoastLevel] = useState([50])
  const [roast, setRoast] = useState<Roast | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getRoastLevelLabel = () => {
    const level = roastLevel[0]
    if (level < 25) return { label: "Gentle Tease", emoji: "😏" }
    if (level < 50) return { label: "Medium Roast", emoji: "🔥" }
    if (level < 75) return { label: "Extra Crispy", emoji: "🌶️" }
    return { label: "Nuclear", emoji: "☢️" }
  }

  const handleRoast = async () => {
    if (!idea.trim()) return
    setIsLoading(true)
    setRoast(null)

    const levelInfo = getRoastLevelLabel()
    const level = roastLevel[0]

    try {
      const response = await generateText({
        prompt: `Roast this startup/product idea:

"${idea}"

Roast level: ${levelInfo.label} (${level}/100)

${level < 25 ? "Be playful and light. More teasing than roasting." : ""}
${level >= 25 && level < 50 ? "Give a solid roast with some real observations." : ""}
${level >= 50 && level < 75 ? "Don't hold back. Point out the obvious flaws humorously." : ""}
${level >= 75 ? "DESTROY IT. Be brutally honest but still funny, not mean." : ""}

Return as JSON:
{
  "roast": "The roast (2-4 sentences, funny and specific)",
  "constructiveBit": "One tiny piece of actual useful feedback",
  "rating": ${Math.max(1, Math.floor(Math.random() * 4) + 1)},
  "emoji": "A single emoji reaction"
}

Be specific to the idea, not generic. Reference the actual concept.`,
        maxTokens: 300,
      })

      const parsed = JSON.parse(response.text)
      setRoast(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!roast) return
    const text = `My idea: "${idea.slice(0, 50)}..."\n\n🔥 Roast: ${roast.roast}\n\nRating: ${"🌟".repeat(roast.rating)}`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard!")
    }
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Your brilliant idea</Label>
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your startup idea, product concept, or life decision..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Roast level</Label>
          <Badge variant="outline">
            {getRoastLevelLabel().emoji} {getRoastLevelLabel().label}
          </Badge>
        </div>
        <Slider
          value={roastLevel}
          onValueChange={setRoastLevel}
          min={0}
          max={100}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Gentle</span>
          <span>Nuclear ☢️</span>
        </div>
      </div>

      <Button
        onClick={handleRoast}
        disabled={isLoading || !idea.trim()}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Roasting...
          </>
        ) : (
          <>
            <Flame className="h-4 w-4 mr-2" />
            Roast My Idea
          </>
        )}
      </Button>

      {roast && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl">{roast.emoji}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-xl",
                      i < roast.rating ? "opacity-100" : "opacity-20"
                    )}
                  >
                    🌟
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg font-medium">{roast.roast}</p>

            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Okay but actually...</p>
              <p className="text-sm">{roast.constructiveBit}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRoast}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Roast Again
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
