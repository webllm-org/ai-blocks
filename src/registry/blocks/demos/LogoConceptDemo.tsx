"use client"

import { useState } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, RefreshCw, Lightbulb, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const LOGO_STYLES = [
  { id: "wordmark", label: "Wordmark", prompt: "wordmark logo, text-based, typography focused" },
  { id: "icon", label: "Icon", prompt: "icon logo, simple symbol, minimal" },
  { id: "combination", label: "Combination", prompt: "combination logo with icon and text" },
  { id: "abstract", label: "Abstract", prompt: "abstract logo, geometric shapes" },
  { id: "mascot", label: "Mascot", prompt: "mascot logo, character-based, friendly" },
]

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Food & Beverage",
  "Fashion",
  "Sports",
  "Entertainment",
  "Real Estate",
  "Other",
]

export interface LogoConceptDemoProps {
  /** Default brand name */
  defaultBrandName?: string
}

export function LogoConceptDemo({
  defaultBrandName = "",
}: LogoConceptDemoProps = {}) {
  const [brandName, setBrandName] = useState(defaultBrandName)
  const [description, setDescription] = useState("")
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["icon"])
  const [colorPreference, setColorPreference] = useState("")
  const [industry, setIndustry] = useState("")
  const [concepts, setConcepts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null)

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(s => s !== styleId)
        : [...prev, styleId]
    )
  }

  const handleGenerate = async () => {
    if (!brandName.trim()) return
    setIsLoading(true)
    setConcepts([])
    setSelectedConcept(null)

    const stylePrompts = selectedStyles
      .map(s => LOGO_STYLES.find(ls => ls.id === s)?.prompt)
      .filter(Boolean)
      .join(", ")

    const prompt = `Logo concept sketch for "${brandName}", ${stylePrompts}, ${description ? `representing ${description}` : ""}, ${industry ? `${industry} industry` : ""}, ${colorPreference ? `${colorPreference} colors` : "versatile colors"}, professional logo design, clean lines, memorable, white background`

    try {
      // Generate 6 concept variations
      const results = await Promise.all(
        Array(6).fill(null).map(() =>
          generateImage({
            prompt,
            size: "512x512",
            n: 1,
          })
        )
      )

      const urls = results
        .filter(r => r.images && r.images.length > 0)
        .map(r => `data:${r.images![0].mimeType};base64,${r.images![0].base64}`)

      setConcepts(urls)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          These are AI-generated concept sketches for inspiration only, not final production logos.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Brand Name</Label>
          <Input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Your brand or product name"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your brand represent?"
            className="min-h-[60px]"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Logo Styles</Label>
          <div className="flex flex-wrap gap-2">
            {LOGO_STYLES.map((style) => (
              <Button
                key={style.id}
                variant={selectedStyles.includes(style.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStyle(style.id)}
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Color Preference</Label>
            <Input
              value={colorPreference}
              onChange={(e) => setColorPreference(e.target.value)}
              placeholder="e.g., blue and green"
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">Industry</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind.toLowerCase()}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !brandName.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Concepts...
          </>
        ) : (
          <>
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate Concepts
          </>
        )}
      </Button>

      {concepts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {concepts.map((url, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all hover:border-primary",
                    selectedConcept === i ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                  )}
                  onClick={() => setSelectedConcept(i)}
                >
                  <img
                    src={url}
                    alt={`Concept ${i + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            {selectedConcept !== null && (
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refine This Concept
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
