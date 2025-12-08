"use client"

import { useState } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Download, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

const ICON_STYLES = [
  { id: "line", label: "Line", prompt: "line icon, thin strokes, outline style" },
  { id: "filled", label: "Filled", prompt: "filled icon, solid shapes, flat design" },
  { id: "duotone", label: "Duotone", prompt: "duotone icon, two-tone color scheme" },
  { id: "3d", label: "3D", prompt: "3D icon, rendered, depth and shadows" },
  { id: "gradient", label: "Gradient", prompt: "gradient icon, colorful gradient fill" },
]

const SIZES = ["24", "32", "48", "64", "128"]

export interface IconGeneratorDemoProps {
  /** Default icon concept */
  defaultConcept?: string
  /** Default style */
  defaultStyle?: string
  /** Default color */
  defaultColor?: string
}

export function IconGeneratorDemo({
  defaultConcept = "secure payment",
  defaultStyle = "line",
  defaultColor = "#3b82f6",
}: IconGeneratorDemoProps = {}) {
  const [concept, setConcept] = useState(defaultConcept)
  const [selectedStyle, setSelectedStyle] = useState(defaultStyle)
  const [color, setColor] = useState(defaultColor)
  const [selectedSize, setSelectedSize] = useState("48")
  const [icons, setIcons] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!concept.trim()) return
    setIsLoading(true)
    setIcons([])

    const style = ICON_STYLES.find(s => s.id === selectedStyle)
    const prompt = `Icon representing "${concept.trim()}", ${style?.prompt}, single icon on white background, suitable for app or website, clean and minimal`

    try {
      // Generate 6 variations
      const results = await Promise.all(
        Array(6).fill(null).map(() =>
          generateImage({
            prompt,
            size: "256x256",
            n: 1,
          })
        )
      )

      const urls = results
        .filter(r => r.images && r.images.length > 0)
        .map(r => `data:${r.images![0].mimeType};base64,${r.images![0].base64}`)

      setIcons(urls)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Icon Concept</Label>
          <Input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder='e.g., "secure payment", "notification bell"'
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Style</Label>
          <div className="flex flex-wrap gap-2">
            {ICON_STYLES.map((style) => (
              <Button
                key={style.id}
                variant={selectedStyle === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle(style.id)}
              >
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Size</Label>
            <div className="flex flex-wrap gap-1">
              {SIZES.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  className="text-xs px-2"
                  onClick={() => setSelectedSize(size)}
                >
                  {size}px
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block">Color</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-9 p-1 cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !concept.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Icons...
          </>
        ) : (
          <>
            <Palette className="h-4 w-4 mr-2" />
            Generate Icons
          </>
        )}
      </Button>

      {icons.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {icons.map((url, i) => (
                <div
                  key={i}
                  className="relative group aspect-square border rounded-lg p-2 flex items-center justify-center bg-white"
                >
                  <img
                    src={url}
                    alt={`Icon ${i + 1}`}
                    className="max-w-full max-h-full object-contain"
                    style={{ width: `${selectedSize}px`, height: `${selectedSize}px` }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button size="sm" variant="secondary">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1">
                Export as SVG
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Export as PNG
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
