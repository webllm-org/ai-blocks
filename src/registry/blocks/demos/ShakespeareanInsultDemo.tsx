"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Feather, RefreshCw, Share2, Copy, Check } from "lucide-react"

interface ShakespeareanInsult {
  insult: string
  modernTranslation: string
  source: string
  severity: "mild" | "moderate" | "savage"
}

export interface ShakespeareanInsultDemoProps {
  /** Initial state */
  autoGenerate?: boolean
}

export function ShakespeareanInsultDemo({
  autoGenerate = false,
}: ShakespeareanInsultDemoProps = {}) {
  const [insult, setInsult] = useState<ShakespeareanInsult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setInsult(null)

    try {
      const response = await generateText({
        prompt: `Generate a creative Shakespearean-style insult.

Requirements:
- Use archaic English vocabulary (thou, thy, thee, hath, doth, etc.)
- Include creative compound insults (like "thou art a...")
- Make it sound authentically Elizabethan
- Be creative and entertaining, not actually offensive
- Include vocabulary Shakespeare might have used

Return as JSON:
{
  "insult": "The full Shakespearean insult",
  "modernTranslation": "What this means in modern English",
  "source": "A fictional Shakespeare play this could be from",
  "severity": "mild|moderate|savage"
}

Examples of style:
- "Thou art a boil, a plague sore!"
- "Thy tongue outvenoms all the worms of Nile"
- "Thou art like a toad; ugly and venomous"

Be creative and poetic!`,
        maxTokens: 250,
      })

      const parsed = JSON.parse(response.text)
      setInsult(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!insult) return
    await navigator.clipboard.writeText(insult.insult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!insult) return
    const text = `🎭 Shakespearean Insult:\n\n"${insult.insult}"\n\n(Translation: ${insult.modernTranslation})`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard!")
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "savage":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "moderate":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <span className="text-6xl">🎭</span>
        <h2 className="text-xl font-bold mt-2">Shakespearean Insult Generator</h2>
        <p className="text-sm text-muted-foreground">
          Hurl ye olde insults with poetic flair
        </p>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Composing insult...
          </>
        ) : (
          <>
            <Feather className="h-4 w-4 mr-2" />
            Generate Insult
          </>
        )}
      </Button>

      {insult && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-xl font-serif italic leading-relaxed">
                "{insult.insult}"
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge className={getSeverityColor(insult.severity)}>
                {insult.severity}
              </Badge>
              <Badge variant="outline" className="font-normal">
                📜 {insult.source}
              </Badge>
            </div>

            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Modern translation:</p>
              <p className="text-sm">{insult.modernTranslation}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerate}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Another!
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-center text-muted-foreground">
        For entertainment purposes only. Please insult responsibly.
      </p>
    </div>
  )
}
