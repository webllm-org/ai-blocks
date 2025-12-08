"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, FileText, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentBrief {
  title: string
  targetAudience: string
  keyPoints: string[]
  outline: { heading: string; points: string[] }[]
  tone: string
  keywords: string[]
  wordCount: string
  callToAction: string
}

const CONTENT_TYPES = [
  { id: "blog", label: "Blog Post" },
  { id: "article", label: "Article" },
  { id: "guide", label: "How-to Guide" },
  { id: "listicle", label: "Listicle" },
  { id: "case-study", label: "Case Study" },
  { id: "landing", label: "Landing Page" },
]

export interface ContentBriefDemoProps {
  /** Default topic */
  defaultTopic?: string
}

export function ContentBriefDemo({
  defaultTopic = "Best practices for remote team collaboration",
}: ContentBriefDemoProps = {}) {
  const [topic, setTopic] = useState(defaultTopic)
  const [contentType, setContentType] = useState("blog")
  const [audience, setAudience] = useState("")
  const [brief, setBrief] = useState<ContentBrief | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setIsLoading(true)
    setBrief(null)

    const typeInfo = CONTENT_TYPES.find(t => t.id === contentType)

    try {
      const response = await generateText({
        prompt: `Create a comprehensive content brief for this topic:

Topic: "${topic}"
Content type: ${typeInfo?.label}
Target audience: ${audience || "General business audience"}

Generate a detailed brief that a writer could use to create the content.

Return as JSON:
{
  "title": "Suggested title for the piece",
  "targetAudience": "Detailed audience description",
  "keyPoints": ["Main point 1", "Main point 2", "Main point 3"],
  "outline": [
    {
      "heading": "Section heading",
      "points": ["What to cover in this section"]
    }
  ],
  "tone": "Recommended tone and style",
  "keywords": ["SEO", "keywords", "to include"],
  "wordCount": "Recommended word count range",
  "callToAction": "Suggested CTA for the content"
}

Make the outline detailed enough to be actionable.`,
        maxTokens: 700,
      })

      const parsed = JSON.parse(response.text)
      setBrief(parsed)
      setExpandedSections(new Set([0]))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleCopy = async () => {
    if (!brief) return
    const text = `# ${brief.title}

## Target Audience
${brief.targetAudience}

## Key Points
${brief.keyPoints.map(p => `- ${p}`).join('\n')}

## Outline
${brief.outline.map(s => `### ${s.heading}\n${s.points.map(p => `- ${p}`).join('\n')}`).join('\n\n')}

## Tone
${brief.tone}

## Keywords
${brief.keywords.join(', ')}

## Word Count
${brief.wordCount}

## Call to Action
${brief.callToAction}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Topic</Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What should the content be about?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Content type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Audience (optional)</Label>
            <Input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Who is this for?"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !topic.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Brief...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Generate Content Brief
          </>
        )}
      </Button>

      {brief && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{brief.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{brief.wordCount}</Badge>
                  <Badge variant="secondary">{brief.tone}</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Target Audience</p>
              <p className="text-sm">{brief.targetAudience}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Key Points</p>
              <ul className="space-y-1">
                {brief.keyPoints.map((point, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Outline</p>
              {brief.outline.map((section, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(i)}
                    className="w-full flex items-center justify-between p-2 bg-muted hover:bg-muted/80 transition-colors text-left"
                  >
                    <span className="text-sm font-medium">{section.heading}</span>
                    {expandedSections.has(i) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections.has(i) && (
                    <div className="p-2 space-y-1">
                      {section.points.map((point, j) => (
                        <p key={j} className="text-xs text-muted-foreground">
                          • {point}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              {brief.keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground font-medium">Suggested CTA</p>
              <p className="text-sm">{brief.callToAction}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
