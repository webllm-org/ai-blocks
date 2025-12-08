"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Lightbulb, Star, ArrowRight, Merge, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface Idea {
  id: string
  content: string
  source: "user" | "ai"
  starred: boolean
  branch?: string
}

interface Message {
  role: "user" | "ai"
  content: string
  ideas?: string[]
}

export interface BrainstormPartnerDemoProps {
  /** Initial problem statement */
  defaultProblem?: string
}

export function BrainstormPartnerDemo({
  defaultProblem = "",
}: BrainstormPartnerDemoProps = {}) {
  const [problem, setProblem] = useState(defaultProblem)
  const [messages, setMessages] = useState<Message[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<string | null>(null)

  const handleStart = async () => {
    if (!problem.trim()) return
    setIsLoading(true)
    setStarted(true)
    setMessages([])
    setIdeas([])

    try {
      const result = await generateText({
        prompt: `You're a creative brainstorming partner. The problem/challenge is:

"${problem.trim()}"

Start by acknowledging the challenge and offering 3 initial ideas. Then ask a "what if" question to spark more thinking.

Format your ideas as a numbered list, then add your question.`,
        maxTokens: 300,
      })

      // Extract ideas from response
      const ideaMatches = result.text.match(/\d+\.\s*(.+?)(?=\d+\.|$|What if|\?)/gs) || []
      const extractedIdeas = ideaMatches.map(m => m.replace(/^\d+\.\s*/, "").trim()).filter(Boolean)

      const newIdeas = extractedIdeas.map((content, i) => ({
        id: `ai-${Date.now()}-${i}`,
        content,
        source: "ai" as const,
        starred: false,
      }))

      setIdeas(newIdeas)
      setMessages([{ role: "ai", content: result.text, ideas: extractedIdeas }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!input.trim()) return
    setIsLoading(true)

    // Add user's idea to the list
    const userIdea: Idea = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      source: "user",
      starred: false,
      branch: currentBranch || undefined,
    }
    setIdeas(prev => [...prev, userIdea])

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    try {
      const result = await generateText({
        prompt: `You're brainstorming about: "${problem}"

${currentBranch ? `We're exploring the direction: "${currentBranch}"` : ""}

Ideas so far:
${ideas.map(i => `- ${i.content} ${i.starred ? "⭐" : ""}`).join("\n")}

User's latest input: "${input.trim()}"

Build on their idea! Suggest 2 related ideas that extend or combine with what they said. Then ask a provocative "what if" question.`,
        maxTokens: 250,
      })

      const ideaMatches = result.text.match(/[-•]\s*(.+?)(?=[-•]|$|What if|\?)/gs) || []
      const extractedIdeas = ideaMatches.map(m => m.replace(/^[-•]\s*/, "").trim()).filter(Boolean)

      const newIdeas = extractedIdeas.map((content, i) => ({
        id: `ai-${Date.now()}-${i}`,
        content,
        source: "ai" as const,
        starred: false,
        branch: currentBranch || undefined,
      }))

      setIdeas(prev => [...prev, ...newIdeas])
      setMessages(prev => [...prev, { role: "ai", content: result.text, ideas: extractedIdeas }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStar = (id: string) => {
    setIdeas(prev => prev.map(i =>
      i.id === id ? { ...i, starred: !i.starred } : i
    ))
  }

  const startBranch = (ideaContent: string) => {
    setCurrentBranch(ideaContent)
  }

  const exportIdeas = () => {
    const starred = ideas.filter(i => i.starred)
    const content = `# Brainstorm: ${problem}\n\n## Starred Ideas\n${starred.map(i => `- ${i.content}`).join("\n")}\n\n## All Ideas\n${ideas.map(i => `- ${i.content}`).join("\n")}`
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "brainstorm.md"
    a.click()
  }

  if (!started) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
          <CardContent className="p-6 text-center">
            <Lightbulb className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
            <h3 className="font-medium mb-2">Brainstorm Partner</h3>
            <p className="text-sm text-muted-foreground">
              I'll help you generate ideas, build on yours, and ask "what if" questions.
            </p>
          </CardContent>
        </Card>

        <div>
          <Label className="text-sm mb-2 block">Problem or Creative Brief</Label>
          <Textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g., How might we make onboarding more engaging for new users?"
            className="min-h-[80px]"
          />
        </div>

        <Button onClick={handleStart} disabled={isLoading || !problem.trim()} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Start Brainstorming
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {currentBranch && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">Exploring: {currentBranch.slice(0, 30)}...</Badge>
          <Button size="sm" variant="ghost" onClick={() => setCurrentBranch(null)}>
            Back to main
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-4 max-h-[250px] overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-lg text-sm",
                msg.role === "ai" ? "bg-muted" : "bg-primary text-primary-foreground ml-8"
              )}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ideas panel */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs font-medium mb-2 flex items-center justify-between">
            <span>Ideas ({ideas.length})</span>
            <span className="text-muted-foreground">{ideas.filter(i => i.starred).length} starred</span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className={cn(
                  "text-xs px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer",
                  idea.starred ? "bg-yellow-100 dark:bg-yellow-900" : "bg-muted",
                  idea.source === "user" ? "border border-primary/30" : ""
                )}
                onClick={() => toggleStar(idea.id)}
                title={idea.content}
              >
                {idea.starred && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                <span className="truncate max-w-[150px]">{idea.content}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add your idea or build on one..."
          className="min-h-[60px]"
        />
        <Button onClick={handleRespond} disabled={isLoading || !input.trim()} className="self-end">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={exportIdeas} className="flex-1">
          <Download className="h-4 w-4 mr-1" />
          Export Ideas
        </Button>
      </div>
    </div>
  )
}
