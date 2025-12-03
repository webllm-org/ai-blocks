"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ImageIcon, Copy, Check } from "lucide-react"

export function AltTextGeneratorDemo() {
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400")
  const [context, setContext] = useState("travel blog about mountain hiking")
  const [altText, setAltText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setAltText("")

    try {
      // In a real implementation, you'd use vision capabilities
      // For this demo, we generate based on context
      const result = await generateText({
        prompt: `Generate a concise, descriptive alt text for an image on a website about: "${context}"

The alt text should:
- Be 1-2 sentences, under 125 characters
- Describe the image content objectively
- Be useful for screen reader users
- Not start with "Image of" or "Picture of"

Generate a realistic alt text:`,
        temperature: 0.7,
        maxTokens: 100,
      })
      setAltText(result.text.trim().replace(/^["']|["']$/g, ''))
    } catch (error) {
      setAltText(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(altText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-2">
        <Input
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value)
            setImageError(false)
          }}
          placeholder="Image URL (optional preview)"
        />
        <Input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe the image or page context..."
        />
      </div>

      {imageUrl && !imageError && (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {imageError && (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Could not load image</p>
          </div>
        </div>
      )}

      <Button onClick={handleGenerate} disabled={isLoading || !context.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating...
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4 mr-2" />
            Generate Alt Text
          </>
        )}
      </Button>

      {altText && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Generated alt text:</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">{altText}</p>
                <p className="text-xs text-muted-foreground mt-1">{altText.length} characters</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
