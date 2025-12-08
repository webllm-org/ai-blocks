"use client"

import { useState } from "react"
import { generateImage, generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download, GitBranch, ZoomIn, ZoomOut } from "lucide-react"

const DIAGRAM_TYPES = [
  { id: "flowchart", label: "Flowchart", prompt: "flowchart diagram with boxes and arrows" },
  { id: "sequence", label: "Sequence Diagram", prompt: "sequence diagram with actors and messages" },
  { id: "architecture", label: "Architecture", prompt: "system architecture diagram with components" },
  { id: "mindmap", label: "Mind Map", prompt: "mind map with central idea and branches" },
  { id: "orgchart", label: "Org Chart", prompt: "organizational chart with hierarchy" },
  { id: "er", label: "ER Diagram", prompt: "entity relationship diagram with tables" },
]

const STYLE_THEMES = [
  { id: "modern", label: "Modern", style: "clean modern design, flat colors" },
  { id: "sketch", label: "Sketch", style: "hand-drawn sketch style, informal" },
  { id: "corporate", label: "Corporate", style: "professional corporate style, blue tones" },
  { id: "colorful", label: "Colorful", style: "vibrant colors, playful" },
]

export interface DiagramGeneratorDemoProps {
  /** Default description */
  defaultDescription?: string
  /** Default diagram type */
  defaultType?: string
}

export function DiagramGeneratorDemo({
  defaultDescription = "user signs up, verifies email, completes profile, gets matched",
  defaultType = "flowchart",
}: DiagramGeneratorDemoProps = {}) {
  const [description, setDescription] = useState(defaultDescription)
  const [diagramType, setDiagramType] = useState(defaultType)
  const [styleTheme, setStyleTheme] = useState("modern")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [zoom, setZoom] = useState(1)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setIsLoading(true)
    setImageUrl(null)

    const diagram = DIAGRAM_TYPES.find(d => d.id === diagramType)
    const style = STYLE_THEMES.find(s => s.id === styleTheme)

    // First, structure the description
    let structuredPrompt = description
    try {
      const structured = await generateText({
        prompt: `Convert this process description into a clear ${diagram?.label} structure:
"${description}"

Describe the visual elements needed for this ${diagram?.label} in detail.`,
        maxTokens: 200,
      })
      structuredPrompt = structured.text
    } catch (e) {
      // Use original if structuring fails
    }

    const prompt = `${diagram?.prompt}, showing: ${structuredPrompt}, ${style?.style}, white background, clear readable text, professional diagram, high quality`

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

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Describe the process or system</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., user signs up, verifies email, completes profile..."
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Diagram Type</Label>
            <Select value={diagramType} onValueChange={setDiagramType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIAGRAM_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Style</Label>
            <Select value={styleTheme} onValueChange={setStyleTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_THEMES.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            Generating Diagram...
          </>
        ) : (
          <>
            <GitBranch className="h-4 w-4 mr-2" />
            Generate Diagram
          </>
        )}
      </Button>

      {imageUrl && (
        <Card>
          <CardContent className="p-2">
            <div className="relative overflow-auto max-h-[400px] border rounded">
              <img
                src={imageUrl}
                alt="Diagram"
                className="transition-transform origin-top-left"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  SVG
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  PNG
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
