"use client"

import { useState, useRef } from "react"
import { generateText } from "@webllm/client"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, BookOpen } from "lucide-react"

const DEFAULT_TEXT = `Machine learning models use gradient descent to optimize their loss function during training. The backpropagation algorithm computes gradients efficiently by applying the chain rule. Modern architectures like transformers use attention mechanisms to process sequential data, enabling better performance on NLP tasks.`

const DEFAULT_TERMS = ["gradient descent", "loss function", "backpropagation", "chain rule", "transformers", "attention mechanisms", "NLP"]

export interface GlossaryHoverDemoProps {
  /** Text content with technical terms */
  text?: string
  /** Technical terms to highlight */
  technicalTerms?: string[]
  /** Context for definitions */
  definitionContext?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function GlossaryHoverDemo({
  text = DEFAULT_TEXT,
  technicalTerms = DEFAULT_TERMS,
  definitionContext = "machine learning",
  temperature = 0.5,
  maxTokens = 100,
}: GlossaryHoverDemoProps = {}) {
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null)
  const [definition, setDefinition] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [cache, setCache] = useState<Record<string, string>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  const getDefinition = async (term: string) => {
    if (cache[term]) {
      setDefinition(cache[term])
      return
    }

    setIsLoading(true)
    setDefinition("")

    try {
      const result = await generateText({
        prompt: `Define "${term}" in simple terms for someone learning about ${definitionContext}. Keep it to 1-2 sentences, beginner-friendly.

Definition:`,
        temperature,
        maxTokens,
      })
      const def = result.text.trim() || "Definition not available"
      setDefinition(def)
      setCache(prev => ({ ...prev, [term]: def }))
    } catch {
      setDefinition("Definition not available")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMouseEnter = (term: string, event: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const target = event.target as HTMLElement
    const termRect = target.getBoundingClientRect()

    setPosition({
      x: termRect.left - rect.left,
      y: termRect.bottom - rect.top + 8
    })
    setHoveredTerm(term)
    getDefinition(term)
  }

  const handleMouseLeave = () => {
    setHoveredTerm(null)
    setDefinition("")
  }

  const renderTextWithTerms = () => {
    let processedText = text
    const elements: React.ReactNode[] = []

    technicalTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, "gi")
      text = text.replace(regex, `|||TERM:$1|||`)
    })

    const parts = text.split("|||")
    parts.forEach((part, i) => {
      if (part.startsWith("TERM:")) {
        const term = part.replace("TERM:", "")
        elements.push(
          <span
            key={i}
            className="underline decoration-dotted decoration-primary cursor-help text-primary font-medium"
            onMouseEnter={(e) => handleMouseEnter(term.toLowerCase(), e)}
            onMouseLeave={handleMouseLeave}
          >
            {term}
          </span>
        )
      } else {
        elements.push(<span key={i}>{part}</span>)
      }
    })

    return elements
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>Hover over highlighted terms for definitions</span>
      </div>

      <div ref={containerRef} className="relative">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm leading-relaxed">{renderTextWithTerms()}</p>
          </CardContent>
        </Card>

        {hoveredTerm && (
          <div
            className="absolute z-10 w-64 bg-popover border rounded-lg shadow-lg p-3"
            style={{ left: Math.min(position.x, 200), top: position.y }}
          >
            <p className="text-xs font-medium text-primary mb-1 capitalize">{hoveredTerm}</p>
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{definition}</p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Technical terms: {technicalTerms.length} highlighted
      </p>
    </div>
  )
}
