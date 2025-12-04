"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Sparkles } from "lucide-react"

export interface SemanticProduct {
  id: number
  name: string
  price: number
  category: string
  description: string
}

const DEFAULT_PRODUCTS: SemanticProduct[] = [
  { id: 1, name: "Cozy Wool Sweater", price: 79, category: "Clothing", description: "Soft merino wool, perfect for cold days" },
  { id: 2, name: "Running Shoes Pro", price: 129, category: "Footwear", description: "Lightweight with advanced cushioning" },
  { id: 3, name: "Leather Laptop Bag", price: 149, category: "Accessories", description: "Premium leather, fits 15-inch laptops" },
  { id: 4, name: "Ceramic Coffee Mug", price: 24, category: "Kitchen", description: "Handmade, keeps drinks warm longer" },
  { id: 5, name: "Yoga Mat Premium", price: 45, category: "Fitness", description: "Extra thick, non-slip surface" },
  { id: 6, name: "Wireless Earbuds", price: 89, category: "Electronics", description: "Noise cancelling, 24hr battery" },
  { id: 7, name: "Organic Cotton T-Shirt", price: 35, category: "Clothing", description: "Sustainable, breathable fabric" },
  { id: 8, name: "Stainless Steel Water Bottle", price: 32, category: "Kitchen", description: "Insulated, keeps cold 24hrs" },
]

interface SearchResult {
  product: SemanticProduct
  relevance: number
  reason: string
}

export interface SemanticSearchDemoProps {
  /** Product catalog */
  products?: SemanticProduct[]
  /** Placeholder for input */
  placeholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function SemanticSearchDemo({
  products = DEFAULT_PRODUCTS,
  placeholder = "Try: 'gift for mom who loves coffee' or 'something for running in winter'",
  temperature = 0.5,
  maxTokens = 400,
}: SemanticSearchDemoProps = {}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setResults([])

    const productList = products.map(p =>
      `${p.id}: ${p.name} ($${p.price}) - ${p.category} - ${p.description}`
    ).join("\n")

    try {
      const result = await generateText({
        prompt: `You are a smart product search engine. Given a natural language query, find the most relevant products.

Products:
${productList}

Query: "${query}"

Return the top 3-4 most relevant products with relevance scores (0-100) and brief reasons.

Respond in JSON format:
[{"id": 1, "relevance": 95, "reason": "Why this matches"}, ...]`,
        temperature,
        maxTokens,
      })

      const jsonMatch = result.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const matches = JSON.parse(jsonMatch[0]) as { id: number; relevance: number; reason: string }[]
        const searchResults = matches
          .map(m => {
            const product = products.find(p => p.id === m.id)
            return product ? { product, relevance: m.relevance, reason: m.reason } : null
          })
          .filter((r): r is SearchResult => r !== null)
          .sort((a, b) => b.relevance - a.relevance)
        setResults(searchResults)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        Example queries: "cozy gift under $50", "workout gear for beginners", "eco-friendly products"
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <Card key={result.product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{result.product.name}</h3>
                      <Badge variant="secondary">${result.product.price}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{result.product.description}</p>
                    <p className="text-xs text-primary mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {result.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{result.relevance}%</div>
                    <div className="text-xs text-muted-foreground">match</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!results.length && !isLoading && (
        <div className="grid grid-cols-2 gap-2">
          {products.slice(0, 4).map((product) => (
            <Card key={product.id} className="opacity-60">
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">${product.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
