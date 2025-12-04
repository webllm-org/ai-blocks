"use client"

import { useState, useRef, useCallback } from "react"
import { generateText } from "@webllm/client"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"

export function SmartTextareaDemo() {
  const [text, setText] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const getSuggestion = useCallback(async (currentText: string) => {
    if (currentText.length < 20) {
      setSuggestion("")
      return
    }

    setIsLoading(true)
    try {
      const result = await generateText({
        prompt: `Continue this text naturally with 1 short sentence (10-20 words max):

"${currentText}"

Continuation:`,
        temperature: 0.7,
        maxTokens: 40,
      })

      const continuation = result.text.trim().replace(/^["']|["']$/g, '')
      setSuggestion(continuation)
    } catch (error) {
      console.error("Error:", error)
      setSuggestion("")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleChange = (value: string) => {
    setText(value)
    setSuggestion("")

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      getSuggestion(value)
    }, 1000)
  }

  const acceptSuggestion = () => {
    if (suggestion) {
      setText(prev => prev + " " + suggestion)
      setSuggestion("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault()
      acceptSuggestion()
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start typing... AI will suggest completions after you pause."
          rows={6}
          className="pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute top-3 right-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {suggestion && (
        <Card className="border-dashed border-primary/50">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground italic">"{suggestion}"</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={acceptSuggestion}
                  >
                    Tab to accept
                  </Badge>
                  <span className="text-xs text-muted-foreground">or keep typing to dismiss</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{text.length} characters</span>
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI suggestions enabled
        </span>
      </div>
    </div>
  )
}
