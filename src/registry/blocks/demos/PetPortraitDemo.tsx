"use client"

import { useState, useRef, useEffect } from "react"
import { generateImage, generateText, hasCapability } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ImageIcon, Upload, Sparkles, AlertCircle, Eye } from "lucide-react"

// Default sample pet image URL
const DEFAULT_PET_IMAGE_URL =
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80"

// ============================================
// Portrait Style Types & Presets
// ============================================

/**
 * Definition for a portrait style
 */
export interface PortraitStyle {
  /** Unique identifier for the style */
  id: string
  /** Display name */
  name: string
  /** Short description */
  description: string
  /** Function that generates the prompt given a pet description */
  promptTemplate: (petDescription: string) => string
}

/**
 * Default portrait styles - Classic art styles
 */
export const DEFAULT_PORTRAIT_STYLES: PortraitStyle[] = [
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
]

/**
 * Victorian/Historical portrait styles
 */
export const VICTORIAN_PORTRAIT_STYLES: PortraitStyle[] = [
  {
    id: "victorian",
    name: "Victorian",
    description: "19th century formal",
    promptTemplate: (petDescription: string) =>
      `A formal Victorian era portrait of ${petDescription}, wearing elegant 19th century attire with lace collar, sepia tones, ornate picture frame, dignified pose, studio photography style, vintage aesthetic`,
  },
  {
    id: "baroque",
    name: "Baroque",
    description: "Dramatic classical",
    promptTemplate: (petDescription: string) =>
      `A dramatic baroque portrait of ${petDescription} in the style of Rembrandt, rich dark background, golden light illuminating the subject, luxurious velvet fabric, dramatic chiaroscuro lighting, masterpiece quality`,
  },
  {
    id: "rococo",
    name: "Rococo",
    description: "Ornate French style",
    promptTemplate: (petDescription: string) =>
      `An elegant rococo portrait of ${petDescription} in the style of Fragonard, pastel colors, ornate gilded frame, soft romantic lighting, flowers and ribbons, aristocratic French court style, delicate brushwork`,
  },
  {
    id: "medieval",
    name: "Medieval",
    description: "Illuminated manuscript",
    promptTemplate: (petDescription: string) =>
      `A medieval illuminated manuscript portrait of ${petDescription}, gold leaf accents, ornate border decorations, rich jewel tones, Byzantine style, religious icon aesthetic, flat perspective, highly detailed`,
  },
]

/**
 * Modern/Contemporary portrait styles
 */
export const MODERN_PORTRAIT_STYLES: PortraitStyle[] = [
  {
    id: "anime",
    name: "Anime",
    description: "Japanese animation",
    promptTemplate: (petDescription: string) =>
      `An adorable anime style portrait of ${petDescription}, big expressive eyes, soft shading, colorful background with sparkles, Studio Ghibli inspired, kawaii aesthetic, cel shading, vibrant colors`,
  },
  {
    id: "pixar",
    name: "3D Cartoon",
    description: "Pixar-style 3D",
    promptTemplate: (petDescription: string) =>
      `A Pixar-style 3D rendered portrait of ${petDescription}, charming expression, soft lighting, subsurface scattering on fur, big expressive eyes, heartwarming, family-friendly, professional 3D animation quality`,
  },
  {
    id: "vaporwave",
    name: "Vaporwave",
    description: "Retro aesthetic",
    promptTemplate: (petDescription: string) =>
      `A vaporwave aesthetic portrait of ${petDescription}, pink and cyan gradient, geometric shapes, Roman bust elements, palm trees, sunset, 80s retro futurism, glitch effects, nostalgic`,
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean modern art",
    promptTemplate: (petDescription: string) =>
      `A minimalist modern art portrait of ${petDescription}, clean lines, limited color palette, geometric shapes, negative space, Scandinavian design aesthetic, simple yet elegant, contemporary art style`,
  },
]

/**
 * Fantasy portrait styles
 */
