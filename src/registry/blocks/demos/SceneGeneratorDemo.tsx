"use client"

import { useState } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, Download, RefreshCw, Clapperboard } from "lucide-react"

const SCENE_STYLES = [
  { id: "realistic", label: "Realistic", prompt: "photorealistic, highly detailed" },
  { id: "illustrated", label: "Illustrated", prompt: "digital illustration, artistic" },
  { id: "isometric", label: "Isometric", prompt: "isometric view, 3D illustration" },
  { id: "anime", label: "Anime", prompt: "anime style, japanese animation" },
  { id: "pixel", label: "Pixel Art", prompt: "pixel art, 16-bit, retro game style" },
  { id: "watercolor", label: "Watercolor", prompt: "watercolor painting, soft edges" },
]

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 Widescreen" },
  { id: "1:1", label: "1:1 Square" },
  { id: "4:3", label: "4:3 Standard" },
  { id: "9:16", label: "9:16 Portrait" },
]

export interface SceneGeneratorDemoProps {
  /** Default scene description */
  defaultDescription?: string
  /** Default style */
  defaultStyle?: string
}

export function SceneGeneratorDemo({
  defaultDescription = "cozy coffee shop interior, rainy day outside, warm lighting",
  defaultStyle = "realistic",
}: SceneGeneratorDemoProps = {}) {
  const [description, setDescription] = useState(defaultDescription)
  const [selectedStyle, setSelectedStyle] = useState(defaultStyle)
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [mood, setMood] = useState([50]) // 0 = brighter, 100 = moodier
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getMoodPrompt = () => {
    const moodValue = mood[0]
    if (moodValue < 30) return "bright, cheerful lighting, uplifting atmosphere"
    if (moodValue < 50) return "natural lighting, pleasant atmosphere"
    if (moodValue < 70) return "atmospheric lighting, ambient mood"
    return "moody lighting, dramatic shadows, cinematic atmosphere"
  }

  const handleGenerate = async () => {
    if (!description.trim()) return
    setIsLoading(true)
    setImageUrl(null)

    const style = SCENE_STYLES.find(s => s.id === selectedStyle)
    const moodPrompt = getMoodPrompt()

    const prompt = `${description.trim()}, ${style?.prompt}, ${moodPrompt}, beautiful scene, high quality, ${aspectRatio} aspect ratio`

    try {
      const result = await generateImage({
        prompt,
        size: "1024x1024",
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

  const handleVariation = async () => {
    // Generate a variation with slightly modified mood
    const newMood = Math.random() * 100
    setMood([newMood])
    handleGenerate()
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Scene Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the scene you want to create..."
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Style</Label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCENE_STYLES.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ar) => (
                  <SelectItem key={ar.id} value={ar.id}>
                    {ar.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">
            Mood: {mood[0] < 50 ? "Brighter" : "Moodier"}
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">☀️</span>
            <Slider
              value={mood}
              onValueChange={setMood}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">🌙</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !description.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Scene...
          </>
        ) : (
          <>
            <Clapperboard className="h-4 w-4 mr-2" />
            Generate Scene
          </>
        )}
      </Button>

      {imageUrl && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <img src={imageUrl} alt="Generated scene" className="w-full h-auto" />
            <div className="p-3 border-t flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleVariation}
                className="flex-1"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Variations
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
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
