"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Star, ShoppingCart } from "lucide-react"

const products = [
  { id: 1, name: "Cozy Wool Cardigan", price: 89, category: "sweaters", color: "cream", warmth: "high", style: "casual", rating: 4.8 },
  { id: 2, name: "Lightweight Cotton Pullover", price: 45, category: "sweaters", color: "navy", warmth: "low", style: "casual", rating: 4.5 },
  { id: 3, name: "Cashmere V-Neck Sweater", price: 195, category: "sweaters", color: "gray", warmth: "medium", style: "elegant", rating: 4.9 },
  { id: 4, name: "Chunky Knit Turtleneck", price: 75, category: "sweaters", color: "burgundy", warmth: "high", style: "cozy", rating: 4.7 },
  { id: 5, name: "Merino Wool Zip-Up", price: 120, category: "sweaters", color: "black", warmth: "high", style: "sporty", rating: 4.6 },
  { id: 6, name: "Fleece-Lined Hoodie", price: 55, category: "sweaters", color: "forest green", warmth: "high", style: "casual", rating: 4.4 },
  { id: 7, name: "Silk Blend Cardigan", price: 150, category: "sweaters", color: "blush", warmth: "low", style: "elegant", rating: 4.8 },
  { id: 8, name: "Cable Knit Fisherman", price: 95, category: "sweaters", color: "ivory", warmth: "high", style: "classic", rating: 4.7 },
]

type SearchResult = {
  id: number
  relevance: string
}

export function ProductSearchNLDemo() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchIntent, setSearchIntent] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const search = async () => {
    if (!clientRef.current || !query.trim()) return

    setIsSearching(true)
    setResults([])
    setSearchIntent("")

    try {
      const productList = products.map(p =>
        `${p.id}: ${p.name} ($${p.price}, ${p.color}, ${p.warmth} warmth, ${p.style} style, ${p.rating}★)`
      ).join("\n")

      const result = await clientRef.current.generateText({
        prompt: `You are a helpful shopping assistant. Given a natural language query, find the most relevant products.

Products:
${productList}

Customer query: "${query}"

Return JSON:
{
  "intent": "Brief summary of what the customer wants (10 words max)",
  "matches": [{"id": 1, "relevance": "Why this matches (10 words max)"}]
}

Return top 3-4 most relevant matches. JSON:`,
        temperature: 0.5,
        maxTokens: 250,
      })

      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setSearchIntent(parsed.intent || "")
          setResults(parsed.matches || [])
        }
      } catch {
        // Fallback: simple keyword matching
        const lower = query.toLowerCase()
        const matches = products
          .filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.color.includes(lower) ||
            p.style.includes(lower)
          )
          .slice(0, 4)
          .map(p => ({ id: p.id, relevance: "Keyword match" }))
        setResults(matches)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search()
  }

  const getProduct = (id: number) => products.find(p => p.id === id)

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you're looking for..."
            className="pl-10"
          />
        </div>
        <Button onClick={search} disabled={isSearching || !query.trim()}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* Example Queries */}
      <div className="flex flex-wrap gap-2">
        {[
          "warm sweater for winter under $100",
          "something elegant for a dinner party",
          "cozy gift for my mom",
          "sporty but warm for hiking"
        ].map(q => (
          <Badge
            key={q}
            variant="secondary"
            className="cursor-pointer text-xs"
            onClick={() => setQuery(q)}
          >
            {q}
          </Badge>
        ))}
      </div>

      {/* Search Intent */}
      {searchIntent && (
        <div className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
          <span className="font-medium">Understanding: </span>{searchIntent}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Found {results.length} matching products
          </div>
          {results.map((result) => {
            const product = getProduct(result.id)
            if (!product) return null
            return (
              <Card key={result.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                    🧥
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="secondary">${product.price}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{product.color}</span>
                      <span>•</span>
                      <span>{product.warmth} warmth</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.rating}
                      </span>
                    </div>
                    <p className="text-xs text-primary mt-1">{result.relevance}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!isSearching && results.length === 0 && query && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No products found. Try describing what you need differently.
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Natural language product search • Understands context and preferences
      </p>
    </div>
  )
}
