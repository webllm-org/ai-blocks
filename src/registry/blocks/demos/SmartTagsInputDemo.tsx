"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Tag, Check, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuggestedTag {
  name: string
  confidence: number
  accepted: boolean | null
}

export interface SmartTagsInputDemoProps {
  /** Placeholder for content input */
  placeholder?: string
}

export function SmartTagsInputDemo({
  placeholder = "Paste any content to auto-generate tags...",
}: SmartTagsInputDemoProps = {}) {
  const [content, setContent] = useState("")
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([])
  const [acceptedTags, setAcceptedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!content.trim()) return
    setIsLoading(true)
    setSuggestedTags([])

    try {
      const result = await generateText({
        prompt: `Analyze this content and suggest relevant tags:

"${content.trim().slice(0, 1000)}"

Suggest 5-8 relevant tags that would help categorize this content. For each tag, provide a confidence score.

Format as JSON array:
[
  {"name": "technology", "confidence": 95},
  {"name": "tutorial", "confidence": 80}
]

Tags should be lowercase, single words or short phrases (2-3 words max).`,
        maxTokens: 200,
      })

      const parsed = JSON.parse(result.text)
      if (Array.isArray(parsed)) {
        setSuggestedTags(parsed.map(t => ({ ...t, accepted: null })))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = (index: number) => {
    const tag = suggestedTags[index]
    if (!acceptedTags.includes(tag.name)) {
      setAcceptedTags(prev => [...prev, tag.name])
    }
    setSuggestedTags(prev =>
      prev.map((t, i) => i === index ? { ...t, accepted: true } : t)
    )
  }

  const handleReject = (index: number) => {
    setSuggestedTags(prev =>
      prev.map((t, i) => i === index ? { ...t, accepted: false } : t)
    )
  }

  const handleRemoveAccepted = (tag: string) => {
    setAcceptedTags(prev => prev.filter(t => t !== tag))
    setSuggestedTags(prev =>
      prev.map(t => t.name === tag ? { ...t, accepted: null } : t)
    )
  }

  const handleAddCustom = () => {
    if (customTag.trim() && !acceptedTags.includes(customTag.trim().toLowerCase())) {
      setAcceptedTags(prev => [...prev, customTag.trim().toLowerCase()])
      setCustomTag("")
    }
  }

  const exportTags = () => {
    const output = JSON.stringify(acceptedTags, null, 2)
    console.log("Exported tags:", output)
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[120px]"
      />

      <Button
        onClick={handleAnalyze}
        disabled={isLoading || !content.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Tag className="h-4 w-4 mr-2" />
            Generate Tags
          </>
        )}
      </Button>

      {suggestedTags.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">Suggested Tags:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full border text-sm transition-all",
                    tag.accepted === true && "bg-green-50 border-green-300 dark:bg-green-950",
                    tag.accepted === false && "opacity-50 line-through",
                    tag.accepted === null && "bg-muted"
                  )}
                >
                  <span>{tag.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tag.confidence}%
                  </span>
                  {tag.accepted === null && (
                    <>
                      <button
                        onClick={() => handleAccept(i)}
                        className="ml-1 p-0.5 hover:bg-green-100 rounded-full"
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleReject(i)}
                        className="p-0.5 hover:bg-red-100 rounded-full"
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {acceptedTags.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Final Tags ({acceptedTags.length}):</p>
              <Button size="sm" variant="outline" onClick={exportTags}>
                Copy as Array
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {acceptedTags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveAccepted(tag)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Input
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          placeholder="Add custom tag..."
          onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
        />
        <Button variant="outline" onClick={handleAddCustom} disabled={!customTag.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
