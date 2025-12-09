"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, Copy, Check, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface CronResult {
  expression: string
  explanation: string
  nextRuns: string[]
  warnings?: string[]
}

export interface CronBuilderDemoProps {
  /** Default schedule description */
  defaultDescription?: string
}

export function CronBuilderDemo({
  defaultDescription = "Every weekday at 9am",
}: CronBuilderDemoProps = {}) {
  const [description, setDescription] = useState(defaultDescription)
  const [cronExpression, setCronExpression] = useState("")
  const [result, setResult] = useState<CronResult | null>(null)
  const [mode, setMode] = useState<"describe" | "explain">("describe")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      const response = await generateText({
        prompt: `Convert this schedule description to a cron expression:

"${description}"

Return as JSON:
{
  "expression": "* * * * *",
  "explanation": "Human-readable explanation of when this runs",
  "nextRuns": ["Next 3 run times in readable format"],
  "warnings": ["Any potential issues or gotchas (optional)"]
}

Use standard 5-field cron format (minute hour day month weekday).
Be precise about timezone considerations if relevant.`,
        maxTokens: 250,
      })

      const parsed = JSON.parse(response.text)
      setResult(parsed)
      setCronExpression(parsed.expression)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExplain = async () => {
    if (!cronExpression.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      const response = await generateText({
        prompt: `Explain this cron expression in simple terms:

"${cronExpression}"

Return as JSON:
{
  "expression": "${cronExpression}",
  "explanation": "Detailed human-readable explanation",
  "nextRuns": ["Next 3 run times in readable format (e.g., 'Monday, January 15 at 9:00 AM')"],
  "warnings": ["Any potential issues like overlap, frequency concerns, etc (optional)"]
}

Break down each field if helpful.`,
        maxTokens: 250,
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
    const expr = result?.expression || cronExpression
    if (!expr) return
    await navigator.clipboard.writeText(expr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={mode === "describe" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("describe")}
          className="flex-1"
        >
          Describe → Cron
        </Button>
        <Button
          variant={mode === "explain" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("explain")}
          className="flex-1"
        >
          Cron → Explain
        </Button>
      </div>

      {mode === "describe" ? (
        <div className="space-y-2">
          <Label className="text-sm">Describe your schedule</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Every Monday at 3pm"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !description.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Generate Cron
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-sm">Enter cron expression</Label>
          <Input
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
            placeholder="* * * * *"
            className="font-mono"
            onKeyDown={(e) => e.key === "Enter" && handleExplain()}
          />
          <Button
            onClick={handleExplain}
            disabled={isLoading || !cronExpression.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Explain
              </>
            )}
          </Button>
        </div>
      )}

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono font-bold">
                {result.expression}
              </code>
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

            <p className="text-sm">{result.explanation}</p>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Next runs:</p>
              <div className="space-y-1">
                {result.nextRuns.map((run, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {run}
                  </div>
                ))}
              </div>
            </div>

            {result.warnings && result.warnings.length > 0 && (
              <div className="pt-2 border-t">
                <div className="space-y-1">
                  {result.warnings.map((warning, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs text-yellow-600 border-yellow-300"
                    >
                      ⚠️ {warning}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Format: minute hour day month weekday
              </p>
              <div className="flex gap-1 mt-1">
                {result.expression.split(" ").map((field, i) => (
                  <Badge key={i} variant="secondary" className="font-mono text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
