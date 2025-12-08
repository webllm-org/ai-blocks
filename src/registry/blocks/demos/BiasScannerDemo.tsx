"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Scale, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface BiasResult {
  overallScore: number
  issues: {
    type: string
    severity: "low" | "medium" | "high"
    text: string
    suggestion: string
  }[]
  positives: string[]
  summary: string
}

export interface BiasScannerDemoProps {
  /** Default text to analyze */
  defaultText?: string
}

export function BiasScannerDemo({
  defaultText = "The company is looking for a young, energetic salesman to join our dynamic team. He should be a go-getter with a strong work ethic. We offer competitive salary for the right guy.",
}: BiasScannerDemoProps = {}) {
  const [inputText, setInputText] = useState(defaultText)
  const [result, setResult] = useState<BiasResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleScan = async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      const response = await generateText({
        prompt: `Analyze this text for potential bias (gender, age, racial, ability, socioeconomic, etc.):

"${inputText}"

Check for:
- Gendered language
- Age-related assumptions
- Racial/ethnic bias
- Ability assumptions
- Socioeconomic bias
- Cultural stereotypes
- Exclusive language

Return as JSON:
{
  "overallScore": 75,
  "issues": [
    {
      "type": "gender bias",
      "severity": "high",
      "text": "the problematic phrase",
      "suggestion": "suggested alternative"
    }
  ],
  "positives": ["What the text does well"],
  "summary": "Brief overall assessment"
}

Score 0-100 (100 = no bias detected). Be constructive, not accusatory.`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(response.text)
      setResult(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Text to analyze</Label>
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste text to check for potential bias..."
          rows={4}
        />
      </div>

      <Button
        onClick={handleScan}
        disabled={isLoading || !inputText.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Scale className="h-4 w-4 mr-2" />
            Scan for Bias
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Inclusivity Score</span>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className={cn("text-2xl font-bold", getScoreColor(result.overallScore))}>
                {result.overallScore}/100
              </span>
            </div>

            <Progress
              value={result.overallScore}
              className={cn(
                "h-2",
                result.overallScore >= 80 && "[&>div]:bg-green-500",
                result.overallScore >= 60 && result.overallScore < 80 && "[&>div]:bg-yellow-500",
                result.overallScore < 60 && "[&>div]:bg-red-500"
              )}
            />

            <p className="text-sm text-muted-foreground">{result.summary}</p>

            {result.issues.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Issues Found ({result.issues.length})
                </div>
                {result.issues.map((issue, i) => (
                  <div key={i} className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline">{issue.type}</Badge>
                    </div>
                    <p className="text-sm">
                      <span className="line-through text-muted-foreground">{issue.text}</span>
                    </p>
                    <p className="text-sm text-green-600">
                      → {issue.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {result.positives.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  What's Working Well
                </div>
                <ul className="space-y-1">
                  {result.positives.map((positive, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {positive}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
