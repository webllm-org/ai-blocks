"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, GitBranch, Copy, Check, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface GitResult {
  command: string
  explanation: string
  steps?: string[]
  warning?: string
  alternatives?: { command: string; description: string }[]
}

export interface GitHelperDemoProps {
  /** Default task description */
  defaultTask?: string
}

export function GitHelperDemo({
  defaultTask = "Undo my last commit but keep the changes",
}: GitHelperDemoProps = {}) {
  const [task, setTask] = useState(defaultTask)
  const [result, setResult] = useState<GitResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const QUICK_TASKS = [
    "Undo last commit",
    "Squash last 3 commits",
    "Delete a remote branch",
    "Cherry-pick a commit",
    "Revert a pushed commit",
    "See who changed a line",
  ]

  const handleGenerate = async (taskText?: string) => {
    const taskToUse = taskText || task
    if (!taskToUse.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await generateText({
        prompt: `Provide the git command(s) for this task:

"${taskToUse}"

Return as JSON:
{
  "command": "git command here",
  "explanation": "What this command does and why",
  "steps": ["Step 1 if multi-step process", "Step 2"],
  "warning": "Any danger or data loss warnings (optional)",
  "alternatives": [
    {"command": "alternative command", "description": "when to use this instead"}
  ]
}

Be precise about flags and options. Include --help tip if complex.`,
        maxTokens: 300,
      })

      const parsed = JSON.parse(response.text)
      setResult(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result?.command) return
    await navigator.clipboard.writeText(result.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">What do you want to do?</Label>
        <Textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe what you want to do with git..."
          rows={2}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_TASKS.map((quickTask) => (
          <Badge
            key={quickTask}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => {
              setTask(quickTask)
              handleGenerate(quickTask)
            }}
          >
            {quickTask}
          </Badge>
        ))}
      </div>

      <Button
        onClick={() => handleGenerate()}
        disabled={isLoading || !task.trim()}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <GitBranch className="h-4 w-4 mr-2" />
            Get Git Command
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Command</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <code className="block p-3 bg-gray-900 text-green-400 rounded-lg text-sm font-mono">
                $ {result.command}
              </code>
            </div>

            <p className="text-sm text-muted-foreground">{result.explanation}</p>

            {result.steps && result.steps.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Steps</Label>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {result.warning && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  {result.warning}
                </p>
              </div>
            )}

            {result.alternatives && result.alternatives.length > 0 && (
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Alternatives:</p>
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="space-y-1">
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {alt.command}
                    </code>
                    <p className="text-xs text-muted-foreground">{alt.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
