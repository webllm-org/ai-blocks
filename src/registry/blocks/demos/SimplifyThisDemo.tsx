"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Minimize2, Copy, Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimplificationResult {
  simplified: string
  readingLevel: string
  changesNotes: string[]
}

const TARGET_LEVELS = [
  { id: "child", label: "Child-friendly", description: "Ages 8-10" },
  { id: "teen", label: "Teen", description: "Ages 13-16" },
  { id: "general", label: "General audience", description: "Easy to read" },
  { id: "technical", label: "Less technical", description: "Remove jargon" },
]

export interface SimplifyThisDemoProps {
  /** Default text to simplify */
  defaultText?: string
}

export function SimplifyThisDemo({
  defaultText = "The implementation of sophisticated algorithmic paradigms within distributed computing environments necessitates a comprehensive understanding of concurrent execution models and their associated synchronization primitives.",
}: SimplifyThisDemoProps = {}) {
  const [inputText, setInputText] = useState(defaultText)
  const [targetLevel, setTargetLevel] = useState("general")
  const [result, setResult] = useState<SimplificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSimplify = async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    setResult(null)

    const levelInfo = TARGET_LEVELS.find(l => l.id === targetLevel)

    try {
      const response = await generateText({
        prompt: `Simplify this text for a ${levelInfo?.label} (${levelInfo?.description}) audience:

Original: "${inputText}"

Requirements:
- Use simpler words and shorter sentences
- Maintain the core meaning
- Remove unnecessary complexity
- ${targetLevel === "child" ? "Use analogies and examples kids would understand" : ""}
- ${targetLevel === "technical" ? "Replace jargon with plain language, explain concepts simply" : ""}

Return as JSON:
{
  "simplified": "The simplified text",
  "readingLevel": "Estimated grade level (e.g., '5th grade', 'High school')",
  "changesNotes": ["What was simplified and why"]
}`,
        maxTokens: 400,
      })

      const parsed = JSON.parse(response.text)
      setResult(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.simplified)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Text to simplify</Label>
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste complex text here..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Target audience</Label>
        <div className="grid grid-cols-2 gap-2">
          {TARGET_LEVELS.map((level) => (
            <Button
              key={level.id}
              variant={targetLevel === level.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTargetLevel(level.id)}
              className="flex flex-col h-auto py-2"
            >
              <span>{level.label}</span>
              <span className="text-xs opacity-70">{level.description}</span>
            </Button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSimplify}
        disabled={isLoading || !inputText.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Simplifying...
          </>
        ) : (
          <>
            <Minimize2 className="h-4 w-4 mr-2" />
            Simplify Text
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{result.readingLevel}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground line-through">
                {inputText.slice(0, 100)}...
              </div>
              <div className="flex justify-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm">
                {result.simplified}
              </div>
            </div>

            {result.changesNotes && result.changesNotes.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground font-medium mb-1">Changes made:</p>
                <ul className="space-y-1">
                  {result.changesNotes.map((note, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Original: {inputText.split(/\s+/).filter(Boolean).length} words</span>
              <span>Simplified: {result.simplified.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
