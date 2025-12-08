"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Tag, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface IntentResult {
  primary: string
  confidence: number
  secondary: Array<{ intent: string; confidence: number }>
  suggestedRoute: string
}

const INTENT_COLORS: Record<string, string> = {
  question: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  complaint: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  request: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  feedback: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  spam: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  greeting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  urgent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
}

export interface IntentClassifierDemoProps {
  /** Default message */
  defaultMessage?: string
}

export function IntentClassifierDemo({
  defaultMessage = "I've been trying to reset my password for the last hour and nothing is working! This is incredibly frustrating.",
}: IntentClassifierDemoProps = {}) {
  const [message, setMessage] = useState(defaultMessage)
  const [result, setResult] = useState<IntentResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!message.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      const response = await generateText({
        prompt: `Analyze the intent of this incoming message for a customer support system:

"${message.trim()}"

Classify into one of these intents: question, complaint, request, feedback, spam, greeting, urgent

Provide:
1. Primary intent with confidence (0-100)
2. Secondary possible intents
3. Suggested routing (e.g., "Support Team", "Sales", "Auto-response")

Format as JSON:
{
  "primary": "complaint",
  "confidence": 95,
  "secondary": [
    {"intent": "urgent", "confidence": 70},
    {"intent": "request", "confidence": 40}
  ],
  "suggestedRoute": "Priority Support Queue"
}`,
        maxTokens: 200,
      })

      const parsed = JSON.parse(response.text)
      setResult(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter an incoming message to classify..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={isLoading || !message.trim()}
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
            Classify Intent
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Primary Intent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-sm px-3 py-1", INTENT_COLORS[result.primary] || "bg-gray-100")}>
                  {result.primary}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {result.confidence}% confident
                </span>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            {/* Secondary intents */}
            {result.secondary && result.secondary.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Also detected:</p>
                <div className="flex flex-wrap gap-2">
                  {result.secondary.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {s.intent}
                      <span className="ml-1 text-muted-foreground">
                        {s.confidence}%
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Routing suggestion */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Route to:</span>
              <Badge variant="secondary">{result.suggestedRoute}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
