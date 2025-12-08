"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertTriangle, Shield, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentWarning {
  text: string
  topics: string[]
  severity: "mild" | "moderate" | "strong"
  placement: string
}

export interface ContentWarningDemoProps {
  /** Default content to analyze */
  defaultContent?: string
}

export function ContentWarningDemo({
  defaultContent = "",
}: ContentWarningDemoProps = {}) {
  const [content, setContent] = useState(defaultContent)
  const [sensitivity, setSensitivity] = useState([50])
  const [warning, setWarning] = useState<ContentWarning | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = async () => {
    if (!content.trim()) return
    setIsLoading(true)
    setWarning(null)
    setSelectedTopics(new Set())

    const sensitivityLevel = sensitivity[0] < 33 ? "low" : sensitivity[0] < 66 ? "medium" : "high"

    try {
      const result = await generateText({
        prompt: `Analyze this content for potentially sensitive topics that might warrant a content warning:

"${content.trim().slice(0, 2000)}"

Sensitivity threshold: ${sensitivityLevel} (${sensitivityLevel === "low" ? "only flag severe content" : sensitivityLevel === "medium" ? "flag moderately sensitive content" : "flag any potentially sensitive content"})

Identify topics that might need warnings (e.g., violence, death, mental health, medical content, etc.).

Format as JSON:
{
  "text": "A suggested content warning text",
  "topics": ["topic1", "topic2"],
  "severity": "mild|moderate|strong",
  "placement": "before content|in metadata|both"
}

If no warning is needed, return: {"text": "", "topics": [], "severity": "mild", "placement": "none"}`,
        maxTokens: 250,
      })

      const parsed = JSON.parse(result.text)
      setWarning(parsed)
      if (parsed.topics) {
        setSelectedTopics(new Set(parsed.topics))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev)
      if (next.has(topic)) {
        next.delete(topic)
      } else {
        next.add(topic)
      }
      return next
    })
  }

  const getFinalWarningText = () => {
    if (!warning || selectedTopics.size === 0) return ""
    const topics = Array.from(selectedTopics).join(", ")
    return `Content Warning: ${topics}`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getFinalWarningText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "strong":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "moderate":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste content to analyze for potential content warnings..."
        className="min-h-[120px]"
      />

      <div className="space-y-2">
        <Label className="text-sm">Sensitivity Threshold</Label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Low</span>
          <Slider
            value={sensitivity}
            onValueChange={setSensitivity}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>

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
            <Shield className="h-4 w-4 mr-2" />
            Analyze Content
          </>
        )}
      </Button>

      {warning && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {warning.topics.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span>No content warnings needed at this sensitivity level</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-sm">Suggested Warning</span>
                  </div>
                  <Badge className={cn(getSeverityColor(warning.severity))}>
                    {warning.severity}
                  </Badge>
                </div>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  {warning.text}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Topics (click to include/exclude):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {warning.topics.map((topic, i) => (
                      <Badge
                        key={i}
                        variant={selectedTopics.has(topic) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTopic(topic)}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {selectedTopics.size > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Final warning text:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-muted rounded text-xs">
                        {getFinalWarningText()}
                      </code>
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Suggested placement: {warning.placement}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
