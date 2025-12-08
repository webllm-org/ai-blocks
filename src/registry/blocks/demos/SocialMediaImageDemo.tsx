"use client"

import { useState } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Share } from "lucide-react"

const PLATFORMS = [
  { id: "instagram-square", label: "Instagram Square", size: "1024x1024", aspect: "1:1" },
  { id: "instagram-story", label: "Instagram Story", size: "1024x1024", aspect: "9:16" },
  { id: "twitter", label: "Twitter", size: "1024x1024", aspect: "16:9" },
  { id: "linkedin", label: "LinkedIn", size: "1024x1024", aspect: "1.91:1" },
  { id: "youtube", label: "YouTube Thumbnail", size: "1024x1024", aspect: "16:9" },
]

const BG_STYLES = [
  { id: "gradient", label: "Gradient" },
  { id: "photo", label: "Photo" },
  { id: "pattern", label: "Pattern" },
  { id: "solid", label: "Solid Color" },
]

export interface SocialMediaImageDemoProps {
  /** Default content/headline */
  defaultContent?: string
}

export function SocialMediaImageDemo({
  defaultContent = "Launching our new feature today! 🚀",
}: SocialMediaImageDemoProps = {}) {
  const [content, setContent] = useState(defaultContent)
  const [selectedPlatform, setSelectedPlatform] = useState("instagram-square")
  const [bgStyle, setBgStyle] = useState("gradient")
  const [brandColor, setBrandColor] = useState("#3b82f6")
  const [images, setImages] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!content.trim()) return
    setIsLoading(true)

    const platform = PLATFORMS.find(p => p.id === selectedPlatform)
    const bgPrompt = bgStyle === "gradient"
      ? "beautiful gradient background"
      : bgStyle === "photo"
      ? "professional photo background, blurred"
      : bgStyle === "pattern"
      ? "subtle pattern background"
      : "solid color background"

    const prompt = `Social media post image for ${platform?.label}, ${bgPrompt}, featuring text "${content.trim()}", modern design, professional, ${platform?.aspect} aspect ratio, marketing visual`

    try {
      const result = await generateImage({
        prompt,
        size: platform?.size as "1024x1024" || "1024x1024",
        n: 1,
      })

      if (result.images && result.images.length > 0) {
        setImages(prev => ({
          ...prev,
          [selectedPlatform]: `data:${result.images![0].mimeType};base64,${result.images![0].base64}`,
        }))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAll = async () => {
    setIsLoading(true)
    const newImages: Record<string, string> = {}

    for (const platform of PLATFORMS) {
      const bgPrompt = bgStyle === "gradient"
        ? "beautiful gradient background"
        : bgStyle === "photo"
        ? "professional photo background, blurred"
        : bgStyle === "pattern"
        ? "subtle pattern background"
        : "solid color background"

      const prompt = `Social media post image for ${platform.label}, ${bgPrompt}, featuring text "${content.trim()}", modern design, professional, ${platform.aspect} aspect ratio`

      try {
        const result = await generateImage({
          prompt,
          size: platform.size as "1024x1024",
          n: 1,
        })

        if (result.images && result.images.length > 0) {
          newImages[platform.id] = `data:${result.images[0].mimeType};base64,${result.images[0].base64}`
        }
      } catch (error) {
        console.error(`Error generating ${platform.id}:`, error)
      }
    }

    setImages(newImages)
    setIsLoading(false)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Content / Headline</Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your post content or headline"
            className="min-h-[60px]"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Background Style</Label>
          <div className="flex flex-wrap gap-2">
            {BG_STYLES.map((style) => (
              <Button
                key={style.id}
                variant={bgStyle === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => setBgStyle(style.id)}
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Brand Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-12 h-9 p-1 cursor-pointer"
            />
            <Input
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
        <TabsList className="grid grid-cols-5 w-full">
          {PLATFORMS.map((platform) => (
            <TabsTrigger key={platform.id} value={platform.id} className="text-xs">
              {platform.label.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {PLATFORMS.map((platform) => (
          <TabsContent key={platform.id} value={platform.id}>
            {images[platform.id] ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <img
                    src={images[platform.id]}
                    alt={platform.label}
                    className="w-full h-auto"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">Click Generate to create {platform.label} image</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !content.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Share className="h-4 w-4 mr-1" />
              Generate
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleGenerateAll}
          disabled={isLoading || !content.trim()}
        >
          <Download className="h-4 w-4 mr-1" />
          Generate All
        </Button>
      </div>
    </div>
  )
}
