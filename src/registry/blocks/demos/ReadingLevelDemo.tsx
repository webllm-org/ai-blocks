"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, BookOpen } from "lucide-react"

export interface ReadingLevel {
  id: string
  label: string
  description: string
  icon: string
}

const DEFAULT_LEVELS: ReadingLevel[] = [
  { id: "kid", label: "Kid", description: "Age 8-12", icon: "🧒" },
  { id: "teen", label: "Teen", description: "Age 13-17", icon: "🎓" },
  { id: "adult", label: "Adult", description: "General", icon: "👤" },
  { id: "expert", label: "Expert", description: "Technical", icon: "🔬" },
]

const DEFAULT_SAMPLE_TEXT = `Quantum computing represents a fundamental shift in computational paradigms. Unlike classical computers that use bits representing either 0 or 1, quantum computers utilize qubits that can exist in superposition states. This property, combined with quantum entanglement, enables quantum computers to solve certain problems exponentially faster than their classical counterparts, particularly in cryptography, optimization, and molecular simulation.`

const DEFAULT_LEVEL_INSTRUCTIONS: Record<string, string> = {
  kid: "for a child aged 8-12. Use simple words, short sentences, and fun analogies. Avoid jargon.",
  teen: "for a teenager. Use clear language, relatable examples, and explain technical terms.",
  adult: "for a general adult audience. Use clear, professional language with some technical terms explained.",
  expert: "for experts in the field. Use technical terminology, assume background knowledge, be precise and detailed.",
}

export interface ReadingLevelDemoProps {
  /** Available reading levels */
  levels?: ReadingLevel[]
  /** Initial text to adapt */
  defaultText?: string
  /** Default selected level ID */
  defaultLevelId?: string
  /** Level instructions mapping */
  levelInstructions?: Record<string, string>
  /** Placeholder for textarea */
  placeholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function ReadingLevelDemo({
  levels = DEFAULT_LEVELS,
  defaultText = DEFAULT_SAMPLE_TEXT,
  defaultLevelId = "teen",
  levelInstructions = DEFAULT_LEVEL_INSTRUCTIONS,
  placeholder = "Paste text to adapt to different reading levels...",
  temperature = 0.7,
  maxTokens = 400,
}: ReadingLevelDemoProps = {}) {
  const [originalText, setOriginalText] = useState(defaultText)
  const [adaptedText, setAdaptedText] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>(defaultLevelId)
  const [isLoading, setIsLoading] = useState(false)

  const handleAdapt = async () => {
    if (!originalText.trim()) return
    setIsLoading(true)
    setAdaptedText("")

    const level = levels.find(l => l.id === selectedLevel)

    try {
      const result = await generateText({
        prompt: `Rewrite this text ${levelInstructions[selectedLevel] || levelInstructions.adult}

Original text:
${originalText}

Rewritten for ${level?.label} (${level?.description}):`,
        temperature,
        maxTokens,
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
        placeholder={placeholder}
        rows={4}
      />

      <div className="flex flex-wrap gap-2">
        {levels.map((level) => (
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
              <span className="text-lg">{levels.find(l => l.id === selectedLevel)?.icon}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {levels.find(l => l.id === selectedLevel)?.label} Level
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{adaptedText}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
