"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const TONES = [
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "casual", label: "Casual", emoji: "😊" },
  { id: "friendly", label: "Friendly", emoji: "🤗" },
  { id: "formal", label: "Formal", emoji: "🎩" },
  { id: "confident", label: "Confident", emoji: "💪" },
  { id: "empathetic", label: "Empathetic", emoji: "💝" },
  { id: "enthusiastic", label: "Enthusiastic", emoji: "🎉" },
  { id: "diplomatic", label: "Diplomatic", emoji: "🕊️" },
]

export interface ToneShifterDemoProps {
  /** Default input text */
  defaultText?: string
}

export function ToneShifterDemo({
  defaultText = "Hey, so about that thing you asked me to do - I couldn't get to it yet. Will try to finish it soon maybe.",
}: ToneShifterDemoProps = {}) {
  const [inputText, setInputText] = useState(defaultText)
  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  const [outputText, setOutputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShift = async (tone: string) => {
    if (!inputText.trim()) return
    setSelectedTone(tone)
    setIsLoading(true)
    setOutputText("")

    const toneInfo = TONES.find(t => t.id === tone)

    try {
      const response = await generateText({
        prompt: `Rewrite this text in a ${toneInfo?.label.toLowerCase()} tone:

Original: "${inputText}"

Requirements:
- Keep the same meaning and key information
- Adjust word choice, sentence structure, and phrasing to match the ${toneInfo?.label.toLowerCase()} tone
- Don't add new information
- Keep approximately the same length

Just return the rewritten text, no explanations.`,
        maxTokens: 300,
      })

      setOutputText(response.text.trim().replace(/^["']|["']$/g, ''))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Original text</Label>
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to transform..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Select tone</Label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((tone) => (
            <Button
              key={tone.id}
              variant={selectedTone === tone.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleShift(tone.id)}
              disabled={isLoading || !inputText.trim()}
              className="gap-1"
            >
              <span>{tone.emoji}</span>
              <span>{tone.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">
              Shifting tone...
            </p>
          </CardContent>
        </Card>
      )}

      {outputText && !isLoading && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge>
                {TONES.find(t => t.id === selectedTone)?.emoji}{" "}
                {TONES.find(t => t.id === selectedTone)?.label}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectedTone && handleShift(selectedTone)}
                  title="Regenerate"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
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
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{outputText}</p>
            </div>

            <div className="text-xs text-muted-foreground">
              Original: {inputText.length} chars → Result: {outputText.length} chars
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
