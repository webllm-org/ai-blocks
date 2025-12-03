"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Accessibility, ArrowRight } from "lucide-react"

const SAMPLE_TEXT = `The implementation of quantum cryptographic protocols necessitates the utilization of entangled photon pairs to facilitate secure key distribution mechanisms. The fundamental principle underlying this methodology relies on the Heisenberg uncertainty principle, which precludes the possibility of eavesdropping without introducing detectable perturbations to the quantum state.`

export function SimplifyTextDemo() {
  const [originalText, setOriginalText] = useState(SAMPLE_TEXT)
  const [simplifiedText, setSimplifiedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleSimplify = async () => {
    if (!originalText.trim() || !clientRef.current) return
    setIsLoading(true)
    setSimplifiedText("")

    try {
      const result = await clientRef.current.generateText({
        prompt: `Simplify this text for better accessibility. Use:
- Simple, common words
- Short sentences (under 15 words)
- Active voice
- No jargon or technical terms
- Explain concepts clearly

Original text:
${originalText}

Simplified version:`,
        temperature: 0.5,
        maxTokens: 300,
      })
      setSimplifiedText(result.text.trim())
    } catch (error) {
      setSimplifiedText(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getReadabilityScore = (text: string) => {
    const words = text.split(/\s+/).length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length
    const avgWordsPerSentence = sentences > 0 ? words / sentences : words

    if (avgWordsPerSentence < 10) return { score: "Easy", color: "text-green-600" }
    if (avgWordsPerSentence < 15) return { score: "Medium", color: "text-yellow-600" }
    if (avgWordsPerSentence < 20) return { score: "Hard", color: "text-orange-600" }
    return { score: "Very Hard", color: "text-red-600" }
  }

  const originalReadability = getReadabilityScore(originalText)
  const simplifiedReadability = simplifiedText ? getReadabilityScore(simplifiedText) : null

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="relative">
        <Textarea
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Paste complex text to simplify..."
          rows={4}
        />
        <div className="absolute bottom-2 right-2 text-xs">
          <span className={originalReadability.color}>{originalReadability.score}</span>
        </div>
      </div>

      <Button onClick={handleSimplify} disabled={isLoading || !originalText.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Simplifying...
          </>
        ) : (
          <>
            <Accessibility className="h-4 w-4 mr-2" />
            Simplify Text
          </>
        )}
      </Button>

      {simplifiedText && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Accessibility className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Simplified Version</span>
              {simplifiedReadability && (
                <div className="flex items-center gap-1 ml-auto text-xs">
                  <span className={originalReadability.color}>{originalReadability.score}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className={simplifiedReadability.color}>{simplifiedReadability.score}</span>
                </div>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{simplifiedText}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
