"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Tags, AlertTriangle, CheckCircle } from "lucide-react"

interface Classification {
  primaryCategory: string
  secondaryCategories: string[]
  confidence: number
  contentType: string
  tone: string
  flags: string[]
}

const DEFAULT_SAMPLE_TEXT = `Just bought the new iPhone 15 Pro and I'm blown away! The camera quality is insane - took some amazing shots at sunset yesterday. Battery life is decent, though not as good as my old Android. The titanium frame feels premium but it's definitely pricey. Would recommend if you're already in the Apple ecosystem, otherwise maybe wait for a sale.`

const DEFAULT_TONE_COLORS: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  negative: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-800",
  mixed: "bg-yellow-100 text-yellow-800",
}

const DEFAULT_TYPE_ICONS: Record<string, string> = {
  review: "📝",
  news: "📰",
  opinion: "💭",
  tutorial: "📚",
  question: "❓",
  promotion: "📢",
  other: "📄",
}

export interface ContentClassifierDemoProps {
  /** Initial text to classify */
  defaultText?: string
  /** Placeholder for textarea */
  placeholder?: string
  /** Tone color mappings */
  toneColors?: Record<string, string>
  /** Content type icon mappings */
  typeIcons?: Record<string, string>
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function ContentClassifierDemo({
  defaultText = DEFAULT_SAMPLE_TEXT,
  placeholder = "Enter content to classify...",
  toneColors = DEFAULT_TONE_COLORS,
  typeIcons = DEFAULT_TYPE_ICONS,
  temperature = 0.3,
  maxTokens = 300,
}: ContentClassifierDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [result, setResult] = useState<Classification | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleClassify = async () => {
    if (!text.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      const response = await generateText({
        prompt: `Classify this content and extract metadata:

"${text}"

Respond with JSON:
{
  "primaryCategory": "category name",
  "secondaryCategories": ["cat1", "cat2"],
  "confidence": 0.0-1.0,
  "contentType": "review|news|opinion|tutorial|question|promotion|other",
  "tone": "positive|negative|neutral|mixed",
  "flags": ["contains_opinion", "product_mention", etc]
}`,
        temperature,
        maxTokens,
      })

      const jsonMatch = response.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]) as Classification)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={4}
      />

      <Button onClick={handleClassify} disabled={isLoading || !text.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Classifying...
          </>
        ) : (
          <>
            <Tags className="h-4 w-4 mr-2" />
            Classify Content
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeIcons[result.contentType] || "📄"}</span>
                <div>
                  <p className="font-medium">{result.primaryCategory}</p>
                  <p className="text-xs text-muted-foreground capitalize">{result.contentType}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {result.confidence > 0.8 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              <Badge className={toneColors[result.tone] || "bg-gray-100"}>
                {result.tone} tone
              </Badge>
              {result.secondaryCategories.map((cat, i) => (
                <Badge key={i} variant="outline">
                  {cat}
                </Badge>
              ))}
            </div>

            {result.flags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Flags:</p>
                <div className="flex flex-wrap gap-1">
                  {result.flags.map((flag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {flag.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
