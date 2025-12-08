"use client"

import { useState, useEffect, useRef } from "react"
import { generateText } from "@webllm/client"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Suggestion {
  text: string
  type: "recent" | "ai" | "popular"
}

export interface AutocompleteContextDemoProps {
  /** Context about the user or domain */
  context?: string
  /** Placeholder text */
  placeholder?: string
}

export function AutocompleteContextDemo({
  context = "User is a software developer working on a React project. Recently searched: 'useState hooks', 'TypeScript generics', 'API error handling'",
  placeholder = "Search documentation...",
}: AutocompleteContextDemoProps = {}) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      setShowDropdown(true)

      try {
        const result = await generateText({
          prompt: `Generate smart autocomplete suggestions for a search query.

Context about the user: ${context}

Partial query: "${query}"

Generate 5 relevant search suggestions that:
1. Complete the partial query naturally
2. Are relevant to the user's context and recent searches
3. Anticipate what they might be looking for

Format as JSON array:
[
  {"text": "suggestion 1", "type": "ai"},
  {"text": "suggestion 2", "type": "recent"},
  {"text": "suggestion 3", "type": "popular"}
]

Types: "ai" for AI-generated, "recent" if matches recent searches, "popular" for common queries.`,
          maxTokens: 200,
        })

        const parsed = JSON.parse(result.text)
        if (Array.isArray(parsed)) {
          setSuggestions(parsed)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, context])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          setQuery(suggestions[selectedIndex].text)
          setShowDropdown(false)
        }
        break
      case "Escape":
        setShowDropdown(false)
        break
    }
  }

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.text)
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ai":
        return <Sparkles className="h-3 w-3 text-purple-500" />
      case "recent":
        return <span className="text-xs">🕐</span>
      default:
        return <span className="text-xs">🔥</span>
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Context-Aware Search</Label>
        <div className="relative">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setSuggestions.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={placeholder}
            className="pr-8"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {showDropdown && suggestions.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 shadow-lg">
            <CardContent className="p-1">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md transition-colors",
                    selectedIndex === i
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleSelect(suggestion)}
                >
                  {getTypeIcon(suggestion.type)}
                  <span className="flex-1">{suggestion.text}</span>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
        <p className="font-medium mb-1">Current context:</p>
        <p>{context}</p>
      </div>
    </div>
  )
}
