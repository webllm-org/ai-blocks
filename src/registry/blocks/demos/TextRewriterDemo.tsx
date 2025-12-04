"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"

export interface Tone {
  id: string
  label: string
  icon: string
}

const DEFAULT_TONES: Tone[] = [
  { id: "professional", label: "Professional", icon: "👔" },
  { id: "casual", label: "Casual", icon: "😊" },
  { id: "formal", label: "Formal", icon: "📜" },
  { id: "friendly", label: "Friendly", icon: "🤝" },
  { id: "concise", label: "Concise", icon: "✂️" },
  { id: "elaborate", label: "Elaborate", icon: "📝" },
]

const DEFAULT_TEXT = "Hey! Just wanted to check if you got my email about the project. Let me know when you can chat!"

export interface TextRewriterDemoProps {
  /** List of tones to choose from */
  tones?: Tone[]
  /** Initial text to rewrite */
  defaultText?: string
  /** Initial selected tone ID */
  defaultToneId?: string
  /** Placeholder text for the textarea */
  placeholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function TextRewriterDemo({
  tones = DEFAULT_TONES,
  defaultText = DEFAULT_TEXT,
  defaultToneId = "professional",
  placeholder = "Enter text to rewrite...",
  temperature = 0.7,
  maxTokens = 300,
}: TextRewriterDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [selectedTone, setSelectedTone] = useState<string>(defaultToneId)
  const [rewritten, setRewritten] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRewrite = async () => {
    if (!text.trim()) return
    setIsLoading(true)
    setRewritten("")

    try {
      const tone = tones.find(t => t.id === selectedTone)
      const result = await generateText({
        prompt: `Rewrite the following text in a ${selectedTone} tone. Keep the same meaning but adjust the style and word choice.

Original text: "${text}"

Rewritten (${tone?.label} tone):`,
        temperature,
        maxTokens,
      })
      setRewritten(result.text.trim())
    } catch (error) {
      setRewritten(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />

      <div className="flex flex-wrap gap-2">
        {tones.map((tone) => (
          <Button
            key={tone.id}
            variant={selectedTone === tone.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTone(tone.id)}
          >
            <span className="mr-1">{tone.icon}</span>
            {tone.label}
          </Button>
        ))}
      </div>

      <Button onClick={handleRewrite} disabled={isLoading || !text.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Rewriting...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Rewrite Text
          </>
        )}
      </Button>

      {rewritten && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap">{rewritten}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
