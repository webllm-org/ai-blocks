"use client"

import { useState } from "react"
import { streamText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Zap } from "lucide-react"

export function StreamingTextDemo() {
  const [prompt, setPrompt] = useState("Write a haiku about artificial intelligence")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleStream = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)
    setResponse("")
    try {
      await streamText({
        prompt: prompt.trim(),
        temperature: 0.8,
        maxTokens: 200,
        onChunk: (chunk: string) => {
          setResponse((prev) => prev + chunk)
        },
      })
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
          onKeyDown={(e) => e.key === "Enter" && handleStream()}
        />
        <Button onClick={handleStream} disabled={isLoading || !prompt.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        </Button>
      </div>
      {response && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap">{response}</p>
            {isLoading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
