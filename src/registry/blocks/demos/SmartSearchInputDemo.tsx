"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, X, HelpCircle } from "lucide-react"

interface ParsedFilter {
  field: string
  value: string
  operator?: string
}

interface Ambiguity {
  field: string
  options: string[]
}

export interface SmartSearchInputDemoProps {
  /** Placeholder text */
  placeholder?: string
  /** Available fields for parsing */
  fields?: string[]
}

export function SmartSearchInputDemo({
  placeholder = "red shoes under $50 size 9",
  fields = ["color", "category", "price", "size", "brand", "material", "gender"],
}: SmartSearchInputDemoProps = {}) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<ParsedFilter[]>([])
  const [ambiguities, setAmbiguities] = useState<Ambiguity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isParsed, setIsParsed] = useState(false)

  const handleParse = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    setFilters([])
    setAmbiguities([])

    try {
      const result = await generateText({
        prompt: `Parse this natural language search query into structured filters:

Query: "${query}"

Available fields: ${fields.join(", ")}

Extract filters from the query. For each filter, identify the field and value.

Format as JSON:
{
  "filters": [
    {"field": "color", "value": "red"},
    {"field": "price", "value": "50", "operator": "<"}
  ],
  "ambiguities": [
    {"field": "gender", "options": ["men's", "women's", "unisex"]}
  ]
}

Only include ambiguities if the query is genuinely unclear about a filter.`,
        maxTokens: 200,
      })

      const parsed = JSON.parse(result.text)
      setFilters(parsed.filters || [])
      setAmbiguities(parsed.ambiguities || [])
      setIsParsed(true)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index))
  }

  const resolveAmbiguity = (field: string, value: string) => {
    setFilters(prev => [...prev, { field, value }])
    setAmbiguities(prev => prev.filter(a => a.field !== field))
  }

  const handleSearch = () => {
    console.log("Searching with filters:", filters)
    alert(`Searching with ${filters.length} filters: ${JSON.stringify(filters, null, 2)}`)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsParsed(false)
          }}
          placeholder={placeholder}
          className="pl-10 pr-20"
          onKeyDown={(e) => e.key === "Enter" && handleParse()}
        />
        <Button
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={handleParse}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Parse"
          )}
        </Button>
      </div>

      {filters.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-2">Parsed Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <span className="text-muted-foreground">{filter.field}:</span>
                  {filter.operator && <span>{filter.operator}</span>}
                  {filter.value}
                  <button
                    onClick={() => removeFilter(i)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {ambiguities.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-3">
            <div className="flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-300 mb-2">
              <HelpCircle className="h-3 w-3" />
              Clarify your search:
            </div>
            {ambiguities.map((amb, i) => (
              <div key={i} className="mb-2">
                <p className="text-sm mb-1">Did you mean {amb.field}:</p>
                <div className="flex flex-wrap gap-1">
                  {amb.options.map((opt, j) => (
                    <Button
                      key={j}
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAmbiguity(amb.field, opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isParsed && filters.length > 0 && (
        <Button onClick={handleSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      )}
    </div>
  )
}