export const FANTASY_PORTRAIT_STYLES: PortraitStyle[] = [
  {
    id: "steampunk",
    name: "Steampunk",
    description: "Victorian sci-fi",
    promptTemplate: (petDescription: string) =>
      `A steampunk portrait of ${petDescription} wearing brass goggles and Victorian gear, copper mechanical elements, cogs and gears, sepia and bronze tones, industrial revolution aesthetic, detailed machinery`,
  },
  {
    id: "fairy-tale",
    name: "Fairy Tale",
    description: "Enchanted storybook",
    promptTemplate: (petDescription: string) =>
      `A magical fairy tale portrait of ${petDescription} as an enchanted creature, sparkling magical dust, forest background with glowing mushrooms, whimsical, Disney-inspired, dreamy atmosphere, storybook illustration`,
  },
  {
    id: "superhero",
    name: "Superhero",
    description: "Comic book hero",
    promptTemplate: (petDescription: string) =>
      `A superhero comic book portrait of ${petDescription} wearing a cape and mask, dynamic pose, dramatic lighting, city skyline background, Marvel/DC comic style, bold colors, action-packed`,
  },
  {
    id: "space",
    name: "Space Explorer",
    description: "Cosmic adventure",
    promptTemplate: (petDescription: string) =>
      `An epic space explorer portrait of ${petDescription} in a futuristic astronaut suit, nebula background, stars and galaxies, helmet reflection, sci-fi movie poster style, dramatic cosmic lighting`,
  },
]

// ============================================
// Component Types
// ============================================

export interface PetPortraitDemoProps {
  /** URL of the default pet image to display */
  defaultImageUrl?: string
  /** Default pet description for the prompt (used if vision analysis fails) */
  defaultPetDescription?: string
  /** Image size for generation */
  size?: "256x256" | "512x512" | "1024x1024"
  /** Whether to use vision to analyze the pet image */
  useVision?: boolean
  /** Portrait styles to generate (defaults to DEFAULT_PORTRAIT_STYLES) */
  styles?: PortraitStyle[]
}

interface GeneratedPortrait {
  styleId: string
  styleName: string
  imageUrl: string | null
  isLoading: boolean
  error?: string
}

/**
 * Fetches an image from URL and converts it to base64
 */
