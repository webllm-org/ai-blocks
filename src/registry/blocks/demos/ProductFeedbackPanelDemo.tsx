"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Users, Plus, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface PersonaFeedback {
  name: string
  avatar: string
  perspective: string
  feedback: string
  concerns: string[]
  wouldUse: boolean
}

export interface ProductFeedbackPanelDemoProps {
  /** Default product description */
  defaultDescription?: string
}

export function ProductFeedbackPanelDemo({
  defaultDescription = "A mobile app that helps people track their daily water intake with smart reminders and integration with fitness trackers.",
}: ProductFeedbackPanelDemoProps = {}) {
  const [description, setDescription] = useState(defaultDescription)
  const [personas, setPersonas] = useState<PersonaFeedback[]>([])
  const [commonConcerns, setCommonConcerns] = useState<string[]>([])
  const [customPersona, setCustomPersona] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setIsLoading(true)
    setPersonas([])
    setCommonConcerns([])

    try {
      const result = await generateText({
        prompt: `Analyze this product idea from the perspective of different user personas:

Product: "${description.trim()}"

Generate feedback from 4 different user personas. For each persona, provide:
1. A descriptive name and their key characteristic
2. Their unique perspective/needs
3. Specific feedback about the product
4. Top concerns
5. Would they use it? (yes/no)

Format as JSON array:
[
  {
    "name": "Busy Parent",
    "avatar": "👨‍👧",
    "perspective": "Time-strapped, needs simple solutions",
    "feedback": "...",
    "concerns": ["concern1", "concern2"],
    "wouldUse": true
  }
]

Also identify common concerns across all personas.`,
        maxTokens: 1000,
      })

      const parsed = JSON.parse(result.text)
      if (Array.isArray(parsed)) {
        setPersonas(parsed)

        // Extract common concerns
        const allConcerns = parsed.flatMap(p => p.concerns || [])
        const concernCounts = allConcerns.reduce((acc, c) => {
          acc[c] = (acc[c] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const common = Object.entries(concernCounts)
          .filter(([_, count]) => count > 1)
          .map(([concern]) => concern)

        setCommonConcerns(common)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPersona = async () => {
    if (!customPersona.trim() || !description.trim()) return
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Analyze this product from the perspective of: "${customPersona}"

Product: "${description.trim()}"

Provide feedback as JSON:
{
  "name": "${customPersona}",
  "avatar": "relevant emoji",
  "perspective": "their key needs",
  "feedback": "detailed feedback",
  "concerns": ["concern1", "concern2"],
  "wouldUse": boolean
}`,
        maxTokens: 300,
      })

      const parsed = JSON.parse(result.text)
      setPersonas(prev => [...prev, parsed])
      setCustomPersona("")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div>
        <Label className="text-sm mb-2 block">Product Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product idea..."
          className="min-h-[80px]"
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !description.trim()}
        className="w-full"
      >
        {isLoading && personas.length === 0 ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Feedback...
          </>
        ) : (
          <>
            <Users className="h-4 w-4 mr-2" />
            Get User Feedback Panel
          </>
        )}
      </Button>

      {personas.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {personas.map((persona, i) => (
              <Card key={i} className={cn(
                "transition-all",
                persona.wouldUse ? "border-green-500/50" : "border-red-500/50"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{persona.avatar}</span>
                    <div>
                      <p className="font-medium">{persona.name}</p>
                      <p className="text-xs text-muted-foreground">{persona.perspective}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-3">{persona.feedback}</p>

                  {persona.concerns && persona.concerns.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Concerns:</p>
                      <ul className="text-xs space-y-1">
                        {persona.concerns.map((c, j) => (
                          <li key={j} className="text-red-600 dark:text-red-400">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={cn(
                    "text-xs font-medium px-2 py-1 rounded inline-block",
                    persona.wouldUse
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  )}>
                    {persona.wouldUse ? "✓ Would use" : "✗ Wouldn't use"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {commonConcerns.length > 0 && (
            <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-sm">Common Concerns</span>
                </div>
                <ul className="text-sm space-y-1">
                  {commonConcerns.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Input
              value={customPersona}
              onChange={(e) => setCustomPersona(e.target.value)}
              placeholder="Add custom persona (e.g., 'Senior citizen')"
              className="flex-1"
            />
            <Button
              onClick={handleAddPersona}
              disabled={isLoading || !customPersona.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
