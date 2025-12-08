"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Ruler, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SizeRecommendation {
  recommendedSize: string
  confidence: "high" | "medium" | "low"
  fitDescription: string
  alternativeSize?: { size: string; reason: string }
  tips: string[]
  measurements?: { label: string; value: string }[]
}

const PRODUCT_TYPES = [
  { id: "shirt", label: "T-Shirt / Top" },
  { id: "pants", label: "Pants / Jeans" },
  { id: "dress", label: "Dress" },
  { id: "jacket", label: "Jacket / Coat" },
  { id: "shoes", label: "Shoes" },
  { id: "ring", label: "Ring" },
]

export interface SizeRecommenderDemoProps {
  /** Default product type */
  defaultProductType?: string
}

export function SizeRecommenderDemo({
  defaultProductType = "shirt",
}: SizeRecommenderDemoProps = {}) {
  const [productType, setProductType] = useState(defaultProductType)
  const [measurements, setMeasurements] = useState({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    usualSize: "",
  })
  const [brand, setBrand] = useState("")
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRecommend = async () => {
    setIsLoading(true)
    setRecommendation(null)

    try {
      const response = await generateText({
        prompt: `Recommend a size for this customer:

Product type: ${PRODUCT_TYPES.find(p => p.id === productType)?.label}
Brand: ${brand || "Generic"}

Customer info:
- Height: ${measurements.height || "not provided"} cm
- Weight: ${measurements.weight || "not provided"} kg
- Chest: ${measurements.chest || "not provided"} cm
- Waist: ${measurements.waist || "not provided"} cm
- Usually wears: ${measurements.usualSize || "not provided"}

Provide a size recommendation as JSON:
{
  "recommendedSize": "M",
  "confidence": "high|medium|low",
  "fitDescription": "How this size will fit",
  "alternativeSize": {"size": "L", "reason": "If you prefer looser fit"},
  "tips": ["Sizing tip 1", "Sizing tip 2"],
  "measurements": [{"label": "Chest", "value": "96-102 cm"}]
}

Be practical and consider common sizing variations.`,
        maxTokens: 400,
      })

      const parsed = JSON.parse(response.text)
      setRecommendation(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Product type</Label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Brand (optional)</Label>
          <Input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g., Nike, Zara, H&M"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Height (cm)</Label>
            <Input
              type="number"
              value={measurements.height}
              onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
              placeholder="170"
            />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Weight (kg)</Label>
            <Input
              type="number"
              value={measurements.weight}
              onChange={(e) => setMeasurements({ ...measurements, weight: e.target.value })}
              placeholder="70"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Chest (cm)</Label>
            <Input
              type="number"
              value={measurements.chest}
              onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
              placeholder="96"
            />
          </div>
          <div>
            <Label className="text-sm mb-2 block">Waist (cm)</Label>
            <Input
              type="number"
              value={measurements.waist}
              onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
              placeholder="80"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Usually wear size</Label>
          <Input
            value={measurements.usualSize}
            onChange={(e) => setMeasurements({ ...measurements, usualSize: e.target.value })}
            placeholder="e.g., M, 32, 9.5"
          />
        </div>
      </div>

      <Button
        onClick={handleRecommend}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Recommended Size</p>
              <p className="text-5xl font-bold">{recommendation.recommendedSize}</p>
              <Badge className={cn("mt-2", getConfidenceColor(recommendation.confidence))}>
                {recommendation.confidence} confidence
              </Badge>
            </div>

            <p className="text-sm text-center">{recommendation.fitDescription}</p>

            {recommendation.alternativeSize && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Alternative: {recommendation.alternativeSize.size}</span>
                  <span className="text-muted-foreground"> - {recommendation.alternativeSize.reason}</span>
                </p>
              </div>
            )}

            {recommendation.measurements && recommendation.measurements.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {recommendation.measurements.map((m, i) => (
                  <div key={i} className="p-2 bg-muted rounded text-center">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-medium">{m.value}</p>
                  </div>
                ))}
              </div>
            )}

            {recommendation.tips.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground font-medium mb-2">Tips</p>
                <ul className="space-y-1">
                  {recommendation.tips.map((tip, i) => (
                    <li key={i} className="text-xs flex items-start gap-1">
                      <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
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
