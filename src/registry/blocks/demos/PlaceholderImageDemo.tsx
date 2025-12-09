"use client"

import { useState } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Copy, Download, ImageIcon } from "lucide-react"

const SIZE_PRESETS = [
  { id: "avatar", label: "Avatar 64x64", size: "256x256", display: "64x64" },
  { id: "thumbnail", label: "Thumbnail 300x200", size: "512x512", display: "300x200" },
  { id: "hero", label: "Hero 1920x1080", size: "1024x1024", display: "1920x1080" },
  { id: "og", label: "OG Image 1200x630", size: "1024x1024", display: "1200x630" },
  { id: "square", label: "Square 512x512", size: "512x512", display: "512x512" },
  { id: "custom", label: "Custom", size: "512x512", display: "Custom" },
]

const STYLES = [
  { id: "photo", label: "Photo-realistic" },
  { id: "illustration", label: "Illustration" },
  { id: "abstract", label: "Abstract" },
  { id: "wireframe", label: "Wireframe" },
]

export interface PlaceholderImageDemoProps {
  /** Default prompt */
  defaultPrompt?: string
  /** Default size preset */
  defaultSize?: string
}

export function PlaceholderImageDemo({
  defaultPrompt = "happy team meeting",
  defaultSize = "thumbnail",
}: PlaceholderImageDemoProps = {}) {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [sizePreset, setSizePreset] = useState(defaultSize)
  const [style, setStyle] = useState("photo")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)
    setImageUrl(null)

    const selectedStyle = STYLES.find(s => s.id === style)
    const stylePrompt = style === "wireframe"
      ? "wireframe sketch, grayscale, simple lines"
      : style === "abstract"
      ? "abstract pattern, geometric shapes, artistic"
      : style === "illustration"
      ? "digital illustration, flat design, vector style"
      : "high quality stock photo, professional"

    const preset = SIZE_PRESETS.find(p => p.id === sizePreset)

    try {
      const result = await generateImage({
        prompt: `${prompt.trim()}, ${stylePrompt}, suitable for placeholder image`,
        size: preset?.size as "256x256" | "512x512" | "1024x1024" || "512x512",
        n: 1,
      })

      if (result.images && result.images.length > 0) {
        setImageUrl(`data:${result.images[0].mimeType};base64,${result.images[0].base64}`)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyBase64 = async () => {
    if (imageUrl) {
      await navigator.clipboard.writeText(imageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Describe your placeholder</Label>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., happy team meeting, abstract tech pattern"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Size Preset</Label>
            <Select value={sizePreset} onValueChange={setSizePreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_PRESETS.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4 mr-2" />
            Generate Placeholder
          </>
        )}
      </Button>

      {imageUrl && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <img src={imageUrl} alt="Placeholder" className="w-full h-auto" />
            <div className="p-3 border-t flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyBase64}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? "Copied!" : "Copy as Base64"}
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
