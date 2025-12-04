"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Scale, Plus, X, Trophy } from "lucide-react"

interface Comparison {
  criteria: { name: string; product1: string; product2: string; winner: 1 | 2 | 0 }[]
  summary: string
  recommendation: string
  winner: 1 | 2
}

const DEFAULT_PRODUCT1 = "iPhone 15 Pro - $999, A17 chip, 48MP camera, titanium frame, USB-C, 6.1 inch display"
const DEFAULT_PRODUCT2 = "Samsung Galaxy S24 Ultra - $1199, Snapdragon 8 Gen 3, 200MP camera, S Pen, 6.8 inch display"

export interface ProductCompareDemoProps {
  /** Default first product description */
  defaultProduct1?: string
  /** Default second product description */
  defaultProduct2?: string
  /** Placeholder for textarea */
  placeholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function ProductCompareDemo({
  defaultProduct1 = DEFAULT_PRODUCT1,
  defaultProduct2 = DEFAULT_PRODUCT2,
  placeholder = "Enter product details...",
  temperature = 0.6,
  maxTokens = 600,
}: ProductCompareDemoProps = {}) {
  const [product1, setProduct1] = useState(defaultProduct1)
  const [product2, setProduct2] = useState(defaultProduct2)
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCompare = async () => {
    if (!product1.trim() || !product2.trim()) return
    setIsLoading(true)
    setComparison(null)

    try {
      const result = await generateText({
        prompt: `Compare these two products and create a detailed comparison:

Product 1: ${product1}
Product 2: ${product2}

Respond in JSON format:
{
  "criteria": [
    {"name": "Price", "product1": "assessment", "product2": "assessment", "winner": 1 or 2 or 0 for tie},
    {"name": "Performance", "product1": "...", "product2": "...", "winner": ...},
    {"name": "Features", "product1": "...", "product2": "...", "winner": ...},
    {"name": "Value", "product1": "...", "product2": "...", "winner": ...}
  ],
  "summary": "Brief overall comparison",
  "recommendation": "Who should buy which",
  "winner": 1 or 2
}`,
        temperature,
        maxTokens,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setComparison(JSON.parse(jsonMatch[0]) as Comparison)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getWinnerStyle = (winner: number, column: 1 | 2) => {
    if (winner === column) return "bg-green-100 text-green-800 font-medium"
    if (winner === 0) return "bg-yellow-50"
    return ""
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Product 1</p>
          <Textarea
            value={product1}
            onChange={(e) => setProduct1(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Product 2</p>
          <Textarea
            value={product2}
            onChange={(e) => setProduct2(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        </div>
      </div>

      <Button
        onClick={handleCompare}
        disabled={isLoading || !product1.trim() || !product2.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Comparing...
          </>
        ) : (
          <>
            <Scale className="h-4 w-4 mr-2" />
            Compare Products
          </>
        )}
      </Button>

      {comparison && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm font-medium border-b pb-2">
              <div>Criteria</div>
              <div className={comparison.winner === 1 ? "text-green-600" : ""}>
                Product 1 {comparison.winner === 1 && <Trophy className="h-3 w-3 inline" />}
              </div>
              <div className={comparison.winner === 2 ? "text-green-600" : ""}>
                Product 2 {comparison.winner === 2 && <Trophy className="h-3 w-3 inline" />}
              </div>
            </div>

            {comparison.criteria.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">{row.name}</div>
                <div className={`p-1 rounded ${getWinnerStyle(row.winner, 1)}`}>
                  {row.product1}
                </div>
                <div className={`p-1 rounded ${getWinnerStyle(row.winner, 2)}`}>
                  {row.product2}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t space-y-2">
              <p className="text-sm">{comparison.summary}</p>
              <p className="text-sm text-muted-foreground">
                <strong>Recommendation:</strong> {comparison.recommendation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
