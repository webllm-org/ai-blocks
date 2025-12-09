"use client"

import { useState } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Download, User } from "lucide-react"
import { cn } from "@/lib/utils"

const STYLES = [
  { id: "pixel-art", label: "Pixel Art", prompt: "pixel art style, 8-bit, retro game aesthetic" },
  { id: "anime", label: "Anime", prompt: "anime style, manga illustration, vibrant colors" },
  { id: "minimalist", label: "Minimalist", prompt: "minimalist style, simple shapes, clean lines" },
  { id: "corporate", label: "Corporate", prompt: "professional corporate style, clean, modern" },
  { id: "3d-render", label: "3D Render", prompt: "3D rendered, octane render, detailed textures" },
  { id: "watercolor", label: "Watercolor", prompt: "watercolor painting style, soft edges, artistic" },
]

export interface AvatarGeneratorDemoProps {
  /** Default description for character */
  defaultDescription?: string
  /** Default style selection */
  defaultStyle?: string
}

export function AvatarGeneratorDemo({
  defaultDescription = "A friendly developer with glasses and a warm smile",
  defaultStyle = "minimalist",
}: AvatarGeneratorDemoProps = {}) {
  const [description, setDescription] = useState(defaultDescription)
  const [selectedStyle, setSelectedStyle] = useState(defaultStyle)
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setIsLoading(true)
    setImages([])

    const style = STYLES.find(s => s.id === selectedStyle)
    const prompt = `Avatar portrait of ${description.trim()}, ${style?.prompt || ""}, centered composition, profile picture suitable for social media`

    try {
      // Generate 4 variations
      const results = await Promise.all(
        Array(4).fill(null).map(() =>
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

      setImages(urls)
    } catch (error) {
      console.error("Error generating avatars:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `avatar-${selectedStyle}-${index + 1}.png`
    link.click()
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the character or upload a reference..."
        className="min-h-[80px]"
      />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STYLES.map((style) => (
          <Button
            key={style.id}
            variant={selectedStyle === style.id ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setSelectedStyle(style.id)}
          >
            {style.label}
          </Button>
        ))}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !description.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Avatars...
          </>
        ) : (
          <>
            <User className="h-4 w-4 mr-2" />
            Generate Avatars
          </>
        )}
      </Button>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((url, i) => (
            <Card key={i} className="overflow-hidden group relative">
              <CardContent className="p-0">
                <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-auto" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(url, i)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
