"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, GitCommit, Copy, Check, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommitMessage {
  subject: string
  body?: string
  type: string
  scope?: string
}

const COMMIT_STYLES = [
  { id: "conventional", label: "Conventional", example: "feat(auth): add login" },
  { id: "simple", label: "Simple", example: "Add login feature" },
  { id: "detailed", label: "Detailed", example: "Add login + body" },
]

export interface CommitMessageWriterDemoProps {
  /** Default diff/changes description */
  defaultChanges?: string
}

export function CommitMessageWriterDemo({
  defaultChanges = `- Added new login form component
- Integrated with auth API
- Added form validation
- Added remember me checkbox`,
}: CommitMessageWriterDemoProps = {}) {
  const [changes, setChanges] = useState(defaultChanges)
  const [style, setStyle] = useState("conventional")
  const [messages, setMessages] = useState<CommitMessage[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!changes.trim()) return
    setIsLoading(true)
    setMessages([])

    try {
      const response = await generateText({
        prompt: `Generate 3 git commit message options for these changes:

Changes:
${changes}

Style: ${COMMIT_STYLES.find(s => s.id === style)?.label}
${style === "conventional" ? "Use format: type(scope): subject" : ""}
${style === "detailed" ? "Include a body with more details" : ""}

Return as JSON array:
[
  {
    "subject": "The commit subject line (50 chars max)",
    "body": "Optional body for detailed style",
    "type": "feat/fix/docs/style/refactor/test/chore",
    "scope": "component name or area"
  }
]

Provide 3 different options from specific to general.`,
        maxTokens: 400,
      })

      const parsed = JSON.parse(response.text)
      if (Array.isArray(parsed)) {
        setMessages(parsed)
        setSelectedIndex(0)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFullMessage = (msg: CommitMessage) => {
    if (style === "conventional") {
      const scope = msg.scope ? `(${msg.scope})` : ""
      const subject = `${msg.type}${scope}: ${msg.subject}`
      return msg.body ? `${subject}\n\n${msg.body}` : subject
    }
    return msg.body ? `${msg.subject}\n\n${msg.body}` : msg.subject
  }

  const handleCopy = async () => {
    if (messages.length === 0) return
    await navigator.clipboard.writeText(getFullMessage(messages[selectedIndex]))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      feat: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      fix: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      docs: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      style: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      refactor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      test: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      chore: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    }
    return colors[type] || colors.chore
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Describe your changes</Label>
        <Textarea
          value={changes}
          onChange={(e) => setChanges(e.target.value)}
          placeholder="Paste your diff, describe changes, or list what you did..."
          rows={4}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Commit style</Label>
        <RadioGroup value={style} onValueChange={setStyle} className="flex gap-3">
          {COMMIT_STYLES.map((s) => (
            <div key={s.id} className="flex items-center space-x-2">
              <RadioGroupItem value={s.id} id={s.id} />
              <Label htmlFor={s.id} className="text-sm cursor-pointer">
                {s.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !changes.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <GitCommit className="h-4 w-4 mr-2" />
            Generate Commit Message
          </>
        )}
      </Button>

      {messages.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {messages.map((_, i) => (
                  <Button
                    key={i}
                    variant={selectedIndex === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedIndex(i)}
                    className="w-8 h-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  title="Regenerate"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
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
            </div>

            <div className="space-y-2">
              {style === "conventional" && (
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(messages[selectedIndex].type)}>
                    {messages[selectedIndex].type}
                  </Badge>
                  {messages[selectedIndex].scope && (
                    <Badge variant="outline">
                      {messages[selectedIndex].scope}
                    </Badge>
                  )}
                </div>
              )}

              <div className="p-3 bg-gray-900 rounded-lg">
                <code className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {getFullMessage(messages[selectedIndex])}
                </code>
              </div>

              <p className="text-xs text-muted-foreground">
                Subject: {messages[selectedIndex].subject.length}/50 characters
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
