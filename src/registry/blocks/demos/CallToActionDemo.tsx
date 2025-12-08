"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MousePointer, Copy, Check, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface CTAOption {
  text: string
  style: string
  psychological: string
}

const CTA_TYPES = [
  { id: "signup", label: "Sign Up" },
  { id: "buy", label: "Purchase" },
  { id: "download", label: "Download" },
  { id: "learn", label: "Learn More" },
  { id: "contact", label: "Contact" },
  { id: "subscribe", label: "Subscribe" },
  { id: "start", label: "Get Started" },
]

const TONES = [
  { id: "urgent", label: "Urgent" },
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
  { id: "exclusive", label: "Exclusive" },
]

export interface CallToActionDemoProps {
  /** Default product/offer description */
  defaultOffer?: string
}

export function CallToActionDemo({
  defaultOffer = "A productivity app that helps teams collaborate better",
}: CallToActionDemoProps = {}) {
  const [offer, setOffer] = useState(defaultOffer)
  const [ctaType, setCtaType] = useState("signup")
  const [tone, setTone] = useState("friendly")
  const [options, setOptions] = useState<CTAOption[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!offer.trim()) return
    setIsLoading(true)
    setOptions([])
    setSelectedIndex(null)

    const typeInfo = CTA_TYPES.find(t => t.id === ctaType)
    const toneInfo = TONES.find(t => t.id === tone)

    try {
      const response = await generateText({
        prompt: `Generate 5 compelling call-to-action button texts for:

Product/Offer: "${offer}"
Action type: ${typeInfo?.label}
Tone: ${toneInfo?.label}

Create CTAs that:
- Are action-oriented
- Create urgency or curiosity
- Match the ${toneInfo?.label.toLowerCase()} tone
- Are 2-5 words

Return as JSON array:
[
  {
    "text": "Start Free Trial",
    "style": "urgency/benefit/curiosity/social-proof/exclusivity",
    "psychological": "What makes this effective"
  }
]

Vary the psychological approaches.`,
        maxTokens: 400,
      })

      const parsed = JSON.parse(response.text)
      if (Array.isArray(parsed)) {
        setOptions(parsed)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setSelectedIndex(index)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStyleColor = (style: string) => {
    const colors: Record<string, string> = {
      urgency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      benefit: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      curiosity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "social-proof": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      exclusivity: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    }
    return colors[style] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">What are you promoting?</Label>
        <Input
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="Describe your product, service, or offer..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm">Action type</Label>
          <Select value={ctaType} onValueChange={setCtaType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CTA_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !offer.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <MousePointer className="h-4 w-4 mr-2" />
            Generate CTAs
          </>
        )}
      </Button>

      {options.length > 0 && (
        <div className="space-y-3">
          {options.map((option, i) => (
            <Card
              key={i}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                selectedIndex === i && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedIndex(i)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Button size="sm" className="font-medium">
                    {option.text}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopy(option.text, i)
                    }}
                  >
                    {copied && selectedIndex === i ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStyleColor(option.style)}>
                    {option.style}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {option.psychological}
                </p>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={handleGenerate}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate More
          </Button>
        </div>
      )}
    </div>
  )
}
