"use client"

import { useState, useEffect } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, MessageCircle, Send, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReplySuggestion {
  text: string
  tone: "positive" | "neutral" | "clarifying"
}

export interface ReplySuggestionsDemoProps {
  /** Default incoming message */
  defaultMessage?: string
}

export function ReplySuggestionsDemo({
  defaultMessage = "Hey, can you send me the report by end of day? Also, do you have time to chat about the project timeline?",
}: ReplySuggestionsDemoProps = {}) {
  const [incomingMessage, setIncomingMessage] = useState(defaultMessage)
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([])
  const [selectedReply, setSelectedReply] = useState<string | null>(null)
  const [editedReply, setEditedReply] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const generateSuggestions = async () => {
    if (!incomingMessage.trim()) return
    setIsLoading(true)
    setSuggestions([])
    setSelectedReply(null)

    try {
      const result = await generateText({
        prompt: `Generate 3 quick reply suggestions for this message:

"${incomingMessage}"

Provide:
1. A positive/affirmative response
2. A neutral/professional response
3. A clarifying question

Format as JSON:
[
  {"text": "Sure, I'll have it to you by 5pm!", "tone": "positive"},
  {"text": "I'll send the report today. Let me check my calendar for a chat.", "tone": "neutral"},
  {"text": "Which report are you referring to?", "tone": "clarifying"}
]

Keep responses brief (1-2 sentences).`,
        maxTokens: 250,
      })

      const parsed = JSON.parse(result.text)
      if (Array.isArray(parsed)) {
        setSuggestions(parsed)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (text: string) => {
    setSelectedReply(text)
    setEditedReply(text)
    setIsEditing(false)
  }

  const handleSend = () => {
    const finalReply = isEditing ? editedReply : selectedReply
    console.log("Sending reply:", finalReply)
    alert(`Reply sent: "${finalReply}"`)
    // Reset for next message
    setSelectedReply(null)
    setEditedReply("")
    setIsEditing(false)
  }

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case "positive":
        return "👍"
      case "clarifying":
        return "❓"
      default:
        return "💬"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {/* Incoming message */}
      <Card className="bg-muted">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            Incoming message
          </div>
          <Textarea
            value={incomingMessage}
            onChange={(e) => setIncomingMessage(e.target.value)}
            className="bg-white dark:bg-gray-900"
            rows={3}
          />
          <Button
            onClick={generateSuggestions}
            disabled={isLoading || !incomingMessage.trim()}
            className="w-full mt-2"
            variant="secondary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Generate Replies"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Reply suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick replies:</p>
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion, i) => (
              <Button
                key={i}
                variant={selectedReply === suggestion.text ? "default" : "outline"}
                className={cn(
                  "h-auto py-3 px-4 text-left justify-start whitespace-normal",
                  selectedReply === suggestion.text && "ring-2 ring-primary"
                )}
                onClick={() => handleSelect(suggestion.text)}
              >
                <span className="mr-2">{getToneIcon(suggestion.tone)}</span>
                <span className="flex-1">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Edit and send */}
      {selectedReply && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {isEditing ? (
              <Textarea
                value={editedReply}
                onChange={(e) => setEditedReply(e.target.value)}
                rows={3}
              />
            ) : (
              <div className="p-3 bg-primary/10 rounded-lg text-sm">
                {selectedReply}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-1" />
                {isEditing ? "Preview" : "Edit"}
              </Button>
              <Button
                size="sm"
                onClick={handleSend}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
