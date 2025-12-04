"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, User, MapPin, Calendar, Building, DollarSign, LucideIcon } from "lucide-react"

interface ExtractedEntities {
  people: string[]
  locations: string[]
  dates: string[]
  organizations: string[]
  money: string[]
}

export interface EntityTypeConfig {
  key: keyof ExtractedEntities
  label: string
  icon: LucideIcon
  color: string
}

const DEFAULT_SAMPLE_TEXT = `On March 15, 2024, Apple CEO Tim Cook announced a $500 million investment in a new research facility in Austin, Texas. The project, developed in partnership with Microsoft and Google, is expected to create 3,000 jobs by December 2025. Dr. Sarah Chen from Stanford University will lead the AI research division.`

const DEFAULT_ENTITY_TYPES: EntityTypeConfig[] = [
  { key: "people", label: "People", icon: User, color: "bg-blue-100 text-blue-800" },
  { key: "locations", label: "Locations", icon: MapPin, color: "bg-green-100 text-green-800" },
  { key: "dates", label: "Dates", icon: Calendar, color: "bg-purple-100 text-purple-800" },
  { key: "organizations", label: "Organizations", icon: Building, color: "bg-orange-100 text-orange-800" },
  { key: "money", label: "Money", icon: DollarSign, color: "bg-emerald-100 text-emerald-800" },
]

export interface EntityExtractionDemoProps {
  /** Initial text to extract entities from */
  defaultText?: string
  /** Placeholder for textarea */
  placeholder?: string
  /** Entity types configuration */
  entityTypes?: EntityTypeConfig[]
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function EntityExtractionDemo({
  defaultText = DEFAULT_SAMPLE_TEXT,
  placeholder = "Enter text to extract entities from...",
  entityTypes = DEFAULT_ENTITY_TYPES,
  temperature = 0.3,
  maxTokens = 400,
}: EntityExtractionDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [entities, setEntities] = useState<ExtractedEntities | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExtract = async () => {
    if (!text.trim()) return
    setIsLoading(true)
    setEntities(null)

    try {
      const result = await generateText({
        prompt: `Extract named entities from this text. Identify people, locations, dates, organizations, and monetary amounts.

Text: "${text}"

Respond with JSON only:
{"people": [], "locations": [], "dates": [], "organizations": [], "money": []}`,
        temperature,
        maxTokens,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setEntities(JSON.parse(jsonMatch[0]) as ExtractedEntities)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={4}
      />

      <Button onClick={handleExtract} disabled={isLoading || !text.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Extracting...
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Extract Entities
          </>
        )}
      </Button>

      {entities && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {entityTypes.map(({ key, label, icon: Icon, color }) => {
              const items = entities[key]
              if (!items || items.length === 0) return null
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {items.map((item, i) => (
                      <Badge key={i} className={color}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
