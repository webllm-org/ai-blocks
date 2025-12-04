"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Loader2, Expand, Copy, Check } from "lucide-react"

const DEFAULT_BRIEF_TEXT = "Meeting went well. Client liked proposal. Need to follow up on pricing. Schedule next call for Tuesday."

const DEFAULT_LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: "slightly expand with minimal additions, keep it concise",
  2: "moderately expand into a well-structured paragraph with context",
  3: "fully expand into detailed, professional prose with complete context and transitions"
}

const DEFAULT_LEVEL_LABELS = ["Brief", "Moderate", "Detailed"]

export interface TextExpanderDemoProps {
  /** Initial brief text to expand */
  defaultBriefText?: string
  /** Placeholder for the textarea */
  placeholder?: string
  /** Default expansion level (1-3) */
  defaultExpansionLevel?: number
  /** Level descriptions */
  levelDescriptions?: Record<number, string>
  /** Level labels for the slider */
  levelLabels?: string[]
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function TextExpanderDemo({
  defaultBriefText = DEFAULT_BRIEF_TEXT,
  placeholder = "Enter brief notes, bullet points, or short text...",
  defaultExpansionLevel = 2,
  levelDescriptions = DEFAULT_LEVEL_DESCRIPTIONS,
  levelLabels = DEFAULT_LEVEL_LABELS,
  temperature = 0.7,
  maxTokens = 400,
}: TextExpanderDemoProps = {}) {
  const [briefText, setBriefText] = useState(defaultBriefText)
  const [expandedText, setExpandedText] = useState("")
  const [expansionLevel, setExpansionLevel] = useState([defaultExpansionLevel]) // 1=brief, 2=moderate, 3=detailed
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleExpand = async () => {
    if (!briefText.trim()) return
    setIsLoading(true)
    setExpandedText("")

    try {
      const result = await generateText({
        prompt: `Expand these brief notes into well-written prose. ${levelDescriptions[expansionLevel[0] as keyof typeof levelDescriptions]}

Brief notes:
${briefText}

Expanded text:`,
        temperature,
        maxTokens,
      })
      setExpandedText(result.text.trim())
    } catch (error) {
      setExpandedText(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(expandedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={briefText}
        onChange={(e) => setBriefText(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Expansion Level</span>
          <span className="font-medium">{levelLabels[expansionLevel[0] - 1]}</span>
        </div>
        <Slider
          value={expansionLevel}
          onValueChange={setExpansionLevel}
          min={1}
          max={3}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Brief</span>
          <span>Moderate</span>
          <span>Detailed</span>
        </div>
      </div>

      <Button onClick={handleExpand} disabled={isLoading || !briefText.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Expanding...
          </>
        ) : (
          <>
            <Expand className="h-4 w-4 mr-2" />
            Expand Text
          </>
        )}
      </Button>

      {expandedText && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm whitespace-pre-wrap flex-1">{expandedText}</p>
              <Button variant="ghost" size="icon" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
              <span>Original: {briefText.length} chars</span>
              <span>Expanded: {expandedText.length} chars ({Math.round(expandedText.length / briefText.length)}x)</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
