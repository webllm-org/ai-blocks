"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"

interface ReviewSummary {
  overall: string
  pros: string[]
  cons: string[]
  rating: number
  reviewCount: number
}

const SAMPLE_REVIEWS = `"Absolutely love this product! Works exactly as described and shipping was fast."
"Good quality but a bit pricey. Would recommend waiting for a sale."
"Doesn't fit as expected, had to return. Customer service was helpful though."
"Five stars! Been using it daily for 3 months, no issues whatsoever."
"Decent product but the instructions were confusing. Took a while to set up."
"Best purchase I've made this year. Worth every penny!"
"Average quality for the price. Nothing special but does the job."
"Had some issues initially but after contacting support, everything works great now."`

export function ReviewSummarizerDemo() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS)
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleSummarize = async () => {
    if (!reviews.trim() || !clientRef.current) return
    setIsLoading(true)
    setSummary(null)

    try {
      const result = await clientRef.current.generateText({
        prompt: `Analyze these product reviews and provide a structured summary:

Reviews:
${reviews}

Respond with JSON only:
{"overall": "1-2 sentence summary", "pros": ["pro1", "pro2", "pro3"], "cons": ["con1", "con2"], "rating": 4.2, "reviewCount": ${reviews.split('\n').filter(r => r.trim()).length}}`,
        temperature: 0.5,
        maxTokens: 400,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setSummary(JSON.parse(jsonMatch[0]) as ReviewSummary)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={reviews}
        onChange={(e) => setReviews(e.target.value)}
        placeholder="Paste product reviews (one per line)..."
        rows={6}
      />

      <Button onClick={handleSummarize} disabled={isLoading || !reviews.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Analyzing Reviews...
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4 mr-2" />
            Summarize Reviews
          </>
        )}
      </Button>

      {summary && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {renderStars(summary.rating)}
                <span className="ml-2 font-medium">{summary.rating.toFixed(1)}</span>
              </div>
              <Badge variant="outline">
                {summary.reviewCount} reviews
              </Badge>
            </div>

            <p className="text-sm">{summary.overall}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Pros</span>
                </div>
                <ul className="space-y-1">
                  {summary.pros.map((pro, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-green-600">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Cons</span>
                </div>
                <ul className="space-y-1">
                  {summary.cons.map((con, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-red-600">-</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
