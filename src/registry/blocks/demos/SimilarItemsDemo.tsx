"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, ArrowRight } from "lucide-react"

const products = [
  { id: 1, name: "Classic White Sneakers", price: 89, category: "Footwear", style: "casual", material: "leather" },
  { id: 2, name: "Running Performance Shoes", price: 129, category: "Footwear", style: "athletic", material: "mesh" },
  { id: 3, name: "Leather Loafers", price: 159, category: "Footwear", style: "formal", material: "leather" },
  { id: 4, name: "Canvas Slip-Ons", price: 49, category: "Footwear", style: "casual", material: "canvas" },
  { id: 5, name: "High-Top Basketball Shoes", price: 149, category: "Footwear", style: "athletic", material: "synthetic" },
  { id: 6, name: "Suede Desert Boots", price: 119, category: "Footwear", style: "casual", material: "suede" },
  { id: 7, name: "Minimalist Trainers", price: 99, category: "Footwear", style: "casual", material: "knit" },
  { id: 8, name: "Oxford Dress Shoes", price: 189, category: "Footwear", style: "formal", material: "leather" },
]

type SimilarProduct = {
  id: number
  reason: string
}

export function SimilarItemsDemo() {
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [similarItems, setSimilarItems] = useState<SimilarProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const findSimilar = async (product: typeof products[0]) => {

    setSelectedProduct(product)
    setIsLoading(true)
    setSimilarItems([])

    try {
      const otherProducts = products.filter(p => p.id !== product.id)
      const productList = otherProducts.map(p =>
        `${p.id}: ${p.name} ($${p.price}, ${p.style}, ${p.material})`
      ).join('\n')

      const result = await generateText({
        prompt: `Find the 3 most similar products to "${product.name}" (${product.style}, ${product.material}, $${product.price}).

Products:
${productList}

Return JSON array with id and brief reason (10 words max). Example:
[{"id": 1, "reason": "Same casual style and leather material"}]

JSON:`,
        temperature: 0.5,
        maxTokens: 200,
      })

      try {
        const jsonMatch = result.text.match(/\[[\s\S]*?\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setSimilarItems(parsed.slice(0, 3))
        }
      } catch {
        // Fallback: simple matching
        const similar = otherProducts
          .filter(p => p.style === product.style || p.material === product.material)
          .slice(0, 3)
          .map(p => ({ id: p.id, reason: `Similar ${p.style === product.style ? 'style' : 'material'}` }))
        setSimilarItems(similar)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }


  const getSimilarProduct = (id: number) => products.find(p => p.id === id)

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {/* Selected Product */}
      <Card className="border-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2">Selected</Badge>
              <h3 className="font-semibold">{selectedProduct.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedProduct.style} • {selectedProduct.material}
              </p>
            </div>
            <span className="text-lg font-bold">${selectedProduct.price}</span>
          </div>
        </CardContent>
      </Card>

      {/* Similar Items */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Similar items you might like</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Finding similar items...</span>
        </div>
      ) : similarItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">Click to find similar products</p>
            <Button onClick={() => findSimilar(selectedProduct)} size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Find Similar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {similarItems.map((item, index) => {
            const product = getSimilarProduct(item.id)
            if (!product) return null
            return (
              <Card key={item.id} className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => findSimilar(product)}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{item.reason}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">${product.price}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Other Products */}
      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">Or select another product:</span>
        <div className="flex flex-wrap gap-2">
          {products.filter(p => p.id !== selectedProduct.id).map(product => (
            <Badge
              key={product.id}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => findSimilar(product)}
            >
              {product.name.split(' ').slice(0, 2).join(' ')}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
