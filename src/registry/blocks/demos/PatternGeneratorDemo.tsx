"use client"

import { useState } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Download, Copy, Grid3X3 } from "lucide-react"

const STYLE_PRESETS = [
  "geometric memphis",
  "organic floral",
  "tech circuit",
  "art deco",
  "japanese wave",
  "tribal aztec",
]

export interface PatternGeneratorDemoProps {
  /** Default style prompt */
  defaultStyle?: string
  /** Default color palette */
  defaultColors?: string
}

export function PatternGeneratorDemo({
  defaultStyle = "geometric memphis",
  defaultColors = "warm",
}: PatternGeneratorDemoProps = {}) {
  const [style, setStyle] = useState(defaultStyle)
  const [colors, setColors] = useState(defaultColors)
  const [patternUrl, setPatternUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!style.trim()) return
    setIsLoading(true)
    setPatternUrl(null)

    const colorPrompt = colors.includes("#")
      ? `using colors ${colors}`
      : `${colors} color palette`

    const prompt = `Seamless tileable pattern, ${style.trim()}, ${colorPrompt}, repeating design, suitable for backgrounds`

    try {
      const result = await generateImage({
        prompt,
        size: "512x512",
        n: 1,
      })

      if (result.images && result.images.length > 0) {
        setPatternUrl(`data:${result.images[0].mimeType};base64,${result.images[0].base64}`)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCssCode = () => {
    if (!patternUrl) return ""
    return `background-image: url('${patternUrl.substring(0, 50)}...');
background-repeat: repeat;
background-size: 200px 200px;`
  }

  const handleCopyCss = async () => {
    await navigator.clipboard.writeText(getCssCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Style</Label>
          <Input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder='e.g., "geometric memphis", "organic floral"'
          />
          <div className="flex flex-wrap gap-1 mt-2">
            {STYLE_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => setStyle(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Color Palette</Label>
          <Input
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder='e.g., "warm", "cool", "#ff0000, #00ff00"'
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !style.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Pattern...
          </>
        ) : (
          <>
            <Grid3X3 className="h-4 w-4 mr-2" />
            Generate Pattern
          </>
        )}
      </Button>

      {patternUrl && (
        <div className="space-y-3">
          {/* Preview showing the pattern tiled */}
          <Card>
            <CardContent className="p-0">
              <div
                className="h-48 rounded-lg"
                style={{
                  backgroundImage: `url(${patternUrl})`,
                  backgroundRepeat: "repeat",
                  backgroundSize: "100px 100px",
                }}
              />
            </CardContent>
          </Card>

          {/* Single tile preview */}
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-2">Single Tile</p>
              <img
                src={patternUrl}
                alt="Pattern tile"
                className="w-32 h-32 border rounded"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              PNG
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              SVG
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleCopyCss}
            >
              <Copy className="h-4 w-4 mr-1" />
              {copied ? "Copied!" : "CSS"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
