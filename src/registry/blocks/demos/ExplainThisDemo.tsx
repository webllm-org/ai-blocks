"use client"

import { useState, useRef } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, HelpCircle, X } from "lucide-react"

const SAMPLE_TEXT = `The implementation of quantum cryptographic protocols necessitates the utilization of entangled photon pairs to facilitate secure key distribution mechanisms. The fundamental principle underlying this methodology relies on the Heisenberg uncertainty principle, which precludes the possibility of eavesdropping without introducing detectable perturbations to the quantum state. Furthermore, the no-cloning theorem ensures that quantum information cannot be perfectly copied, providing an additional layer of security against potential adversaries.`

export function ExplainThisDemo() {
  const [selectedText, setSelectedText] = useState("")
  const [explanation, setExplanation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTextSelect = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (text && text.length > 0 && containerRef.current) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()

      if (rect) {
        setSelectedText(text)
        setPopupPosition({
          top: rect.bottom - containerRect.top + 8,
          left: Math.min(rect.left - containerRect.left, containerRect.width - 200)
        })
        setExplanation("")
      }
    }
  }

  const handleExplain = async () => {
    if (!selectedText) return
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Explain this text in simple terms that anyone can understand. Use plain language, avoid jargon, and give a brief analogy if helpful.

Text to explain: "${selectedText}"

Simple explanation:`,
        temperature: 0.7,
        maxTokens: 200,
      })
      setExplanation(result.text.trim())
    } catch (error) {
      setExplanation(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedText("")
    setExplanation("")
    setPopupPosition(null)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="text-sm text-muted-foreground mb-2">
        <HelpCircle className="h-4 w-4 inline mr-1" />
        Select any text below to get an explanation
      </div>

      <div
        ref={containerRef}
        className="relative"
      >
        <Card>
          <CardContent className="p-4">
            <p
              className="text-sm leading-relaxed select-text cursor-text"
              onMouseUp={handleTextSelect}
            >
              {SAMPLE_TEXT}
            </p>
          </CardContent>
        </Card>

        {popupPosition && selectedText && (
          <div
            className="absolute z-10 w-72 bg-background border rounded-lg shadow-lg"
            style={{ top: popupPosition.top, left: popupPosition.left }}
          >
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">Selected:</p>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleClose}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs bg-muted p-2 rounded mb-3 line-clamp-2">"{selectedText}"</p>

              {!explanation ? (
                <Button
                  onClick={handleExplain}
                  disabled={isLoading}
                  size="sm"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Explaining...
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Explain This
                    </>
                  )}
                </Button>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Explanation:</p>
                  <p className="text-sm">{explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Tip: Highlight complex terms like "quantum cryptographic protocols" or "Heisenberg uncertainty principle"
      </p>
    </div>
  )
}
