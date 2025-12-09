"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, Check, Play, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RegexResult {
  pattern: string
  flags: string
  explanation: string
  examples: { input: string; matches: boolean; match?: string }[]
}

export interface RegexGeneratorDemoProps {
  /** Default description */
  defaultDescription?: string
}

export function RegexGeneratorDemo({
  defaultDescription = "Match email addresses",
}: RegexGeneratorDemoProps = {}) {
  const [description, setDescription] = useState(defaultDescription)
  const [result, setResult] = useState<RegexResult | null>(null)
  const [testInput, setTestInput] = useState("")
  const [testResult, setTestResult] = useState<{ matches: boolean; match?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setIsLoading(true)
    setResult(null)
    setTestResult(null)

    try {
      const response = await generateText({
        prompt: `Generate a JavaScript regex pattern for: "${description}"

Return as JSON:
{
  "pattern": "the regex pattern without delimiters",
  "flags": "flags like g, i, m (or empty string)",
  "explanation": "Brief explanation of how the pattern works",
  "examples": [
    {"input": "test@example.com", "matches": true, "match": "test@example.com"},
    {"input": "not-an-email", "matches": false}
  ]
}

Provide 3-4 example inputs showing matches and non-matches.`,
        maxTokens: 300,
      })

      const parsed = JSON.parse(response.text)
      setResult(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = () => {
    if (!result || !testInput) return

    try {
      const regex = new RegExp(result.pattern, result.flags)
      const match = testInput.match(regex)
      setTestResult({
        matches: !!match,
        match: match?.[0],
      })
    } catch (error) {
      setTestResult({ matches: false })
    }
  }

  const handleCopy = async () => {
    if (!result) return
    const fullPattern = `/${result.pattern}/${result.flags}`
    await navigator.clipboard.writeText(fullPattern)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Describe what you want to match</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Match phone numbers in format (XXX) XXX-XXXX"
          rows={2}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !description.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Regex"
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Pattern</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <code className="block p-3 bg-muted rounded-lg text-sm font-mono break-all">
                /{result.pattern}/{result.flags}
              </code>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Explanation</Label>
              <p className="text-sm text-muted-foreground">{result.explanation}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Examples</Label>
              <div className="space-y-1">
                {result.examples.map((ex, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between p-2 rounded text-sm",
                      ex.matches ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                    )}
                  >
                    <code className="font-mono text-xs">{ex.input}</code>
                    <div className="flex items-center gap-2">
                      {ex.match && (
                        <Badge variant="outline" className="text-xs">
                          {ex.match}
                        </Badge>
                      )}
                      {ex.matches ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t space-y-2">
              <Label className="text-sm">Test your own input</Label>
              <div className="flex gap-2">
                <Input
                  value={testInput}
                  onChange={(e) => {
                    setTestInput(e.target.value)
                    setTestResult(null)
                  }}
                  placeholder="Enter text to test..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={!testInput}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              {testResult && (
                <div
                  className={cn(
                    "p-2 rounded text-sm flex items-center gap-2",
                    testResult.matches
                      ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                  )}
                >
                  {testResult.matches ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Match: <code className="font-mono">{testResult.match}</code>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      No match
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
