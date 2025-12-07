"use client"

import { useState, useRef, useEffect } from "react"
import { generateImage, hasCapability } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ImageIcon, Upload, Sparkles, AlertCircle } from "lucide-react"

// Default sample pet image (a cute dog placeholder)
const DEFAULT_PET_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect fill='%23f3f4f6' width='300' height='300'/%3E%3Ccircle cx='150' cy='130' r='80' fill='%23d1d5db'/%3E%3Ccircle cx='120' cy='110' r='12' fill='%23374151'/%3E%3Ccircle cx='180' cy='110' r='12' fill='%23374151'/%3E%3Cellipse cx='150' cy='145' rx='15' ry='10' fill='%23374151'/%3E%3Cellipse cx='90' cy='80' r='25' ry='35' fill='%23d1d5db'/%3E%3Cellipse cx='210' cy='80' r='25' ry='35' fill='%23d1d5db'/%3E%3Ctext x='150' y='250' text-anchor='middle' fill='%236b7280' font-family='system-ui' font-size='14'%3EUpload your pet photo%3C/text%3E%3C/svg%3E"

// Portrait styles with their prompts
const PORTRAIT_STYLES = [
  {
    id: "renaissance",
    name: "Renaissance",
    description: "Classical oil painting",
    promptTemplate: (petDescription: string) =>
      `A majestic renaissance oil painting portrait of ${petDescription}, wearing noble aristocratic clothing, ornate gold frame background, dramatic lighting, classical master painter style, highly detailed, museum quality artwork`,
  },
  {
    id: "pop-art",
    name: "Pop Art",
    description: "Bold Warhol style",
    promptTemplate: (petDescription: string) =>
      `A vibrant pop art portrait of ${petDescription} in Andy Warhol style, bold contrasting colors, halftone dots, comic book aesthetic, bright neon pink blue yellow, screen print look, iconic pop culture style`,
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft artistic style",
    promptTemplate: (petDescription: string) =>
      `A beautiful watercolor painting portrait of ${petDescription}, soft flowing colors, gentle brush strokes, artistic splashes, delicate details, ethereal dreamy atmosphere, professional watercolor artist style`,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic neon",
    promptTemplate: (petDescription: string) =>
      `A cyberpunk portrait of ${petDescription} as a futuristic cyber warrior, neon lights, holographic elements, chrome accents, rain-soaked city background, purple and cyan glow, high tech low life aesthetic, blade runner inspired`,
  },
] as const

type StyleId = (typeof PORTRAIT_STYLES)[number]["id"]

export interface PetPortraitDemoProps {
  /** Default pet description for the prompt */
  defaultPetDescription?: string
  /** Image size for generation */
  size?: "256x256" | "512x512" | "1024x1024"
}

interface GeneratedPortrait {
  styleId: StyleId
  styleName: string
  imageUrl: string | null
  isLoading: boolean
  error?: string
}

export function PetPortraitDemo({
  defaultPetDescription = "a golden retriever dog with fluffy fur and friendly eyes",
  size = "1024x1024",
}: PetPortraitDemoProps = {}) {
  const [petImage, setPetImage] = useState<string>(DEFAULT_PET_IMAGE)
  const [petDescription, setPetDescription] = useState(defaultPetDescription)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasImageCapability, setHasImageCapability] = useState<boolean | null>(null)
  const [portraits, setPortraits] = useState<GeneratedPortrait[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const completedCount = useRef(0)

  // Check for image generation capability on mount
  useEffect(() => {
    hasCapability("image").then(setHasImageCapability)
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPetImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const generatePortraits = () => {
    if (!petDescription.trim()) return

    setIsGenerating(true)
    completedCount.current = 0

    // Initialize all 4 portraits as loading
    const initialPortraits: GeneratedPortrait[] = PORTRAIT_STYLES.map((style) => ({
      styleId: style.id,
      styleName: style.name,
      imageUrl: null,
      isLoading: true,
    }))
    setPortraits(initialPortraits)

    // Generate all 4 images in parallel using .then() for progressive display
    PORTRAIT_STYLES.forEach((style) => {
      const prompt = style.promptTemplate(petDescription.trim())

      generateImage({
        prompt,
        size,
        n: 1,
      })
        .then((result) => {
          // Update this specific portrait when ready
          setPortraits((prev) =>
            prev.map((p) => {
              if (p.styleId === style.id) {
                if (result.images && result.images.length > 0) {
                  const img = result.images[0]
                  return {
                    ...p,
                    imageUrl: `data:${img.mimeType};base64,${img.base64}`,
                    isLoading: false,
                  }
                }
                return { ...p, isLoading: false, error: "No image generated" }
              }
              return p
            })
          )
        })
        .catch((error) => {
          console.error(`Error generating ${style.name} portrait:`, error)
          setPortraits((prev) =>
            prev.map((p) =>
              p.styleId === style.id
                ? { ...p, isLoading: false, error: error.message || "Generation failed" }
                : p
            )
          )
        })
        .finally(() => {
          // Track completion and turn off generating state when all done
          completedCount.current += 1
          if (completedCount.current >= PORTRAIT_STYLES.length) {
            setIsGenerating(false)
          }
        })
    })
  }

  // Show unsupported message if no image capability
  if (hasImageCapability === false) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Image generation is not available. Please configure a provider with image capabilities
            (OpenAI, Stability AI, Replicate, etc.).
          </p>
        </CardContent>
      </Card>
    )
  }

  // Show loading while checking capabilities
  if (hasImageCapability === null) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Upload Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Pet Image Preview */}
            <div className="flex-shrink-0">
              <div
                className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={triggerFileUpload}
              >
                <img
                  src={petImage}
                  alt="Your pet"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                Click to upload
              </p>
            </div>

            {/* Description and Style Selection */}
            <div className="flex-1 space-y-4">
              <div>
                <label htmlFor="pet-description" className="text-sm font-medium block mb-1.5">
                  Describe your pet
                </label>
                <textarea
                  id="pet-description"
                  value={petDescription}
                  onChange={(e) => setPetDescription(e.target.value)}
                  placeholder="e.g., a fluffy orange tabby cat with green eyes"
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-none h-20"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Styles to generate:</p>
                <div className="flex flex-wrap gap-2">
                  {PORTRAIT_STYLES.map((style) => (
                    <Badge key={style.id} variant="secondary" className="text-xs">
                      {style.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={generatePortraits}
                disabled={isGenerating || !petDescription.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating portraits...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate 4 Portrait Styles
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Portraits Grid */}
      {portraits.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {portraits.map((portrait) => (
            <Card key={portrait.styleId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  {portrait.isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="text-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{portrait.styleName}</p>
                      </div>
                    </div>
                  ) : portrait.error ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="text-center p-4">
                        <AlertCircle className="h-6 w-6 mx-auto text-destructive mb-2" />
                        <p className="text-xs text-muted-foreground">{portrait.error}</p>
                      </div>
                    </div>
                  ) : portrait.imageUrl ? (
                    <img
                      src={portrait.imageUrl}
                      alt={`${portrait.styleName} portrait`}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-2 text-center border-t">
                  <p className="text-xs font-medium">{portrait.styleName}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state before generation */}
      {portraits.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              Upload your pet's photo, describe them, and click generate to create 4 unique AI
              portraits in different artistic styles.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
