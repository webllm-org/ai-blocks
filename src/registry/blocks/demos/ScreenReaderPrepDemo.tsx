"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, Headphones, ArrowRight, Copy, Check } from "lucide-react"

const sampleContent = `🚀 Check out our NEW product launch!!!

Click HERE ➡️ to learn more about our amazing features:
• Fast ⚡
• Secure 🔒
• Easy to use 👍

Don't miss out!!! Limited time offer - 50% OFF!!!

img_2847.jpg
btn_submit`

export function ScreenReaderPrepDemo() {
  const [input, setInput] = useState(sampleContent)
  const [output, setOutput] = useState("")
  const [improvements, setImprovements] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  const optimizeContent = async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    setOutput("")
    setImprovements([])

    try {
      const result = await generateText({
        prompt: `Optimize this content for screen readers. Return JSON:

Original content:
"${input}"

Make these improvements:
1. Replace emojis with text descriptions where meaningful
2. Make "Click HERE" links descriptive
3. Add alt text descriptions for images (img_*.jpg → describe purpose)
4. Make button text descriptive (btn_submit → describe action)
5. Remove excessive punctuation (!!!)
6. Keep the same structure but make it accessible

Return:
{
  "optimized": "the screen-reader-friendly version",
  "improvements": ["list of specific changes made"]
}

JSON:`,
        temperature: 0.5,
        maxTokens: 400,
      })

      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setOutput(parsed.optimized || "")
          setImprovements(parsed.improvements || [])
        }
      } catch {
        setOutput("Unable to process content")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Input */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Original Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={10}
              className="text-sm font-mono"
              placeholder="Paste content with emojis, vague links, etc."
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Screen Reader Optimized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                value={output}
                readOnly
                rows={10}
                className="text-sm font-mono bg-muted"
                placeholder="Optimized content will appear here..."
              />
              {output && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={copyOutput}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={optimizeContent} disabled={isProcessing || !input.trim()}>
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Optimizing...
            </>
          ) : (
            <>
              Optimize for Screen Readers
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Improvements Made */}
      {improvements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Improvements Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {improvements.map((improvement, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {improvement}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Makes content more accessible for screen reader users by improving descriptive text
      </p>
    </div>
  )
}
