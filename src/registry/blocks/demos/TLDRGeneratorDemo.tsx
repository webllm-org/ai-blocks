"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, FileText, Sparkles } from "lucide-react"

const SAMPLE_ARTICLE = `Artificial intelligence has transformed how we interact with technology in ways that seemed impossible just a decade ago. From virtual assistants that understand natural language to recommendation systems that predict our preferences, AI has become an invisible force shaping our daily digital experiences.

The recent advances in large language models have particularly accelerated this transformation. These models, trained on vast amounts of text data, can now generate human-like responses, translate languages, summarize documents, and even write code. Companies across industries are racing to integrate these capabilities into their products and services.

However, this rapid advancement also raises important questions about privacy, bias, and the future of work. As AI systems become more capable, society must grapple with how to harness their benefits while mitigating potential risks. The conversation about AI ethics and governance has never been more critical.`

export function TLDRGeneratorDemo() {
  const [article, setArticle] = useState(SAMPLE_ARTICLE)
  const [summary, setSummary] = useState("")
  const [bulletPoints, setBulletPoints] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleSummarize = async () => {
    if (!article.trim() || !clientRef.current) return
    setIsLoading(true)
    setSummary("")
    setBulletPoints([])

    try {
      const result = await clientRef.current.generateText({
        prompt: `Summarize this article in exactly 3 bullet points. Be concise but capture the key ideas.

Article:
${article}

Respond with JSON: {"summary": "one sentence TLDR", "bullets": ["point 1", "point 2", "point 3"]}`,
        temperature: 0.5,
        maxTokens: 300,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setSummary(parsed.summary || "")
        setBulletPoints(parsed.bullets || [])
      }
    } catch (error) {
      setSummary(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const wordCount = article.trim().split(/\s+/).length

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="relative">
        <Textarea
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          placeholder="Paste an article or long text to summarize..."
          rows={6}
          className="pr-16"
        />
        <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {wordCount} words
        </span>
      </div>

      <Button onClick={handleSummarize} disabled={isLoading || !article.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Summarizing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate TLDR
          </>
        )}
      </Button>

      {(summary || bulletPoints.length > 0) && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {summary && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-sm font-medium">{summary}</p>
              </div>
            )}
            {bulletPoints.length > 0 && (
              <ul className="space-y-2 ml-6">
                {bulletPoints.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground list-disc">
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
