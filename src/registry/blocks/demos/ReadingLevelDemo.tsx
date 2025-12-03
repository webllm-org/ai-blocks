"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, BookOpen } from "lucide-react"

const LEVELS = [
  { id: "kid", label: "Kid", description: "Age 8-12", icon: "🧒" },
  { id: "teen", label: "Teen", description: "Age 13-17", icon: "🎓" },
  { id: "adult", label: "Adult", description: "General", icon: "👤" },
  { id: "expert", label: "Expert", description: "Technical", icon: "🔬" },
] as const

const SAMPLE_TEXT = `Quantum computing represents a fundamental shift in computational paradigms. Unlike classical computers that use bits representing either 0 or 1, quantum computers utilize qubits that can exist in superposition states. This property, combined with quantum entanglement, enables quantum computers to solve certain problems exponentially faster than their classical counterparts, particularly in cryptography, optimization, and molecular simulation.`

export function ReadingLevelDemo() {
  const [originalText, setOriginalText] = useState(SAMPLE_TEXT)
  const [adaptedText, setAdaptedText] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("teen")
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleAdapt = async () => {
    if (!originalText.trim() || !clientRef.current) return
    setIsLoading(true)
    setAdaptedText("")

    const level = LEVELS.find(l => l.id === selectedLevel)
    const levelInstructions = {
      kid: "for a child aged 8-12. Use simple words, short sentences, and fun analogies. Avoid jargon.",
      teen: "for a teenager. Use clear language, relatable examples, and explain technical terms.",
      adult: "for a general adult audience. Use clear, professional language with some technical terms explained.",
      expert: "for experts in the field. Use technical terminology, assume background knowledge, be precise and detailed.",
    }

    try {
      const result = await clientRef.current.generateText({
        prompt: `Rewrite this text ${levelInstructions[selectedLevel as keyof typeof levelInstructions]}

Original text:
${originalText}

Rewritten for ${level?.label} (${level?.description}):`,
        temperature: 0.7,
        maxTokens: 400,
      })
      setAdaptedText(result.text.trim())
    } catch (error) {
      setAdaptedText(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={originalText}
        onChange={(e) => setOriginalText(e.target.value)}
        placeholder="Paste text to adapt to different reading levels..."
        rows={4}
      />

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((level) => (
          <Button
            key={level.id}
            variant={selectedLevel === level.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLevel(level.id)}
            className="flex-1 min-w-[100px]"
          >
            <span className="mr-1">{level.icon}</span>
            <span className="flex flex-col items-start">
              <span>{level.label}</span>
            </span>
          </Button>
        ))}
      </div>

      <Button onClick={handleAdapt} disabled={isLoading || !originalText.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Adapting...
          </>
        ) : (
          <>
            <BookOpen className="h-4 w-4 mr-2" />
            Adapt Reading Level
          </>
        )}
      </Button>

      {adaptedText && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{LEVELS.find(l => l.id === selectedLevel)?.icon}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {LEVELS.find(l => l.id === selectedLevel)?.label} Level
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{adaptedText}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
