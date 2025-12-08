"use client"

import { useState, useRef } from "react"
import { generateImage } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Download, Upload, Package } from "lucide-react"

const MOCKUP_TYPES = [
  { id: "tshirt", label: "T-shirt", prompt: "white t-shirt product mockup on hanger, clean background" },
  { id: "mug", label: "Mug", prompt: "white ceramic coffee mug product photo, studio lighting" },
  { id: "phone-case", label: "Phone Case", prompt: "smartphone case product mockup, modern phone" },
  { id: "laptop", label: "Laptop Screen", prompt: "laptop screen mockup, macbook style, desk setup" },
  { id: "business-card", label: "Business Card", prompt: "business card mockup, minimal desk, professional" },
  { id: "box", label: "Box/Package", prompt: "product packaging box mockup, 3D render, clean" },
]

export interface ProductMockupDemoProps {
  /** Default mockup type */
  defaultType?: string
  /** Default background color */
  defaultBgColor?: string
}

export function ProductMockupDemo({
  defaultType = "tshirt",
  defaultBgColor = "#ffffff",
}: ProductMockupDemoProps = {}) {
  const [selectedType, setSelectedType] = useState(defaultType)
  const [bgColor, setBgColor] = useState(defaultBgColor)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setResults([])

    const mockup = MOCKUP_TYPES.find(m => m.id === selectedType)
    const prompt = `${mockup?.prompt}, with logo/design visible, ${bgColor === "#ffffff" ? "white" : "colored"} background, professional product photography`

    try {
      const result = await generateImage({
        prompt,
        size: "1024x1024",
        n: 1,
      })

      if (result.images && result.images.length > 0) {
        setResults([`data:${result.images[0].mimeType};base64,${result.images[0].base64}`])
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
          <Label className="text-sm mb-2 block">Upload Logo/Design</Label>
          <div
            className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadedImage ? (
              <img src={uploadedImage} alt="Uploaded" className="max-h-24 mx-auto" />
            ) : (
              <div className="text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Click to upload logo or design</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Mockup Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {MOCKUP_TYPES.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedType(type.id)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Background Color</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Mockup...
          </>
        ) : (
          <>
            <Package className="h-4 w-4 mr-2" />
            Generate Mockup
          </>
        )}
      </Button>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((url, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0 relative group">
                <img src={url} alt={`Mockup ${i + 1}`} className="w-full h-auto" />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary">
                    <Download className="h-4 w-4 mr-1" />
                    Download
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
