"use client"

import { useState } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ImageIcon } from "lucide-react"

const DEFAULT_PROMPT = "A serene mountain landscape at sunset with purple clouds"

export interface ImageGenerationDemoProps {
  /** Initial prompt value */
  defaultPrompt?: string
  /** Placeholder for input */
  placeholder?: string
  /** Image size */
  size?: "256x256" | "512x512" | "1024x1024"
  /** Number of images to generate */
  n?: number
}

export function ImageGenerationDemo({
  defaultPrompt = DEFAULT_PROMPT,
  placeholder = "Describe the image...",
  size = "1024x1024",
  n = 1,
}: ImageGenerationDemoProps = {}) {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)
    setImageUrl(null)

    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        size,
        n,
      })
      if (result.images && result.images.length > 0) {
        const img = result.images[0]
        setImageUrl(`data:${img.mimeType};base64,${img.base64}`)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
      </div>
      {isLoading && (
        <Card>
          <CardContent className="p-8 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Generating image...</p>
            </div>
          </CardContent>
        </Card>
      )}
      {imageUrl && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <img src={imageUrl} alt="Generated" className="w-full h-auto" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
