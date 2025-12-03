"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"

export function TextGenerationDemo() {
  const [prompt, setPrompt] = useState("Tell me a short joke about programming")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() || !clientRef.current) return
    setIsLoading(true)
    setResponse("")
    try {
      const result = await clientRef.current.generateText({
        prompt: prompt.trim(),
        temperature: 0.7,
        maxTokens: 150,
      })
      setResponse(result.text)
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        </Button>
      </div>
      {response && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap">{response}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
