"use client"

import { useState, useEffect, useCallback } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, GraduationCap, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const LEVELS = [
  { value: 0, label: "ELI5", description: "Like you're 5 years old" },
  { value: 20, label: "Middle School", description: "~12 years old" },
  { value: 40, label: "High School", description: "General audience" },
  { value: 60, label: "College", description: "Undergraduate level" },
  { value: 80, label: "Expert", description: "Professional level" },
  { value: 100, label: "PhD", description: "Research depth" },
]

interface Explanation {
  level: number
  text: string
  keyTerms: string[]
}

export interface ExplanationLevelDemoProps {
  /** Default topic */
  defaultTopic?: string
}

export function ExplanationLevelDemo({
  defaultTopic = "quantum entanglement",
}: ExplanationLevelDemoProps = {}) {
  const [topic, setTopic] = useState(defaultTopic)
  const [level, setLevel] = useState([40])
  const [explanations, setExplanations] = useState<Record<number, Explanation>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [followUp, setFollowUp] = useState("")

  const getCurrentLevel = () => {
    const val = level[0]
    return LEVELS.reduce((prev, curr) =>
      Math.abs(curr.value - val) < Math.abs(prev.value - val) ? curr : prev
    )
  }

  const fetchExplanation = useCallback(async (lvl: number) => {
    if (!topic.trim()) return
    if (explanations[lvl]) return // Already cached

    setIsLoading(true)

    const levelInfo = LEVELS.reduce((prev, curr) =>
      Math.abs(curr.value - lvl) < Math.abs(prev.value - lvl) ? curr : prev
    )

    try {
      const result = await generateText({
        prompt: `Explain "${topic}" at the ${levelInfo.label} level (${levelInfo.description}).

${levelInfo.value <= 20
  ? "Use simple words, analogies, and examples a child would understand. No jargon."
  : levelInfo.value <= 40
  ? "Use clear language with some technical terms explained. Good for general audiences."
  : levelInfo.value <= 60
  ? "Use proper terminology with explanations. Assume basic background knowledge."
  : levelInfo.value <= 80
  ? "Use technical language freely. Assume professional background."
  : "Academic depth. Assume expert knowledge. Include nuances and edge cases."
}

Format:
EXPLANATION: [your explanation]
KEY_TERMS: term1, term2, term3 (3-5 important terms at this level)`,
        maxTokens: 400,
      })

      const textMatch = result.text.match(/EXPLANATION:\s*([\s\S]*?)(?=KEY_TERMS:|$)/)
      const termsMatch = result.text.match(/KEY_TERMS:\s*([\s\S]*)/)

      const explanation: Explanation = {
        level: lvl,
        text: textMatch?.[1]?.trim() || result.text,
        keyTerms: termsMatch?.[1]?.split(",").map(t => t.trim()).filter(Boolean) || [],
      }

      setExplanations(prev => ({ ...prev, [lvl]: explanation }))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [topic, explanations])

  const handleGenerate = () => {
    setExplanations({})
    fetchExplanation(level[0])
  }

  const handleLevelChange = (newLevel: number[]) => {
    setLevel(newLevel)
    // Debounce the fetch
    const roundedLevel = Math.round(newLevel[0] / 20) * 20
    if (!explanations[roundedLevel]) {
      fetchExplanation(roundedLevel)
    }
  }

  const handleFollowUp = async () => {
    if (!followUp.trim()) return
    setIsLoading(true)

    const currentLevelInfo = getCurrentLevel()

    try {
      const result = await generateText({
        prompt: `Continuing the explanation of "${topic}" at ${currentLevelInfo.label} level.

Previous explanation: "${explanations[Math.round(level[0] / 20) * 20]?.text || ""}"

User asks: "${followUp}"

Answer at the same ${currentLevelInfo.label} level (${currentLevelInfo.description}).`,
        maxTokens: 250,
      })

      const currentLevel = Math.round(level[0] / 20) * 20
      setExplanations(prev => ({
        ...prev,
        [currentLevel]: {
          ...prev[currentLevel],
          text: prev[currentLevel].text + "\n\n**Q: " + followUp + "**\n" + result.text,
        },
      }))
      setFollowUp("")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentLevel = getCurrentLevel()
  const currentExplanation = explanations[Math.round(level[0] / 20) * 20]

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter any topic..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button onClick={handleGenerate} disabled={isLoading || !topic.trim()}>
          {isLoading && !currentExplanation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GraduationCap className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Complexity Level</Label>
          <Badge variant="secondary">{currentLevel.label}</Badge>
        </div>
        <Slider
          value={level}
          onValueChange={handleLevelChange}
          min={0}
          max={100}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>ELI5</span>
          <span>PhD</span>
        </div>
      </div>

      {currentExplanation ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge>{currentLevel.label}</Badge>
              <span className="text-xs text-muted-foreground">{currentLevel.description}</span>
            </div>

            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{currentExplanation.text}</div>
            </div>

            {currentExplanation.keyTerms.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Key terms:</p>
                <div className="flex flex-wrap gap-1">
                  {currentExplanation.keyTerms.map((term, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Adjusting explanation...</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Generating explanation...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <GraduationCap className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Enter a topic and click generate</p>
          </CardContent>
        </Card>
      )}

      {currentExplanation && (
        <div className="flex gap-2">
          <Input
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="I don't understand X..."
            onKeyDown={(e) => e.key === "Enter" && handleFollowUp()}
          />
          <Button
            variant="outline"
            onClick={handleFollowUp}
            disabled={isLoading || !followUp.trim()}
          >
            Ask
          </Button>
        </div>
      )}
    </div>
  )
}