async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const blob = await response.blob()
    const mimeType = blob.type || "image/jpeg"

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        // Extract base64 part from data URL
        const base64 = dataUrl.split(",")[1]
        resolve({ base64, mimeType })
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export function PetPortraitDemo({
  defaultImageUrl = DEFAULT_PET_IMAGE_URL,
  defaultPetDescription = "a golden retriever dog with fluffy fur and friendly eyes",
  size = "1024x1024",
  useVision = true,
  styles = DEFAULT_PORTRAIT_STYLES,
}: PetPortraitDemoProps = {}) {
  const [petImageUrl, setPetImageUrl] = useState<string>(defaultImageUrl)
  const [petImageBase64, setPetImageBase64] = useState<string | null>(null)
  const [petImageMimeType, setPetImageMimeType] = useState<string>("image/jpeg")
  const [petDescription, setPetDescription] = useState(defaultPetDescription)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasImageCapability, setHasImageCapability] = useState<boolean | null>(null)
  const [hasVisionCapability, setHasVisionCapability] = useState<boolean | null>(null)
  const [portraits, setPortraits] = useState<GeneratedPortrait[]>([])
  const [imageError, setImageError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const completedCount = useRef(0)

  // Check for capabilities on mount
  useEffect(() => {
    Promise.all([hasCapability("image"), hasCapability("vision")]).then(([image, vision]) => {
      setHasImageCapability(image)
      setHasVisionCapability(vision)
    })
  }, [])

  // Fetch and convert default image URL to base64 on mount or URL change
  useEffect(() => {
    if (petImageUrl && petImageUrl.startsWith("http")) {
      fetchImageAsBase64(petImageUrl).then((result) => {
        if (result) {
          setPetImageBase64(result.base64)
          setPetImageMimeType(result.mimeType)
          setImageError(false)
        } else {
          setImageError(true)
        }
      })
    }
  }, [petImageUrl])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPetImageUrl(dataUrl)
        // Extract base64 from data URL
        const base64 = dataUrl.split(",")[1]
        setPetImageBase64(base64)
        setPetImageMimeType(file.type || "image/jpeg")
        setImageError(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  /**
   * Analyze the pet image using vision to get a detailed description
   */
  const analyzePetImage = async (): Promise<string> => {
    if (!useVision || !hasVisionCapability || !petImageBase64) {
      return petDescription
    }

    setIsAnalyzing(true)
    try {
      const result = await generateText({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this pet in detail for an AI image generator. Include: species, breed (if identifiable), color/markings, fur texture, distinctive features, expression, and pose. Be specific and descriptive. Output only the description, no preamble.",
              },
              {
                type: "image",
                image: petImageBase64,
                mimeType: petImageMimeType,
              },
            ],
          },
        ],
        maxTokens: 200,
        temperature: 0.7,
      })
      return result.text.trim() || petDescription
    } catch (error) {
      console.error("Vision analysis failed:", error)
      return petDescription
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generatePortraits = async () => {
    if (!petDescription.trim() && !petImageBase64) return

    setIsGenerating(true)
    completedCount.current = 0

    // Analyze the pet image if vision is available
    const enhancedDescription = await analyzePetImage()

    // Initialize all portraits as loading
    const initialPortraits: GeneratedPortrait[] = styles.map((style) => ({
      styleId: style.id,
      styleName: style.name,
      imageUrl: null,
      isLoading: true,
    }))
    setPortraits(initialPortraits)

    // Generate all images in parallel using .then() for progressive display
    styles.forEach((style) => {
      const prompt = style.promptTemplate(enhancedDescription)

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
          if (completedCount.current >= styles.length) {
            setIsGenerating(false)
          }
        })
    })
  }

  // Determine grid columns based on number of styles
  const getGridCols = () => {
    const count = styles.length
    if (count <= 2) return "grid-cols-2"
    if (count <= 3) return "grid-cols-3"
    return "grid-cols-2 md:grid-cols-4"
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
                {imageError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xs">Could not load image</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={petImageUrl}
                    alt="Your pet"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
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
              <p className="text-xs text-muted-foreground text-center mt-2">Click to upload</p>
              {hasVisionCapability && useVision && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Vision enabled</p>
                </div>
              )}
            </div>

            {/* Description and Style Selection */}
            <div className="flex-1 space-y-4">
              <div>
                <label htmlFor="pet-description" className="text-sm font-medium block mb-1.5">
                  Describe your pet {hasVisionCapability && useVision && "(optional with vision)"}
                </label>
                <textarea
                  id="pet-description"
                  value={petDescription}
                  onChange={(e) => setPetDescription(e.target.value)}
                  placeholder="e.g., a fluffy orange tabby cat with green eyes"
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-none h-20"
                />
                {hasVisionCapability && useVision && (
                  <p className="text-xs text-muted-foreground mt-1">
                    With vision enabled, your pet's photo will be analyzed automatically for better
                    results.
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Styles to generate:</p>
                <div className="flex flex-wrap gap-2">
                  {styles.map((style) => (
                    <Badge key={style.id} variant="secondary" className="text-xs">
                      {style.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={generatePortraits}
                disabled={isGenerating || isAnalyzing || (!petDescription.trim() && !petImageBase64)}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Eye className="h-4 w-4 animate-pulse mr-2" />
                    Analyzing pet photo...
                  </>
                ) : isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating portraits...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {styles.length} Portrait{styles.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Portraits Grid */}
      {portraits.length > 0 && (
        <div className={`grid ${getGridCols()} gap-4`}>
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
              {hasVisionCapability && useVision
                ? `Upload your pet's photo and we'll analyze it automatically to create ${styles.length} unique AI portrait${styles.length !== 1 ? "s" : ""}.`
                : `Upload your pet's photo, describe them, and click generate to create ${styles.length} unique AI portrait${styles.length !== 1 ? "s" : ""}.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
