"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, DollarSign, TrendingUp, TrendingDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingExplanation {
  verdict: "fair" | "high" | "low" | "excellent"
  marketComparison: string
  factors: { factor: string; impact: "increases" | "decreases" | "neutral"; explanation: string }[]
  recommendation: string
  priceRange: { low: number; average: number; high: number }
}

const PRODUCT_CATEGORIES = [
  { id: "electronics", label: "Electronics" },
  { id: "furniture", label: "Furniture" },
  { id: "clothing", label: "Clothing" },
  { id: "services", label: "Services" },
  { id: "software", label: "Software/SaaS" },
  { id: "food", label: "Food & Beverage" },
]

export interface PricingExplainerDemoProps {
  /** Default product name */
  defaultProduct?: string
  /** Default price */
  defaultPrice?: string
}

export function PricingExplainerDemo({
  defaultProduct = "Wireless Noise-Canceling Headphones",
  defaultPrice = "299",
}: PricingExplainerDemoProps = {}) {
  const [product, setProduct] = useState(defaultProduct)
  const [price, setPrice] = useState(defaultPrice)
  const [category, setCategory] = useState("electronics")
  const [explanation, setExplanation] = useState<PricingExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExplain = async () => {
    if (!product.trim() || !price) return
    setIsLoading(true)
    setExplanation(null)

    try {
      const response = await generateText({
        prompt: `Analyze this product pricing:

Product: ${product}
Category: ${PRODUCT_CATEGORIES.find(c => c.id === category)?.label}
Listed Price: $${price}

Explain whether this price is fair and why. Consider market rates, features, and value.

Return as JSON:
{
  "verdict": "fair|high|low|excellent",
  "marketComparison": "How this compares to market average",
  "factors": [
    {
      "factor": "Brand premium",
      "impact": "increases|decreases|neutral",
      "explanation": "Why this affects the price"
    }
  ],
  "recommendation": "Should the buyer proceed or wait?",
  "priceRange": {
    "low": 0,
    "average": 0,
    "high": 0
  }
}

Be specific and helpful for purchase decisions.`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(response.text)
      setExplanation(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "fair":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "low":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "increases":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreases":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Product</Label>
          <Input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="What product are you considering?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        onClick={handleExplain}
        disabled={isLoading || !product.trim() || !price}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <DollarSign className="h-4 w-4 mr-2" />
            Explain This Price
          </>
        )}
      </Button>

      {explanation && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={cn("text-lg px-3 py-1", getVerdictColor(explanation.verdict))}>
                {explanation.verdict.charAt(0).toUpperCase() + explanation.verdict.slice(1)} Price
              </Badge>
              <div className="text-right">
                <p className="text-2xl font-bold">${price}</p>
                <p className="text-xs text-muted-foreground">
                  Avg: ${explanation.priceRange.average}
                </p>
              </div>
            </div>

            <div className="relative h-2 bg-muted rounded-full">
              <div
                className="absolute h-2 bg-gradient-to-r from-green-400 via-blue-400 to-red-400 rounded-full"
                style={{ width: "100%" }}
              />
              <div
                className="absolute w-3 h-3 bg-black rounded-full -top-0.5 border-2 border-white"
                style={{
                  left: `${Math.min(100, Math.max(0, ((parseFloat(price) - explanation.priceRange.low) / (explanation.priceRange.high - explanation.priceRange.low)) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${explanation.priceRange.low}</span>
              <span>${explanation.priceRange.high}</span>
            </div>

            <p className="text-sm">{explanation.marketComparison}</p>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Price Factors</p>
              {explanation.factors.map((factor, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted rounded">
                  {getImpactIcon(factor.impact)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{factor.factor}</p>
                    <p className="text-xs text-muted-foreground">{factor.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium">💡 Recommendation</p>
              <p className="text-sm text-muted-foreground">{explanation.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
