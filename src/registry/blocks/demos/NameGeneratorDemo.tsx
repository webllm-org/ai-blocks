"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Heart, RefreshCw, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface NameIdea {
  name: string
  meaning: string
  vibe: string
  available?: boolean
}

const NAME_TYPES = [
  { id: "startup", label: "Startup/Business", examples: "Stripe, Notion, Figma" },
  { id: "app", label: "Mobile App", examples: "Tinder, Venmo, Duolingo" },
  { id: "product", label: "Product", examples: "iPhone, Kindle, Roomba" },
  { id: "project", label: "Side Project", examples: "readme.so, ray.so" },
  { id: "pet", label: "Pet Name", examples: "Luna, Max, Charlie" },
  { id: "baby", label: "Baby Name", examples: "Olivia, Liam, Emma" },
  { id: "band", label: "Band Name", examples: "Imagine Dragons, The Killers" },
  { id: "username", label: "Username", examples: "clevername123" },
]

export interface NameGeneratorDemoProps {
  /** Default name type */
  defaultType?: string
}

export function NameGeneratorDemo({
  defaultType = "startup",
}: NameGeneratorDemoProps = {}) {
  const [nameType, setNameType] = useState(defaultType)
  const [keywords, setKeywords] = useState("")
  const [names, setNames] = useState<NameIdea[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [copiedName, setCopiedName] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setNames([])

    const typeInfo = NAME_TYPES.find(t => t.id === nameType)

    try {
      const response = await generateText({
        prompt: `Generate 8 creative ${typeInfo?.label} names.

${keywords ? `Keywords/themes: ${keywords}` : ""}
Examples of the style: ${typeInfo?.examples}

Requirements for ${nameType}:
${nameType === "startup" ? "- Memorable, modern, ideally short\n- Consider .com availability vibes" : ""}
${nameType === "app" ? "- Catchy, easy to say and spell\n- Consider app store searchability" : ""}
${nameType === "pet" || nameType === "baby" ? "- Mix of unique and classic options\n- Easy to pronounce" : ""}
${nameType === "username" ? "- Creative combinations\n- Mix of serious and fun options" : ""}

Return as JSON array:
[
  {
    "name": "The name",
    "meaning": "Brief explanation of the name's origin or meaning",
    "vibe": "Modern/Classic/Playful/Professional/etc."
  }
]

Be creative! Avoid overused suggestions.`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(response.text)
      if (Array.isArray(parsed)) {
        setNames(parsed)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = (name: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const handleCopy = async (name: string) => {
    await navigator.clipboard.writeText(name)
    setCopiedName(name)
    setTimeout(() => setCopiedName(null), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">What are you naming?</Label>
          <Select value={nameType} onValueChange={setNameType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NAME_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Keywords or themes (optional)</Label>
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., fast, cloud, nature, blue..."
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Names
          </>
        )}
      </Button>

      {names.length > 0 && (
        <div className="space-y-2">
          {names.map((idea, i) => (
            <Card key={i} className={cn(favorites.has(idea.name) && "ring-2 ring-pink-500")}>
              <CardContent className="p-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(idea.name)}
                  className={cn(
                    "h-8 w-8 p-0",
                    favorites.has(idea.name) && "text-pink-500"
                  )}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      favorites.has(idea.name) && "fill-current"
                    )}
                  />
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{idea.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {idea.vibe}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {idea.meaning}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(idea.name)}
                  className="h-8 w-8 p-0"
                >
                  {copiedName === idea.name ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={handleGenerate}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate More
          </Button>

          {favorites.size > 0 && (
            <div className="p-3 bg-pink-50 dark:bg-pink-950 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Favorites ({favorites.size}):</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(favorites).map((name) => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
