"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"

const TONES = [
  { id: "professional", label: "Professional", icon: "👔" },
  { id: "casual", label: "Casual", icon: "😊" },
  { id: "formal", label: "Formal", icon: "📜" },
  { id: "friendly", label: "Friendly", icon: "🤝" },
  { id: "concise", label: "Concise", icon: "✂️" },
  { id: "elaborate", label: "Elaborate", icon: "📝" },
] as const

export function TextRewriterDemo() {
  const [text, setText] = useState("Hey! Just wanted to check if you got my email about the project. Let me know when you can chat!")
  const [selectedTone, setSelectedTone] = useState<string>("professional")
  const [rewritten, setRewritten] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleRewrite = async () => {
    if (!text.trim() || !clientRef.current) return
    setIsLoading(true)
    setRewritten("")

    try {
      const tone = TONES.find(t => t.id === selectedTone)
      const result = await clientRef.current.generateText({
        prompt: `Rewrite the following text in a ${selectedTone} tone. Keep the same meaning but adjust the style and word choice.

Original text: "${text}"

Rewritten (${tone?.label} tone):`,
        temperature: 0.7,
        maxTokens: 300,
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
        placeholder="Enter text to rewrite..."
        rows={3}
      />

      <div className="flex flex-wrap gap-2">
        {TONES.map((tone) => (
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
