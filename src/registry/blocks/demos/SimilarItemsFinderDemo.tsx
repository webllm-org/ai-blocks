"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimilarItem {
  name: string
  similarity: number
  reason: string
  category: string
}

export interface SimilarItemsFinderDemoProps {
  /** Domain context */
  domain?: string
  /** Sample catalog items */
  catalog?: string[]
}

export function SimilarItemsFinderDemo({
  domain = "movies",
  catalog = [
    "The Matrix",
    "Inception",
    "Interstellar",
    "The Dark Knight",
    "Pulp Fiction",
    "Fight Club",
    "The Shawshank Redemption",
    "Forrest Gump",
    "The Godfather",
    "Goodfellas",
    "Blade Runner",
    "Ex Machina",
    "Her",
    "Arrival",
    "Dune",
  ],
}: SimilarItemsFinderDemoProps = {}) {
  const [searchItem, setSearchItem] = useState("")
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const handleSearch = async (item?: string) => {
    const itemToSearch = item || searchItem
    if (!itemToSearch.trim()) return

    setIsLoading(true)
    setSimilarItems([])
    setSelectedItem(itemToSearch)

    try {
      const result = await generateText({
        prompt: `Find items similar to "${itemToSearch}" from this catalog of ${domain}:

Catalog: ${catalog.join(", ")}

Analyze based on themes, style, genre, tone, and audience appeal.

Return the 5 most similar items as JSON:
[
  {
    "name": "Item Name",
    "similarity": 85,
    "reason": "Brief explanation of why they're similar",
    "category": "shared category or theme"
  }
]

Sort by similarity score (0-100). Only include items from the catalog.`,
        maxTokens: 400,
      })

      const parsed = JSON.parse(result.text)
      if (Array.isArray(parsed)) {
        setSimilarItems(parsed)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="flex gap-2">
        <Input
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
          placeholder={`Enter a ${domain.slice(0, -1)} name...`}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={() => handleSearch()} disabled={isLoading || !searchItem.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Or click from catalog:</Label>
        <div className="flex flex-wrap gap-2">
          {catalog.slice(0, 8).map((item) => (
            <Badge
              key={item}
              variant={selectedItem === item ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => {
                setSearchItem(item)
                handleSearch(item)
              }}
            >
              {item}
            </Badge>
          ))}
          {catalog.length > 8 && (
            <Badge variant="outline" className="text-muted-foreground">
              +{catalog.length - 8} more
            </Badge>
          )}
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">
              Finding similar {domain}...
            </p>
          </CardContent>
        </Card>
      )}

      {similarItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Similar to</span>
            <Badge>{selectedItem}</Badge>
          </div>

          {similarItems.map((item, i) => (
            <Card
              key={i}
              className={cn(
                "cursor-pointer transition-all hover:border-primary",
                "hover:shadow-md"
              )}
              onClick={() => {
                setSearchItem(item.name)
                handleSearch(item.name)
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.reason}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <Badge className={cn("shrink-0", getSimilarityColor(item.similarity))}>
                    {item.similarity}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && similarItems.length === 0 && selectedItem && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No similar items found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
