"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  keywords: string[]
}

export function SentimentAnalysisDemo() {
  const [text, setText] = useState("I absolutely love this product! It's amazing and works perfectly.")
  const [result, setResult] = useState<SentimentResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      const response = await generateText({
        prompt: `Analyze the sentiment of this text and respond with JSON only: "${text}"

Format: {"sentiment": "positive|negative|neutral", "confidence": 0.0-1.0, "keywords": ["word1", "word2"]}`,
        temperature: 0.3,
        maxTokens: 200,
      })

      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]) as SentimentResult)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600 bg-green-100"
      case "negative": return "text-red-600 bg-red-100"
      default: return "text-yellow-600 bg-yellow-100"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to analyze..."
        rows={3}
      />
      <Button onClick={handleAnalyze} disabled={isLoading || !text.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Analyzing...
          </>
        ) : (
          "Analyze Sentiment"
        )}
      </Button>
      {result && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sentiment:</span>
              <Badge className={getSentimentColor(result.sentiment)}>
                {result.sentiment.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confidence:</span>
              <span className="text-sm">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-sm font-medium">Keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.keywords.map((kw, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
