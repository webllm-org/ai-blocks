"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function QuickActionsDemo() {
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const actions = [
    { id: "joke", label: "Tell a Joke", prompt: "Tell me a short, clean joke.", icon: "😄" },
    { id: "fact", label: "Fun Fact", prompt: "Tell me an interesting and surprising fact.", icon: "💡" },
    { id: "quote", label: "Inspirational Quote", prompt: "Give me an inspirational quote with the author.", icon: "✨" },
    { id: "riddle", label: "Riddle", prompt: "Give me a short riddle with its answer.", icon: "🧩" },
  ]

  const handleAction = async (action: typeof actions[0]) => {
    if (!clientRef.current) return
    setIsLoading(true)
    setActiveAction(action.id)
    setOutput("")

    try {
      await clientRef.current.streamText({
        prompt: action.prompt,
        temperature: 0.9,
        maxTokens: 150,
        onChunk: (chunk: string) => {
          setOutput((prev) => prev + chunk)
        },
      })
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
      setActiveAction(null)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={isLoading}
            variant="outline"
            className="h-auto py-3 flex-col gap-1"
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-xs">{action.label}</span>
            {activeAction === action.id && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
          </Button>
        ))}
      </div>
      {output && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap">{output}</p>
            {isLoading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
