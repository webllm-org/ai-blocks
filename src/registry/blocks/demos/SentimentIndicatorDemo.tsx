"use client"

import { useState, useEffect, useRef } from "react"
import { generateText } from "@webllm/client"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SentimentScore {
  overall: "positive" | "neutral" | "negative"
  confidence: number
  emotions?: {
    joy: number
    anger: number
    frustration: number
    satisfaction: number
  }
}

export interface SentimentIndicatorDemoProps {
  /** Initial text */
  defaultText?: string
  /** Debounce delay in ms */
  debounceMs?: number
}

export function SentimentIndicatorDemo({
  defaultText = "",
  debounceMs = 1000,
}: SentimentIndicatorDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [sentiment, setSentiment] = useState<SentimentScore | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  const analyzeSentiment = async (input: string) => {
    if (!input.trim() || input.length < 10) {
      setSentiment(null)
      return
    }

    setIsAnalyzing(true)

    try {
      const result = await generateText({
        prompt: `Analyze the sentiment of this text:

"${input}"

Provide:
1. Overall sentiment (positive/neutral/negative)
2. Confidence (0-100)
3. Emotion scores (0-100 each): joy, anger, frustration, satisfaction

Format as JSON:
{
  "overall": "positive",
  "confidence": 85,
  "emotions": {"joy": 70, "anger": 0, "frustration": 5, "satisfaction": 60}
}`,
        maxTokens: 150,
      })

      const parsed = JSON.parse(result.text)
      setSentiment(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      analyzeSentiment(text)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [text, debounceMs])

  const getSentimentColor = () => {
    if (!sentiment) return "bg-gray-400"
    switch (sentiment.overall) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getSentimentEmoji = () => {
    if (!sentiment) return "😐"
    switch (sentiment.overall) {
      case "positive":
        return "😊"
      case "negative":
        return "😠"
      default:
        return "😐"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing to see real-time sentiment analysis..."
          className="min-h-[120px] pr-12"
        />

        {/* Sentiment indicator */}
        <div
          className="absolute top-2 right-2 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
          title={sentiment ? `${sentiment.overall} (${sentiment.confidence}% confident)` : "Type more to analyze"}
        >
          {isAnalyzing ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <div className="relative">
              <div
                className={cn(
                  "h-6 w-6 rounded-full transition-colors",
                  getSentimentColor()
                )}
              />
              <span className="absolute -bottom-1 -right-1 text-sm">
                {getSentimentEmoji()}
              </span>
            </div>
          )}
        </div>
      </div>

      {sentiment && showDetails && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                className={cn(
                  sentiment.overall === "positive" && "bg-green-100 text-green-800",
                  sentiment.overall === "negative" && "bg-red-100 text-red-800",
                  sentiment.overall === "neutral" && "bg-yellow-100 text-yellow-800"
                )}
              >
                {sentiment.overall}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {sentiment.confidence}% confident
              </span>
            </div>

            {sentiment.emotions && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Emotions detected:</p>
                {Object.entries(sentiment.emotions).map(([emotion, score]) => (
                  <div key={emotion} className="flex items-center gap-2">
                    <span className="text-xs w-20 capitalize">{emotion}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          emotion === "joy" || emotion === "satisfaction"
                            ? "bg-green-500"
                            : "bg-red-500"
                        )}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {sentiment
          ? "Click the indicator for details"
          : "Type at least 10 characters for sentiment analysis"
        }
      </p>
    </div>
  )
}
