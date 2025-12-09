"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertTriangle, Lightbulb, Code, Copy, Check } from "lucide-react"

interface ErrorExplanation {
  summary: string
  cause: string
  solution: string
  codeExample?: string
  relatedErrors?: string[]
}

const LANGUAGES = [
  { id: "javascript", label: "JavaScript/TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "rust", label: "Rust" },
  { id: "go", label: "Go" },
  { id: "csharp", label: "C#" },
]

export interface ErrorExplainerDemoProps {
  /** Default error message */
  defaultError?: string
}

export function ErrorExplainerDemo({
  defaultError = "TypeError: Cannot read properties of undefined (reading 'map')",
}: ErrorExplainerDemoProps = {}) {
  const [errorMessage, setErrorMessage] = useState(defaultError)
  const [language, setLanguage] = useState("javascript")
  const [explanation, setExplanation] = useState<ErrorExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleExplain = async () => {
    if (!errorMessage.trim()) return
    setIsLoading(true)
    setExplanation(null)

    try {
      const response = await generateText({
        prompt: `Explain this ${LANGUAGES.find(l => l.id === language)?.label} error to a developer:

Error: "${errorMessage}"

Provide a helpful explanation as JSON:
{
  "summary": "One-sentence explanation of what went wrong",
  "cause": "Why this error typically occurs (2-3 sentences)",
  "solution": "How to fix it with specific steps",
  "codeExample": "A brief code snippet showing the fix (optional)",
  "relatedErrors": ["similar error 1", "similar error 2"]
}

Be practical and developer-friendly.`,
        maxTokens: 400,
      })

      const parsed = JSON.parse(response.text)
      setExplanation(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!explanation?.codeExample) return
    await navigator.clipboard.writeText(explanation.codeExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Error Message</Label>
          <Textarea
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            placeholder="Paste your error message here..."
            className="font-mono text-sm"
            rows={3}
          />
        </div>
      </div>

      <Button
        onClick={handleExplain}
        disabled={isLoading || !errorMessage.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Explain Error
          </>
        )}
      </Button>

      {explanation && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{explanation.summary}</p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm flex items-center gap-1">
                <Lightbulb className="h-4 w-4" />
                Why this happens
              </Label>
              <p className="text-sm text-muted-foreground">{explanation.cause}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">How to fix it</Label>
              <p className="text-sm">{explanation.solution}</p>
            </div>

            {explanation.codeExample && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center gap-1">
                    <Code className="h-4 w-4" />
                    Example fix
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <pre className="p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto">
                  {explanation.codeExample}
                </pre>
              </div>
            )}

            {explanation.relatedErrors && explanation.relatedErrors.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Related errors:</p>
                <div className="flex flex-wrap gap-1">
                  {explanation.relatedErrors.map((err, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {err}
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
