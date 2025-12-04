"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand2, RefreshCw, Sparkles } from "lucide-react"

export interface StoryPrompt {
  id: string
  label: string
  icon: string
}

const DEFAULT_PROMPTS: StoryPrompt[] = [
  { id: "continue", label: "Continue Story", icon: "➡️" },
  { id: "twist", label: "Add Plot Twist", icon: "🔄" },
  { id: "dialogue", label: "Add Dialogue", icon: "💬" },
  { id: "describe", label: "Describe Setting", icon: "🏞️" },
]

const DEFAULT_STORY = "The old lighthouse keeper climbed the spiral stairs one last time. After forty years, tonight would be different."

const DEFAULT_PROMPT_INSTRUCTIONS: Record<string, string> = {
  continue: "Continue this story naturally with 2-3 sentences. Maintain the tone and style.",
  twist: "Add an unexpected plot twist to this story. Make it surprising but believable. 2-3 sentences.",
  dialogue: "Add a dialogue exchange between characters. Show their personalities. 3-4 lines of dialogue.",
  describe: "Describe the setting or atmosphere in vivid detail. Use sensory language. 2-3 sentences.",
}

export interface StoryHelperDemoProps {
  /** Available story prompts */
  prompts?: StoryPrompt[]
  /** Initial story text */
  defaultStory?: string
  /** Default selected prompt ID */
  defaultPromptId?: string
  /** Prompt instructions mapping */
  promptInstructions?: Record<string, string>
  /** Placeholder for textarea */
  placeholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function StoryHelperDemo({
  prompts = DEFAULT_PROMPTS,
  defaultStory = DEFAULT_STORY,
  defaultPromptId = "continue",
  promptInstructions = DEFAULT_PROMPT_INSTRUCTIONS,
  placeholder = "Start your story here...",
  temperature = 0.9,
  maxTokens = 200,
}: StoryHelperDemoProps = {}) {
  const [story, setStory] = useState(defaultStory)
  const [continuation, setContinuation] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState(defaultPromptId)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!story.trim()) return
    setIsLoading(true)
    setContinuation("")

    try {
      const result = await generateText({
        prompt: `${promptInstructions[selectedPrompt]}

Story so far:
${story}

${selectedPrompt === "dialogue" ? "Dialogue:" : "Continuation:"}`,
        temperature,
        maxTokens,
      })
      setContinuation(result.text.trim())
    } catch (error) {
      setContinuation("Error generating content")
    } finally {
      setIsLoading(false)
    }
  }

  const acceptContinuation = () => {
    setStory(prev => prev + "\n\n" + continuation)
    setContinuation("")
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="font-serif"
      />

      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <Button
            key={p.id}
            variant={selectedPrompt === p.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPrompt(p.id)}
          >
            <span className="mr-1">{p.icon}</span>
            {p.label}
          </Button>
        ))}
      </div>

      <Button onClick={handleGenerate} disabled={isLoading || !story.trim()} className="w-full">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Writing...</>
        ) : (
          <><Wand2 className="h-4 w-4 mr-2" />Generate</>
        )}
      </Button>

      {continuation && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Badge variant="secondary">{prompts.find(p => p.id === selectedPrompt)?.label}</Badge>
            </div>
            <p className="text-sm font-serif italic">{continuation}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={acceptContinuation}>
                Accept & Add
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerate}>
                <RefreshCw className="h-3 w-3 mr-1" />Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{story.split(/\s+/).length} words</span>
        <span>Tip: Select different modes for variety</span>
      </div>
    </div>
  )
}
