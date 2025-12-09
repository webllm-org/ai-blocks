"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, PenLine, RefreshCw } from "lucide-react"

const PERSONAS = [
  {
    id: "hemingway",
    label: "Hemingway",
    avatar: "📝",
    description: "Cut the fluff. Simple, direct prose.",
    prompt: "Ernest Hemingway - favor short sentences, strong verbs, minimal adjectives, cut unnecessary words",
  },
  {
    id: "academic",
    label: "Academic",
    avatar: "🎓",
    description: "Add rigor and precision.",
    prompt: "Academic editor - add precision, proper citations style, formal tone, clear structure",
  },
  {
    id: "marketing",
    label: "Marketing",
    avatar: "📣",
    description: "Add punch and persuasion.",
    prompt: "Marketing copywriter - make it punchy, add emotional hooks, focus on benefits, compelling CTAs",
  },
  {
    id: "technical",
    label: "Technical",
    avatar: "⚙️",
    description: "Add precision and clarity.",
    prompt: "Technical writer - precise terminology, clear structure, avoid ambiguity, add specifics",
  },
]

export interface WritingCoachDemoProps {
  /** Default writing sample */
  defaultWriting?: string
}

export function WritingCoachDemo({
  defaultWriting = "Our company provides solutions that leverage synergies to deliver value-added services that empower stakeholders to achieve their goals in a sustainable manner.",
}: WritingCoachDemoProps = {}) {
  const [writing, setWriting] = useState(defaultWriting)
  const [selectedPersona, setSelectedPersona] = useState("hemingway")
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [rewritten, setRewritten] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null)

  const handleAnalyze = async (personaId: string) => {
    if (!writing.trim()) return
    setLoadingPersona(personaId)
    setIsLoading(true)

    const persona = PERSONAS.find(p => p.id === personaId)

    try {
      const result = await generateText({
        prompt: `You are ${persona?.prompt}. Review this writing and give specific feedback in that style:

"${writing.trim()}"

Provide:
1. What's wrong with this writing (from your perspective)
2. Specific line-by-line suggestions
3. A complete rewrite in your style

Format as:
## Feedback
[Your critique in character]

## Rewritten
[The improved version]`,
        maxTokens: 600,
      })

      const text = result.text
      const feedbackMatch = text.match(/## Feedback\n([\s\S]*?)(?=## Rewritten|$)/)
      const rewrittenMatch = text.match(/## Rewritten\n([\s\S]*)/)

      setFeedback(prev => ({
        ...prev,
        [personaId]: feedbackMatch?.[1]?.trim() || text,
      }))
      setRewritten(prev => ({
        ...prev,
        [personaId]: rewrittenMatch?.[1]?.trim() || "",
      }))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
      setLoadingPersona(null)
    }
  }

  const handleAnalyzeAll = async () => {
    for (const persona of PERSONAS) {
      await handleAnalyze(persona.id)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div>
        <Label className="text-sm mb-2 block">Your Writing</Label>
        <Textarea
          value={writing}
          onChange={(e) => setWriting(e.target.value)}
          placeholder="Paste your writing here..."
          className="min-h-[100px]"
        />
      </div>

      <Tabs value={selectedPersona} onValueChange={setSelectedPersona}>
        <TabsList className="grid grid-cols-4 w-full">
          {PERSONAS.map((persona) => (
            <TabsTrigger key={persona.id} value={persona.id}>
              <span className="mr-1">{persona.avatar}</span>
              <span className="hidden sm:inline">{persona.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {PERSONAS.map((persona) => (
          <TabsContent key={persona.id} value={persona.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{persona.label}</p>
                <p className="text-sm text-muted-foreground">{persona.description}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAnalyze(persona.id)}
                disabled={isLoading || !writing.trim()}
              >
                {loadingPersona === persona.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <PenLine className="h-4 w-4 mr-1" />
                    Get Feedback
                  </>
                )}
              </Button>
            </div>

            {feedback[persona.id] ? (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {persona.avatar} {persona.label} says:
                    </p>
                    <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                      {feedback[persona.id]}
                    </div>
                  </div>

                  {rewritten[persona.id] && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Rewritten in this style:
                      </p>
                      <div className="text-sm whitespace-pre-wrap border p-3 rounded bg-green-50 dark:bg-green-950">
                        {rewritten[persona.id]}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => setWriting(rewritten[persona.id])}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Use this version
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">
                    Click "Get Feedback" to hear from {persona.label}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Button
        variant="outline"
        onClick={handleAnalyzeAll}
        disabled={isLoading || !writing.trim()}
        className="w-full"
      >
        Compare All Personas
      </Button>
    </div>
  )
}
