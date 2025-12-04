"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Sparkles, Tag, AlertCircle, CheckCircle } from "lucide-react"

type StructuredInquiry = {
  category: string
  urgency: "low" | "medium" | "high"
  summary: string
  suggestedAction: string
}

const DEFAULT_SUGGESTED_MESSAGES = [
  "I can't login to my account since yesterday",
  "I'd like to upgrade to the pro plan",
  "Your app is great but needs dark mode"
]

export interface ContactFormDemoProps {
  /** Suggested messages to display */
  suggestedMessages?: string[]
  /** Placeholder for textarea */
  placeholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function ContactFormDemo({
  suggestedMessages = DEFAULT_SUGGESTED_MESSAGES,
  placeholder = "Tell us about your inquiry, question, or feedback...",
  temperature = 0.3,
  maxTokens = 150,
}: ContactFormDemoProps = {}) {
  const [message, setMessage] = useState("")
  const [structured, setStructured] = useState<StructuredInquiry | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const processMessage = async () => {
    if (!message.trim()) return

    setIsProcessing(true)
    setStructured(null)

    try {
      const result = await generateText({
        prompt: `Analyze this customer inquiry and return JSON:

"${message}"

Return JSON with:
- category: "billing" | "technical" | "sales" | "feedback" | "other"
- urgency: "low" | "medium" | "high"
- summary: one sentence summary (max 15 words)
- suggestedAction: recommended next step (max 10 words)

JSON:`,
        temperature,
        maxTokens,
      })

      try {
        const jsonMatch = result.text.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setStructured(parsed)
        }
      } catch {
        setStructured({
          category: "other",
          urgency: "medium",
          summary: "Unable to categorize",
          suggestedAction: "Manual review needed"
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    // In real app, this would send to backend
  }

  const reset = () => {
    setMessage("")
    setStructured(null)
    setIsSubmitted(false)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
      default: return "outline"
    }
  }

  const getCategoryIcon = (category: string) => {
    return <Tag className="h-3 w-3" />
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      {!isSubmitted ? (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                rows={5}
                disabled={isProcessing}
              />

              <div className="flex gap-2">
                <Button
                  onClick={processMessage}
                  disabled={isProcessing || !message.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Analyze
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!structured}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Preview */}
          {structured && (
            <Card className="border-primary/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Analysis
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    {getCategoryIcon(structured.category)}
                    {structured.category}
                  </Badge>
                  <Badge variant={getUrgencyColor(structured.urgency) as "destructive" | "default" | "secondary" | "outline"}>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {structured.urgency} priority
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Summary: </span>
                    {structured.summary}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Suggested action: </span>
                    {structured.suggestedAction}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-muted-foreground">Try:</span>
            {suggestedMessages.map(q => (
              <Badge
                key={q}
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => setMessage(q)}
              >
                {q.slice(0, 25)}...
              </Badge>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-semibold">Message Sent!</h3>
              <p className="text-sm text-muted-foreground">
                Your inquiry has been categorized as <Badge variant="outline">{structured?.category}</Badge>
                {" "}with <Badge variant={getUrgencyColor(structured?.urgency || "medium") as "destructive" | "default" | "secondary" | "outline"}>{structured?.urgency}</Badge> priority.
              </p>
              <p className="text-sm text-muted-foreground">
                We'll get back to you soon.
              </p>
            </div>
            <Button onClick={reset} variant="outline">
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
