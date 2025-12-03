"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand2, Undo, History } from "lucide-react"

type EditHistory = {
  instruction: string
  description: string
}

const sampleImage = {
  name: "Product Photo",
  description: "A white coffee mug on a wooden table with natural lighting",
  placeholder: "☕"
}

const sampleEdits = [
  "Change the background to a beach sunset",
  "Make the mug blue instead of white",
  "Add steam rising from the coffee",
  "Remove the table, make it float"
]

export function ImageEditorDemo() {
  const [instruction, setInstruction] = useState("")
  const [currentDescription, setCurrentDescription] = useState(sampleImage.description)
  const [history, setHistory] = useState<EditHistory[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const applyEdit = async (editInstruction?: string) => {
    const edit = editInstruction || instruction
    if (!clientRef.current || !edit.trim()) return

    setIsProcessing(true)

    try {
      const result = await clientRef.current.generateText({
        prompt: `You are an AI image editor. Given an image description and an edit instruction, describe what the image would look like after the edit.

Current image: "${currentDescription}"

Edit instruction: "${edit}"

Describe the edited image in one detailed sentence (max 30 words):`,
        temperature: 0.7,
        maxTokens: 80,
      })

      const newDescription = result.text.trim()
      setHistory(prev => [...prev, { instruction: edit, description: currentDescription }])
      setCurrentDescription(newDescription)
      setInstruction("")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const undo = () => {
    if (history.length === 0) return
    const lastState = history[history.length - 1]
    setCurrentDescription(lastState.description)
    setHistory(prev => prev.slice(0, -1))
  }

  const reset = () => {
    setCurrentDescription(sampleImage.description)
    setHistory([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyEdit()
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {/* Image Preview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Image Preview</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={history.length === 0 || isProcessing}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                disabled={history.length === 0 || isProcessing}
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-lg flex items-center justify-center mb-3">
            <span className="text-6xl">{sampleImage.placeholder}</span>
          </div>
          <p className="text-sm text-muted-foreground">{currentDescription}</p>
          {history.length > 0 && (
            <Badge variant="secondary" className="mt-2">
              {history.length} edit{history.length !== 1 ? "s" : ""} applied
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Edit Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your edit... (e.g., 'make the sky purple')"
              disabled={isProcessing}
            />
            <Button
              onClick={() => applyEdit()}
              disabled={isProcessing || !instruction.trim()}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Edits */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Quick edits:</span>
        <div className="flex flex-wrap gap-2">
          {sampleEdits.map((edit, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => {
                setInstruction(edit)
                applyEdit(edit)
              }}
            >
              {edit}
            </Badge>
          ))}
        </div>
      </div>

      {/* Edit History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Edit History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((edit, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="shrink-0">{index + 1}</Badge>
                  <span className="text-muted-foreground">{edit.instruction}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        In production, this would use image editing APIs (like DALL-E edit) to apply actual changes
      </p>
    </div>
  )
}
