"use client"

import { useState, useRef } from "react"
import { generateText } from "@webllm/client"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, ArrowRight } from "lucide-react"

const sampleContext = `
Our store offers: Running shoes, Trail hiking boots, Casual sneakers,
Formal dress shoes, Sandals, Flip-flops, Basketball shoes, Tennis shoes,
Winter boots, Rain boots, Slippers, Athletic socks, Shoe care products,
Insoles, Laces, Waterproofing spray
`

export function AutocompleteDemo() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const getSuggestions = async (text: string) => {
    if (text.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const result = await generateText({
        prompt: `Given this product catalog:
${sampleContext}

User is searching for: "${text}"

Suggest 4 relevant search completions (one per line, no numbers/bullets):`,
        temperature: 0.3,
        maxTokens: 80,
      })

      const lines = result.text.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && l.length < 50)
        .slice(0, 4)

      setSuggestions(lines)
      setSelectedIndex(-1)
    } catch (error) {
      console.error("Error:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (value: string) => {
    setQuery(value)
    setSuggestions([])

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => getSuggestions(value), 400)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      setQuery(suggestions[selectedIndex])
      setSuggestions([])
    } else if (e.key === "Escape") {
      setSuggestions([])
    }
  }

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
    setSuggestions([])
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="pl-10 pr-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {suggestions.length > 0 && (
          <Card className="absolute w-full mt-1 z-10 shadow-lg">
            <CardContent className="p-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${
                    index === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {["run", "winter", "comfy"].map(term => (
          <Badge
            key={term}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => handleChange(term)}
          >
            {term}
          </Badge>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        AI-powered autocomplete • Use ↑↓ arrows to navigate
      </p>
    </div>
  )
}
