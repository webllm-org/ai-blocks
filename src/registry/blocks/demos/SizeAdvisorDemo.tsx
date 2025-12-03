"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Ruler, Check } from "lucide-react"

interface SizeRecommendation {
  recommendedSize: string
  confidence: "high" | "medium" | "low"
  reasoning: string
  tips: string[]
  alternativeSize?: string
}

const FIT_PREFERENCES = [
  { id: "tight", label: "Tight/Fitted" },
  { id: "regular", label: "Regular" },
  { id: "relaxed", label: "Relaxed" },
  { id: "oversized", label: "Oversized" },
] as const

export function SizeAdvisorDemo() {
  const [height, setHeight] = useState("5'10\"")
  const [weight, setWeight] = useState("170 lbs")
  const [fit, setFit] = useState<string>("regular")
  const [productInfo, setProductInfo] = useState("Cotton t-shirt, unisex sizing, US sizes S/M/L/XL/XXL")
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGetSize = async () => {
    if (!height.trim() || !weight.trim()) return
    setIsLoading(true)
    setRecommendation(null)

    try {
      const result = await generateText({
        prompt: `Recommend a clothing size based on these details:

Height: ${height}
Weight: ${weight}
Preferred fit: ${fit}
Product: ${productInfo}

Provide a size recommendation with reasoning.

Respond in JSON format:
{
  "recommendedSize": "M",
  "confidence": "high" or "medium" or "low",
  "reasoning": "Why this size is recommended",
  "tips": ["Tip 1", "Tip 2"],
  "alternativeSize": "L (if between sizes)"
}`,
        temperature: 0.5,
        maxTokens: 300,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setRecommendation(JSON.parse(jsonMatch[0]) as SizeRecommendation)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const confidenceColors = {
    high: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-orange-100 text-orange-800",
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Height</p>
          <Input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={'e.g., 5\'10" or 178cm'}
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Weight</p>
          <Input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g., 170 lbs or 77kg"
          />
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Preferred Fit</p>
        <div className="flex flex-wrap gap-2">
          {FIT_PREFERENCES.map((pref) => (
            <Button
              key={pref.id}
              variant={fit === pref.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFit(pref.id)}
            >
              {pref.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">Product Info (optional)</p>
        <Input
          value={productInfo}
          onChange={(e) => setProductInfo(e.target.value)}
          placeholder="e.g., Slim fit jeans, European sizing"
        />
      </div>

      <Button
        onClick={handleGetSize}
        disabled={isLoading || !height.trim() || !weight.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Calculating...
          </>
        ) : (
          <>
            <Ruler className="h-4 w-4 mr-2" />
            Get Size Recommendation
          </>
        )}
      </Button>

      {recommendation && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recommended Size</p>
                <p className="text-3xl font-bold">{recommendation.recommendedSize}</p>
              </div>
              <Badge className={confidenceColors[recommendation.confidence]}>
                {recommendation.confidence} confidence
              </Badge>
            </div>

            {recommendation.alternativeSize && (
              <p className="text-sm text-muted-foreground">
                Alternative: <span className="font-medium">{recommendation.alternativeSize}</span>
              </p>
            )}

            <p className="text-sm">{recommendation.reasoning}</p>

            {recommendation.tips.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Tips:</p>
                <ul className="space-y-1">
                  {recommendation.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                      <Check className="h-3 w-3 mt-1 text-green-600 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
