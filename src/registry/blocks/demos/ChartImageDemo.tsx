"use client"

import { useState } from "react"
import { generateImage, generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download, BarChart3 } from "lucide-react"

const CHART_TYPES = [
  { id: "bar", label: "Bar Chart", prompt: "bar chart, vertical bars" },
  { id: "line", label: "Line Chart", prompt: "line chart, trend line with points" },
  { id: "pie", label: "Pie Chart", prompt: "pie chart, circular segments" },
  { id: "donut", label: "Donut Chart", prompt: "donut chart, ring shape" },
  { id: "area", label: "Area Chart", prompt: "area chart, filled under curve" },
]

const COLOR_THEMES = [
  { id: "blue", label: "Blue", colors: "blue color scheme" },
  { id: "rainbow", label: "Rainbow", colors: "rainbow colors, diverse palette" },
  { id: "corporate", label: "Corporate", colors: "professional corporate colors, blue and gray" },
  { id: "warm", label: "Warm", colors: "warm colors, orange and red" },
  { id: "cool", label: "Cool", colors: "cool colors, teal and purple" },
]

export interface ChartImageDemoProps {
  /** Default data description */
  defaultData?: string
  /** Default chart type */
  defaultType?: string
}

export function ChartImageDemo({
  defaultData = "sales growing 20% per quarter",
  defaultType = "bar",
}: ChartImageDemoProps = {}) {
  const [data, setData] = useState(defaultData)
  const [chartType, setChartType] = useState(defaultType)
  const [colorTheme, setColorTheme] = useState("blue")
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!data.trim()) return
    setIsLoading(true)
    setImageUrl(null)

    const chartStyle = CHART_TYPES.find(c => c.id === chartType)
    const colors = COLOR_THEMES.find(c => c.id === colorTheme)

    // First, get AI to interpret the data
    let dataDescription = data
    try {
      const interpretation = await generateText({
        prompt: `Interpret this data for visualization: "${data}"
Respond with a brief description suitable for a chart image prompt.`,
        maxTokens: 100,
      })
      dataDescription = interpretation.text
    } catch (e) {
      // Use original data if interpretation fails
    }

    const prompt = `Beautiful ${chartStyle?.prompt}, visualizing ${dataDescription}, ${colors?.colors}, ${title ? `titled "${title}"` : ""}, clean modern design, professional infographic style, white background, clear labels`

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
          <Label className="text-sm mb-2 block">Data (paste CSV or describe)</Label>
          <Textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder='e.g., "sales growing 20% per quarter" or paste CSV data'
            className="min-h-[60px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Chart Type</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Color Theme</Label>
            <Select value={colorTheme} onValueChange={setColorTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_THEMES.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Title (optional)</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chart title"
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !data.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Chart...
          </>
        ) : (
          <>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Chart
          </>
        )}
      </Button>

      {imageUrl && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <img src={imageUrl} alt="Chart" className="w-full h-auto" />
            <div className="p-3 border-t flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button size="sm" variant="ghost" className="flex-1">
                Edit Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
