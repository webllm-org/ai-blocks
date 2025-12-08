"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Maximize2, Copy, Check, Diff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ExpandThisDemoProps {
  /** Default text to expand */
  defaultText?: string
}

export function ExpandThisDemo({
  defaultText = "AI is changing how we work.",
}: ExpandThisDemoProps = {}) {
  const [inputText, setInputText] = useState(defaultText)
  const [expansionLevel, setExpansionLevel] = useState([50])
  const [expandedText, setExpandedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const getExpansionLabel = () => {
    const level = expansionLevel[0]
    if (level < 30) return "Slight expansion (+50%)"
    if (level < 60) return "Moderate expansion (+100%)"
    return "Major expansion (+200%)"
  }

  const handleExpand = async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    setExpandedText("")

    const level = expansionLevel[0]
    const multiplier = level < 30 ? 1.5 : level < 60 ? 2 : 3

    try {
      const response = await generateText({
        prompt: `Expand this text to approximately ${Math.round(inputText.length * multiplier)} characters:

Original: "${inputText}"

Requirements:
- Add detail, examples, and elaboration
- Maintain the original meaning and tone
- Don't add tangential information
- Keep it natural and flowing
- Target length: ~${Math.round(inputText.split(' ').length * multiplier)} words

Just return the expanded text.`,
        maxTokens: 500,
      })

      setExpandedText(response.text.trim().replace(/^["']|["']$/g, ''))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(expandedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const calculateExpansion = () => {
    if (!expandedText || !inputText) return 0
    return Math.round(((expandedText.length - inputText.length) / inputText.length) * 100)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Text to expand</Label>
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter a brief text to expand..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {inputText.split(/\s+/).filter(Boolean).length} words, {inputText.length} characters
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Expansion level</Label>
          <span className="text-xs text-muted-foreground">{getExpansionLabel()}</span>
        </div>
        <Slider
          value={expansionLevel}
          onValueChange={setExpansionLevel}
          min={0}
          max={100}
          step={1}
        />
      </div>

      <Button
        onClick={handleExpand}
        disabled={isLoading || !inputText.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Expanding...
          </>
        ) : (
          <>
            <Maximize2 className="h-4 w-4 mr-2" />
            Expand Text
          </>
        )}
      </Button>

      {expandedText && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Diff className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-green-600">
                  +{calculateExpansion()}% expansion
                </span>
              </div>
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

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{expandedText}</p>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Original: {inputText.split(/\s+/).filter(Boolean).length} words</span>
              <span>Expanded: {expandedText.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
