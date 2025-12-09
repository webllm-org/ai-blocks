"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, Heart, Info, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface JournalEntry {
  role: "user" | "reflection"
  content: string
  themes?: string[]
}

export interface ReflectionJournalDemoProps {
  /** Initial prompt for journaling */
  initialPrompt?: string
}

export function ReflectionJournalDemo({
  initialPrompt = "",
}: ReflectionJournalDemoProps = {}) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [input, setInput] = useState(initialPrompt)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionThemes, setSessionThemes] = useState<string[]>([])

  const handleSubmit = async () => {
    if (!input.trim()) return
    setIsLoading(true)

    const userEntry: JournalEntry = { role: "user", content: input.trim() }
    setEntries(prev => [...prev, userEntry])
    setInput("")

    try {
      const result = await generateText({
        prompt: `You are a supportive reflective listener. Someone shared this:

"${input.trim()}"

${entries.length > 0 ? `Previous context:\n${entries.slice(-4).map(e => `${e.role === "user" ? "Them" : "You"}: ${e.content}`).join("\n")}` : ""}

Respond with 2-3 thoughtful, open-ended questions that:
- Help them explore their feelings deeper
- Avoid giving advice or solutions
- Show you heard what they said
- Gently encourage self-reflection

Also identify 1-2 themes from what they shared (just the theme words, not sentences).

Format:
QUESTIONS: [Your reflective questions]
THEMES: theme1, theme2`,
        maxTokens: 300,
      })

      const text = result.text
      const questionsMatch = text.match(/QUESTIONS:\s*([\s\S]*?)(?=THEMES:|$)/)
      const themesMatch = text.match(/THEMES:\s*([\s\S]*)/)

      const questions = questionsMatch?.[1]?.trim() || text
      const themes = themesMatch?.[1]?.split(",").map(t => t.trim()).filter(Boolean) || []

      setEntries(prev => [...prev, {
        role: "reflection",
        content: questions,
        themes,
      }])

      // Update session themes
      if (themes.length > 0) {
        setSessionThemes(prev => {
          const newThemes = [...new Set([...prev, ...themes])]
          return newThemes.slice(-6) // Keep last 6 themes
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoDeeper = async () => {
    if (entries.length === 0) return
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Based on this reflection session:

${entries.slice(-4).map(e => `${e.role === "user" ? "Them" : "Reflection"}: ${e.content}`).join("\n\n")}

Ask a deeper, more probing question that helps them explore the underlying feelings or patterns. Keep it gentle but insightful.`,
        maxTokens: 150,
      })

      setEntries(prev => [...prev, {
        role: "reflection",
        content: result.text,
      }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          This is a reflective journaling tool, not therapy. For mental health support, please consult a licensed professional.
        </AlertDescription>
      </Alert>

      {entries.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-3 text-purple-500" />
            <h3 className="font-medium mb-2">What's on your mind?</h3>
            <p className="text-sm text-muted-foreground">
              Write freely about what you're thinking or feeling. I'll respond with thoughtful questions to help you explore your thoughts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 max-h-[350px] overflow-y-auto space-y-4">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg",
                  entry.role === "user"
                    ? "bg-primary/10 ml-4"
                    : "bg-muted mr-4"
                )}
              >
                {entry.role === "reflection" && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Sparkles className="h-3 w-3" />
                    Reflection
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Reflecting...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {sessionThemes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Themes:</span>
          {sessionThemes.map((theme, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Write what's on your mind..."
        className="min-h-[100px]"
      />

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Share
            </>
          )}
        </Button>
        {entries.length > 0 && (
          <Button
            variant="outline"
            onClick={handleGoDeeper}
            disabled={isLoading}
          >
            Go Deeper
          </Button>
        )}
      </div>
    </div>
  )
}
