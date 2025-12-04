"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Newspaper, Copy, Check, RefreshCw } from "lucide-react"

interface Headline {
  text: string
  style: string
}

const DEFAULT_SAMPLE_CONTENT = `A new study from Stanford University reveals that taking short walks after meals can significantly reduce blood sugar spikes. Researchers found that just 10 minutes of light walking after eating reduced post-meal glucose levels by up to 22%. The study, which followed 500 participants over 6 months, suggests this simple habit could help prevent type 2 diabetes.`

const DEFAULT_STYLE_COLORS: Record<string, string> = {
  Informative: "bg-blue-100 text-blue-800",
  Clickbait: "bg-orange-100 text-orange-800",
  Question: "bg-purple-100 text-purple-800",
  "How-to": "bg-green-100 text-green-800",
  Listicle: "bg-pink-100 text-pink-800",
}

export interface HeadlineGeneratorDemoProps {
  /** Initial content to generate headlines from */
  defaultContent?: string
  /** Placeholder text for the textarea */
  placeholder?: string
  /** Custom style colors for headline badges */
  styleColors?: Record<string, string>
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function HeadlineGeneratorDemo({
  defaultContent = DEFAULT_SAMPLE_CONTENT,
  placeholder = "Paste your article or blog post content...",
  styleColors = DEFAULT_STYLE_COLORS,
  temperature = 0.8,
  maxTokens = 400,
}: HeadlineGeneratorDemoProps = {}) {
  const [content, setContent] = useState(defaultContent)
  const [headlines, setHeadlines] = useState<Headline[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!content.trim()) return
    setIsLoading(true)
    setHeadlines([])

    try {
      const result = await generateText({
        prompt: `Generate 5 different headline options for this article. Each should have a different style.

Article:
${content}

Respond with JSON array:
[
  {"text": "headline 1", "style": "Informative"},
  {"text": "headline 2", "style": "Clickbait"},
  {"text": "headline 3", "style": "Question"},
  {"text": "headline 4", "style": "How-to"},
  {"text": "headline 5", "style": "Listicle"}
]`,
        temperature,
        maxTokens,
      })

      const jsonMatch = result.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        setHeadlines(JSON.parse(jsonMatch[0]) as Headline[])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (index: number) => {
    navigator.clipboard.writeText(headlines[index].text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
      />

      <Button onClick={handleGenerate} disabled={isLoading || !content.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating Headlines...
          </>
        ) : headlines.length > 0 ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Headlines
          </>
        ) : (
          <>
            <Newspaper className="h-4 w-4 mr-2" />
            Generate Headlines
          </>
        )}
      </Button>

      {headlines.length > 0 && (
        <div className="space-y-2">
          {headlines.map((headline, i) => (
            <Card key={i} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{headline.text}</p>
                  <Badge className={`mt-1 text-xs ${styleColors[headline.style] || "bg-gray-100 text-gray-800"}`}>
                    {headline.style}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(i)}
                >
                  {copiedIndex === i ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
