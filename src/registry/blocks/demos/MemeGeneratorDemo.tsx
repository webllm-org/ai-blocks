"use client"

import { useState } from "react"
import { generateImage, generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Download, Share2, RefreshCw, Laugh } from "lucide-react"

export interface MemeGeneratorDemoProps {
  /** Default situation description */
  defaultSituation?: string
}

export function MemeGeneratorDemo({
  defaultSituation = "when the deploy breaks on Friday at 5pm",
}: MemeGeneratorDemoProps = {}) {
  const [situation, setSituation] = useState(defaultSituation)
  const [suggestedFormat, setSuggestedFormat] = useState("")
  const [topText, setTopText] = useState("")
  const [bottomText, setBottomText] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"input" | "edit">("input")

  const handleSuggestMeme = async () => {
    if (!situation.trim()) return
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Suggest a perfect meme format for this situation: "${situation}"

Respond with JSON:
{
  "format": "the meme format name (e.g., 'Distracted Boyfriend', 'Drake Hotline')",
  "topText": "suggested top text for the meme",
  "bottomText": "suggested bottom text for the meme",
  "imagePrompt": "description for generating the meme background image"
}`,
        maxTokens: 300,
      })

      const parsed = JSON.parse(result.text)
      setSuggestedFormat(parsed.format)
      setTopText(parsed.topText)
      setBottomText(parsed.bottomText)

      // Generate the meme image
      const imageResult = await generateImage({
        prompt: parsed.imagePrompt + ", meme format, funny image",
        size: "512x512",
        n: 1,
      })

      if (imageResult.images && imageResult.images.length > 0) {
        setImageUrl(`data:${imageResult.images[0].mimeType};base64,${imageResult.images[0].base64}`)
      }

      setStep("edit")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = () => {
    setStep("input")
    setImageUrl(null)
    setSuggestedFormat("")
    setTopText("")
    setBottomText("")
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {step === "input" ? (
        <>
          <div>
            <Label className="text-sm mb-2 block">Describe a situation or joke</Label>
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g., when you fix one bug and create three more"
              className="min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleSuggestMeme}
            disabled={isLoading || !situation.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Meme...
              </>
            ) : (
              <>
                <Laugh className="h-4 w-4 mr-2" />
                Generate Meme
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          {suggestedFormat && (
            <div className="text-sm text-muted-foreground text-center">
              Suggested format: <span className="font-medium">{suggestedFormat}</span>
            </div>
          )}

          {imageUrl && (
            <Card className="overflow-hidden">
              <CardContent className="p-0 relative">
                <img src={imageUrl} alt="Meme" className="w-full h-auto" />
                {/* Meme text overlays */}
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <p className="text-white text-xl font-bold text-center uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {topText}
                  </p>
                  <p className="text-white text-xl font-bold text-center uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {bottomText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Input
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Top text"
            />
            <Input
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Bottom text"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
