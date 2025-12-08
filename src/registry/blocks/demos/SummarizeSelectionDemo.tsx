"use client"

import { useState, useRef, useEffect } from "react"
import { generateText } from "@webllm/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, X, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PopupPosition {
  top: number
  left: number
}

export interface SummarizeSelectionDemoProps {
  /** Sample text to display */
  sampleText?: string
}

export function SummarizeSelectionDemo({
  sampleText = `Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.

The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". This definition has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.

AI applications include advanced web search engines (e.g., Google Search), recommendation systems (used by YouTube, Amazon, and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Waymo), generative or creative tools (ChatGPT and AI art), automated decision-making, and competing at the highest level in strategic game systems (such as chess and Go).`,
}: SummarizeSelectionDemoProps = {}) {
  const [selectedText, setSelectedText] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null)
  const [copied, setCopied] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (text && text.length > 20 && textRef.current?.contains(selection?.anchorNode || null)) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()

      if (rect) {
        setSelectedText(text)
        setPopupPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX + rect.width / 2,
        })
        setSummary("")
      }
    }
  }

  const handleSummarize = async () => {
    if (!selectedText) return
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Summarize this selected text in 1-2 concise sentences:

"${selectedText}"

Keep it brief and capture the key point.`,
        maxTokens: 100,
      })

      setSummary(result.text.trim())
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setPopupPosition(null)
    setSelectedText("")
    setSummary("")
    window.getSelection()?.removeAllRanges()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupPosition && !textRef.current?.contains(e.target as Node)) {
        // Don't close if clicking on the popup itself
        const popup = document.getElementById("summary-popup")
        if (!popup?.contains(e.target as Node)) {
          handleClose()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [popupPosition])

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="text-sm text-muted-foreground mb-2">
        Select any text below to see the summarize popup:
      </div>

      <Card>
        <CardContent className="p-4">
          <div
            ref={textRef}
            onMouseUp={handleMouseUp}
            className="prose prose-sm max-w-none select-text cursor-text leading-relaxed"
          >
            {sampleText.split("\n\n").map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {popupPosition && (
        <div
          id="summary-popup"
          className="fixed z-50 transform -translate-x-1/2"
          style={{
            top: popupPosition.top,
            left: popupPosition.left,
          }}
        >
          <Card className="w-80 shadow-lg border-2">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedText.length} characters selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleClose}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {!summary && !isLoading && (
                <Button
                  onClick={handleSummarize}
                  className="w-full"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Summarize Selection
                </Button>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {summary && (
                <div className="space-y-2">
                  <div className="p-2 bg-primary/10 rounded text-sm">
                    {summary}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex-1"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSummarize}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
