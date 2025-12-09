"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, ArrowLeftRight } from "lucide-react"

const LAYOUTS = [
  { id: "slider", label: "Slider" },
  { id: "side-by-side", label: "Side by Side" },
  { id: "animated", label: "Animated GIF" },
]

export interface BeforeAfterImageDemoProps {
  /** Default before label */
  beforeLabel?: string
  /** Default after label */
  afterLabel?: string
}

export function BeforeAfterImageDemo({
  beforeLabel = "Before",
  afterLabel = "After",
}: BeforeAfterImageDemoProps = {}) {
  const [beforeImage, setBeforeImage] = useState<string | null>(null)
  const [afterImage, setAfterImage] = useState<string | null>(null)
  const [layout, setLayout] = useState("slider")
  const [sliderPosition, setSliderPosition] = useState([50])
  const [beforeLabelText, setBeforeLabelText] = useState(beforeLabel)
  const [afterLabelText, setAfterLabelText] = useState(afterLabel)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setter(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const renderSlider = () => (
    <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: "16/9" }}>
      {/* After image (background) */}
      {afterImage && (
        <img
          src={afterImage}
          alt={afterLabelText}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Before image (clipped) */}
      {beforeImage && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition[0]}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabelText}
            className="w-full h-full object-cover"
            style={{ width: `${100 / (sliderPosition[0] / 100)}%`, maxWidth: "none" }}
          />
        </div>
      )}

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${sliderPosition[0]}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <ArrowLeftRight className="h-4 w-4 text-gray-700" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {beforeLabelText}
      </div>
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {afterLabelText}
      </div>
    </div>
  )

  const renderSideBySide = () => (
    <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        {beforeImage ? (
          <img src={beforeImage} alt={beforeLabelText} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {beforeLabelText}
        </div>
      </div>
      <div className="relative aspect-video">
        {afterImage ? (
          <img src={afterImage} alt={afterLabelText} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {afterLabelText}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm mb-2 block">Before Image</Label>
          <div
            className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => beforeInputRef.current?.click()}
          >
            {beforeImage ? (
              <img src={beforeImage} alt="Before" className="max-h-20 mx-auto rounded" />
            ) : (
              <div className="text-muted-foreground">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs">Upload</p>
              </div>
            )}
          </div>
          <input
            ref={beforeInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, setBeforeImage)}
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">After Image</Label>
          <div
            className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => afterInputRef.current?.click()}
          >
            {afterImage ? (
              <img src={afterImage} alt="After" className="max-h-20 mx-auto rounded" />
            ) : (
              <div className="text-muted-foreground">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs">Upload</p>
              </div>
            )}
          </div>
          <input
            ref={afterInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e, setAfterImage)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm mb-2 block">Before Label</Label>
          <Input
            value={beforeLabelText}
            onChange={(e) => setBeforeLabelText(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-sm mb-2 block">After Label</Label>
          <Input
            value={afterLabelText}
            onChange={(e) => setAfterLabelText(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="text-sm mb-2 block">Layout</Label>
        <Select value={layout} onValueChange={setLayout}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LAYOUTS.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(beforeImage || afterImage) && (
        <Card>
          <CardContent className="p-4">
            {layout === "slider" ? renderSlider() : renderSideBySide()}

            {layout === "slider" && (
              <div className="mt-4">
                <Slider
                  value={sliderPosition}
                  onValueChange={setSliderPosition}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" disabled={!beforeImage || !afterImage}>
          <Download className="h-4 w-4 mr-1" />
          Export Image
        </Button>
        <Button variant="outline" className="flex-1" disabled={!beforeImage || !afterImage}>
          Copy Embed Code
        </Button>
      </div>
    </div>
  )
}
