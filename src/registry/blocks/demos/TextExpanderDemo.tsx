"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Loader2, Expand, Copy, Check } from "lucide-react"

export function TextExpanderDemo() {
  const [briefText, setBriefText] = useState("Meeting went well. Client liked proposal. Need to follow up on pricing. Schedule next call for Tuesday.")
  const [expandedText, setExpandedText] = useState("")
  const [expansionLevel, setExpansionLevel] = useState([2]) // 1=brief, 2=moderate, 3=detailed
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleExpand = async () => {
    if (!briefText.trim() || !clientRef.current) return
    setIsLoading(true)
    setExpandedText("")

    const levelDescriptions = {
      1: "slightly expand with minimal additions, keep it concise",
      2: "moderately expand into a well-structured paragraph with context",
      3: "fully expand into detailed, professional prose with complete context and transitions"
    }

    try {
      const result = await clientRef.current.generateText({
        prompt: `Expand these brief notes into well-written prose. ${levelDescriptions[expansionLevel[0] as keyof typeof levelDescriptions]}

Brief notes:
${briefText}

Expanded text:`,
        temperature: 0.7,
        maxTokens: 400,
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

  const levelLabels = ["Brief", "Moderate", "Detailed"]

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={briefText}
        onChange={(e) => setBriefText(e.target.value)}
        placeholder="Enter brief notes, bullet points, or short text..."
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
