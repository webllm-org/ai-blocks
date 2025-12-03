"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Filter, X } from "lucide-react"

const sampleProducts = [
  { id: 1, name: "Cozy Wool Sweater", price: 89, category: "Clothing", color: "blue", size: "M", rating: 4.5 },
  { id: 2, name: "Silk Scarf", price: 45, category: "Accessories", color: "red", size: "OS", rating: 4.8 },
  { id: 3, name: "Leather Wallet", price: 65, category: "Accessories", color: "brown", size: "OS", rating: 4.2 },
  { id: 4, name: "Cotton T-Shirt", price: 25, category: "Clothing", color: "white", size: "L", rating: 4.0 },
  { id: 5, name: "Winter Jacket", price: 199, category: "Clothing", color: "black", size: "M", rating: 4.7 },
  { id: 6, name: "Cashmere Beanie", price: 55, category: "Accessories", color: "gray", size: "OS", rating: 4.6 },
  { id: 7, name: "Linen Pants", price: 79, category: "Clothing", color: "beige", size: "S", rating: 4.3 },
  { id: 8, name: "Running Shoes", price: 129, category: "Footwear", color: "white", size: "10", rating: 4.9 },
]

type ParsedFilters = {
  maxPrice?: number
  minPrice?: number
  category?: string
  color?: string
  minRating?: number
}

export function SearchFiltersDemo() {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<ParsedFilters>({})
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts)
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const parseQuery = async () => {
    if (!clientRef.current || !query.trim()) return

    setIsLoading(true)
    try {
      const result = await clientRef.current.generateText({
        prompt: `Parse this shopping query into filters. Return JSON only, no explanation.

Query: "${query}"

Available filters: maxPrice (number), minPrice (number), category (Clothing/Accessories/Footwear), color (string), minRating (1-5)

Example: "cozy gift under $50" → {"maxPrice": 50, "category": "Accessories"}
Example: "blue clothes rated 4+" → {"color": "blue", "category": "Clothing", "minRating": 4}

JSON:`,
        temperature: 0.3,
        maxTokens: 100,
      })

      try {
        const jsonMatch = result.text.match(/\{[^}]+\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setFilters(parsed)
          applyFilters(parsed)
        }
      } catch {
        console.error("Failed to parse filters")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = (f: ParsedFilters) => {
    let results = sampleProducts

    if (f.maxPrice) {
      results = results.filter(p => p.price <= f.maxPrice!)
    }
    if (f.minPrice) {
      results = results.filter(p => p.price >= f.minPrice!)
    }
    if (f.category) {
      results = results.filter(p => p.category.toLowerCase().includes(f.category!.toLowerCase()))
    }
    if (f.color) {
      results = results.filter(p => p.color.toLowerCase().includes(f.color!.toLowerCase()))
    }
    if (f.minRating) {
      results = results.filter(p => p.rating >= f.minRating!)
    }

    setFilteredProducts(results)
  }

  const clearFilters = () => {
    setFilters({})
    setFilteredProducts(sampleProducts)
    setQuery("")
  }

  const removeFilter = (key: keyof ParsedFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") parseQuery()
  }

  const activeFilters = Object.entries(filters).filter(([_, v]) => v !== undefined)

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Try: cozy gift for mom under $60"
            className="pl-10"
          />
        </div>
        <Button onClick={parseQuery} disabled={isLoading || !query.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Filters:</span>
          {activeFilters.map(([key, value]) => (
            <Badge key={key} variant="secondary" className="gap-1">
              {key === "maxPrice" && `Under $${value}`}
              {key === "minPrice" && `Over $${value}`}
              {key === "category" && value}
              {key === "color" && value}
              {key === "minRating" && `${value}+ stars`}
              <button
                onClick={() => removeFilter(key as keyof ParsedFilters)}
                className="ml-1 hover:bg-background/50 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Results */}
      <div className="grid gap-2">
        <div className="text-sm text-muted-foreground">
          {filteredProducts.length} of {sampleProducts.length} products
        </div>
        {filteredProducts.map(product => (
          <Card key={product.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  {product.category} • {product.color} • ⭐ {product.rating}
                </div>
              </div>
              <Badge variant="outline">${product.price}</Badge>
            </CardContent>
          </Card>
        ))}
        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No products match your filters
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-muted-foreground">Try:</span>
        {["blue under $100", "accessories 4+ stars", "warm winter gear"].map(q => (
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
    </div>
  )
}
