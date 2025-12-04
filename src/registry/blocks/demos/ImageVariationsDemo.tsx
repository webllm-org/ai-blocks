"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Image as ImageIcon, Shuffle, Sparkles } from "lucide-react"

export interface SampleImage {
  id: number
  name: string
  description: string
  placeholder: string
}

const DEFAULT_SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 1,
    name: "Mountain Landscape",
    description: "A serene mountain landscape with snow-capped peaks and a clear lake",
    placeholder: "🏔️"
  },
  {
    id: 2,
    name: "City Skyline",
    description: "Modern city skyline at sunset with reflections on water",
    placeholder: "🌆"
  },
  {
    id: 3,
    name: "Abstract Art",
    description: "Colorful abstract geometric shapes with flowing patterns",
    placeholder: "🎨"
  }
]

type Variation = {
  style: string
  description: string
}

export interface ImageVariationsDemoProps {
  /** Available sample images */
  sampleImages?: SampleImage[]
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function ImageVariationsDemo({
  sampleImages = DEFAULT_SAMPLE_IMAGES,
  temperature = 0.8,
  maxTokens = 300,
}: ImageVariationsDemoProps = {}) {
  const [selectedImage, setSelectedImage] = useState(sampleImages[0])
  const [variations, setVariations] = useState<Variation[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateVariations = async () => {

    setIsGenerating(true)
    setVariations([])

    try {
      const result = await generateText({
        prompt: `Given this image description: "${selectedImage.description}"

Generate 4 creative variations of this image in different styles. Return JSON array:
[
  {"style": "Style Name", "description": "20-word max description of the variation"}
]

Styles to try: oil painting, minimalist, cyberpunk, watercolor, vintage, anime, etc.

JSON:`,
        temperature,
        maxTokens,
      })

      try {
        const jsonMatch = result.text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setVariations(parsed.slice(0, 4))
        }
      } catch {
        setVariations([
          { style: "Oil Painting", description: "Classic oil painting style with rich textures and bold brushstrokes" },
          { style: "Minimalist", description: "Simplified shapes and muted colors, essential elements only" },
          { style: "Vintage", description: "Sepia tones and aged appearance like an old photograph" },
          { style: "Neon", description: "Glowing neon colors with dark background, cyberpunk aesthetic" }
        ])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsGenerating(false)
    }
  }


  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Image Selection */}
      <div className="flex gap-2 justify-center">
        {sampleImages.map(img => (
          <Button
            key={img.id}
            variant={selectedImage.id === img.id ? "default" : "outline"}
            onClick={() => setSelectedImage(img)}
            className="gap-2"
          >
            <span className="text-lg">{img.placeholder}</span>
            {img.name}
          </Button>
        ))}
      </div>

      {/* Original Image Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Original Image
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateVariations}
              disabled={isGenerating}
            >
              <Shuffle className={`h-4 w-4 mr-1 ${isGenerating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
            <span className="text-6xl">{selectedImage.placeholder}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{selectedImage.description}</p>
        </CardContent>
      </Card>

      {/* Variations Grid */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">AI-Generated Style Variations</span>
      </div>

      {isGenerating ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-lg mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mb-1" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : variations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">Click to generate style variations</p>
            <Button onClick={generateVariations} size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Variations
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {variations.map((variation, index) => (
            <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-4xl opacity-50">{selectedImage.placeholder}</span>
                </div>
                <Badge variant="secondary" className="mb-1">{variation.style}</Badge>
                <p className="text-xs text-muted-foreground">{variation.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        In production, this would use image generation APIs to create actual visual variations
      </p>
    </div>
  )
}
