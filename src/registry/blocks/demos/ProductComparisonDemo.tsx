"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, GitCompare, Plus, X, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComparisonResult {
  features: { name: string; values: Record<string, string | boolean>; winner?: string }[]
  recommendation: { product: string; reason: string }
  summary: string
}

export interface ProductComparisonDemoProps {
  /** Default products to compare */
  defaultProducts?: string[]
}

export function ProductComparisonDemo({
  defaultProducts = ["iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "Google Pixel 8 Pro"],
}: ProductComparisonDemoProps = {}) {
  const [products, setProducts] = useState(defaultProducts)
  const [newProduct, setNewProduct] = useState("")
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const addProduct = () => {
    if (newProduct.trim() && products.length < 4) {
      setProducts([...products, newProduct.trim()])
      setNewProduct("")
    }
  }

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleCompare = async () => {
    if (products.length < 2) return
    setIsLoading(true)
    setComparison(null)

    try {
      const response = await generateText({
        prompt: `Create a detailed comparison table for these products:

Products: ${products.join(", ")}

Compare on key features relevant to this product category. Include specs, features, and subjective qualities.

Return as JSON:
{
  "features": [
    {
      "name": "Feature name",
      "values": {"${products[0]}": "value", "${products[1]}": "value"},
      "winner": "Product name or null if tie"
    }
  ],
  "recommendation": {
    "product": "Best overall pick",
    "reason": "Why this is recommended"
  },
  "summary": "Brief comparison summary"
}

Include 8-10 important comparison points. Use ✓/✗ for boolean features.`,
        maxTokens: 800,
      })

      const parsed = JSON.parse(response.text)
      setComparison(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getValueColor = (feature: any, product: string) => {
    if (feature.winner === product) {
      return "bg-green-50 dark:bg-green-950 font-medium text-green-700 dark:text-green-300"
    }
    return ""
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Products to compare</Label>
        <div className="flex flex-wrap gap-2">
          {products.map((product, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="px-3 py-1 flex items-center gap-1"
            >
              {product}
              <button
                onClick={() => removeProduct(i)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        {products.length < 4 && (
          <div className="flex gap-2">
            <Input
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              placeholder="Add another product..."
              onKeyDown={(e) => e.key === "Enter" && addProduct()}
            />
            <Button
              variant="outline"
              onClick={addProduct}
              disabled={!newProduct.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={handleCompare}
        disabled={isLoading || products.length < 2}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Comparing...
          </>
        ) : (
          <>
            <GitCompare className="h-4 w-4 mr-2" />
            Compare Products
          </>
        )}
      </Button>

      {comparison && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">{comparison.summary}</p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Feature</TableHead>
                    {products.map((product) => (
                      <TableHead key={product} className="text-center">
                        {product}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.features.map((feature, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm">
                        {feature.name}
                      </TableCell>
                      {products.map((product) => (
                        <TableCell
                          key={product}
                          className={cn(
                            "text-center text-sm",
                            getValueColor(feature, product)
                          )}
                        >
                          {feature.values[product] === true ? "✓" :
                           feature.values[product] === false ? "✗" :
                           feature.values[product] || "-"}
                          {feature.winner === product && (
                            <Trophy className="h-3 w-3 inline-block ml-1 text-yellow-500" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-start gap-2">
                <Trophy className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Recommended: {comparison.recommendation.product}</p>
                  <p className="text-sm text-muted-foreground">
                    {comparison.recommendation.reason}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
