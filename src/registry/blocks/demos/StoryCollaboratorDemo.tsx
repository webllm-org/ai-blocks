"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, BookOpen, RefreshCw, Download, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

const GENRES = [
  { id: "fantasy", label: "Fantasy" },
  { id: "scifi", label: "Sci-Fi" },
  { id: "mystery", label: "Mystery" },
  { id: "romance", label: "Romance" },
  { id: "horror", label: "Horror" },
  { id: "adventure", label: "Adventure" },
]

interface StoryBlock {
  author: "user" | "ai"
  content: string
}

export interface StoryCollaboratorDemoProps {
  /** Default genre */
  defaultGenre?: string
}

export function StoryCollaboratorDemo({
  defaultGenre = "fantasy",
}: StoryCollaboratorDemoProps = {}) {
  const [genre, setGenre] = useState(defaultGenre)
  const [storyBlocks, setStoryBlocks] = useState<StoryBlock[]>([])
  const [input, setInput] = useState("")
  const [hint, setHint] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)

  const handleStart = async (userOpening?: string) => {
    setIsLoading(true)
    setStarted(true)
    setStoryBlocks([])

    if (userOpening) {
      setStoryBlocks([{ author: "user", content: userOpening }])
    }

    try {
      const prompt = userOpening
        ? `Continue this ${genre} story opening:\n\n"${userOpening}"\n\nWrite 2-3 sentences that advance the story naturally. End at an interesting moment.`
        : `Start a collaborative ${genre} story. Write 2-3 sentences to set the scene and hook the reader. End at a point where the other person can continue.`

      const result = await generateText({
        prompt,
        maxTokens: 150,
      })

      setStoryBlocks(prev => [...prev, { author: "ai", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = async () => {
    if (!input.trim()) return
    setIsLoading(true)

    const userBlock: StoryBlock = { author: "user", content: input.trim() }
    setStoryBlocks(prev => [...prev, userBlock])
    setInput("")

    const fullStory = [...storyBlocks, userBlock].map(b => b.content).join(" ")

    try {
      const result = await generateText({
        prompt: `Continue this ${genre} story:

${fullStory}

${hint ? `Direction hint: ${hint}` : ""}

Write 2-3 sentences that naturally continue the story. Match the tone and style. End at an interesting moment where the other person can continue.`,
        maxTokens: 150,
      })

      setStoryBlocks(prev => [...prev, { author: "ai", content: result.text }])
      setHint("")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (storyBlocks.length === 0) return
    setIsLoading(true)

    // Remove last AI block
    const blocksWithoutLast = storyBlocks.slice(0, -1)
    const fullStory = blocksWithoutLast.map(b => b.content).join(" ")

    try {
      const result = await generateText({
        prompt: `Continue this ${genre} story differently:

${fullStory}

Write 2-3 sentences with a different direction than before. Be creative and surprising.`,
        maxTokens: 150,
      })

      setStoryBlocks([...blocksWithoutLast, { author: "ai", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportStory = () => {
    const fullStory = storyBlocks.map(b => b.content).join("\n\n")
    const blob = new Blob([fullStory], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `collaborative-story-${genre}.txt`
    a.click()
  }

  if (!started) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-3 text-purple-500" />
            <h3 className="font-medium mb-2">Story Collaborator</h3>
            <p className="text-sm text-muted-foreground">
              Write a story together! You write, I continue, back and forth.
            </p>
          </CardContent>
        </Card>

        <div>
          <Label className="text-sm mb-2 block">Genre</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Your Opening (optional)</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Start the story yourself, or let me begin..."
            className="min-h-[80px]"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleStart(input.trim() || undefined)}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : input.trim() ? (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                I'll Start
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                You Start
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Genre: {genre}</span>
        <span className="text-muted-foreground">{storyBlocks.length} blocks</span>
      </div>

      <Card>
        <CardContent className="p-4 max-h-[300px] overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            {storyBlocks.map((block, i) => (
              <span
                key={i}
                className={cn(
                  block.author === "user"
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {block.content}{" "}
              </span>
            ))}
            {isLoading && (
              <span className="text-muted-foreground animate-pulse">...</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Continue the story..."
          className="min-h-[80px]"
        />
        <div className="flex gap-2">
          <Input
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Hint: 'make it darker', 'introduce a twist'..."
            className="flex-1 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleContinue}
          disabled={isLoading || !input.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>Continue</>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={isLoading || storyBlocks.length === 0 || storyBlocks[storyBlocks.length - 1].author !== "ai"}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={exportStory}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
