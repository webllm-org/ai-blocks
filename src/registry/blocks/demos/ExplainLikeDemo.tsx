"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Explanation {
  explanation: string
  keyAnalogy: string
  voiceQuirk: string
}

const PERSONAS = [
  { id: "pirate", label: "A Pirate", emoji: "🏴‍☠️", voice: "Arr matey!" },
  { id: "grandma", label: "Your Grandma", emoji: "👵", voice: "Oh dear..." },
  { id: "valley", label: "A Valley Girl", emoji: "💅", voice: "Like, totally!" },
  { id: "shakespeare", label: "Shakespeare", emoji: "🎭", voice: "Hark!" },
  { id: "cat", label: "A Cat", emoji: "🐱", voice: "Meow?" },
  { id: "alien", label: "An Alien", emoji: "👽", voice: "Greetings, human" },
  { id: "surfer", label: "A Surfer Bro", emoji: "🏄", voice: "Duuude!" },
  { id: "noir", label: "Film Noir Detective", emoji: "🕵️", voice: "It was a dark night..." },
]

export interface ExplainLikeDemoProps {
  /** Default topic */
  defaultTopic?: string
}

export function ExplainLikeDemo({
  defaultTopic = "How blockchain works",
}: ExplainLikeDemoProps = {}) {
  const [topic, setTopic] = useState(defaultTopic)
  const [selectedPersona, setSelectedPersona] = useState("pirate")
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExplain = async () => {
    if (!topic.trim()) return
    setIsLoading(true)
    setExplanation(null)

    const persona = PERSONAS.find(p => p.id === selectedPersona)

    try {
      const response = await generateText({
        prompt: `Explain this topic as if you were ${persona?.label}:

Topic: "${topic}"

Requirements:
- Stay completely in character
- Use vocabulary and speech patterns that fit the persona
- Make it educational but entertaining
- Include a relevant analogy or example
- Be creative with the voice

Return as JSON:
{
  "explanation": "The full explanation in character (3-5 sentences)",
  "keyAnalogy": "A simple analogy that fits the character",
  "voiceQuirk": "A characteristic phrase or interjection for this persona"
}

Be authentic to the character while actually explaining the topic well.`,
        maxTokens: 350,
      })

      const parsed = JSON.parse(response.text)
      setExplanation(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!explanation) return
    const persona = PERSONAS.find(p => p.id === selectedPersona)
    const text = `${persona?.emoji} Explain "${topic}" like ${persona?.label}:\n\n"${explanation.explanation}"\n\n${explanation.keyAnalogy}`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard!")
    }
  }

  const currentPersona = PERSONAS.find(p => p.id === selectedPersona)

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">What do you want explained?</Label>
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter any topic..."
          onKeyDown={(e) => e.key === "Enter" && handleExplain()}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Explain it like...</Label>
        <div className="grid grid-cols-4 gap-2">
          {PERSONAS.map((persona) => (
            <Button
              key={persona.id}
              variant={selectedPersona === persona.id ? "default" : "outline"}
              onClick={() => setSelectedPersona(persona.id)}
              className="flex flex-col h-auto py-3 gap-1"
            >
              <span className="text-2xl">{persona.emoji}</span>
              <span className="text-xs">{persona.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleExplain}
        disabled={isLoading || !topic.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Explaining...
          </>
        ) : (
          <>
            <span className="mr-2">{currentPersona?.emoji}</span>
            Explain Like {currentPersona?.label}
          </>
        )}
      </Button>

      {explanation && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentPersona?.emoji}</span>
              <div>
                <p className="font-medium">{currentPersona?.label}</p>
                <p className="text-sm text-muted-foreground italic">
                  "{explanation.voiceQuirk}"
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm leading-relaxed">{explanation.explanation}</p>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">In other words...</p>
              <p className="text-sm italic">{explanation.keyAnalogy}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExplain}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
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
