"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, Share2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Statement {
  text: string
  isLie: boolean
}

interface Game {
  statements: Statement[]
  explanation: string
}

export interface TwoTruthsLieDemoProps {
  /** Default topic or facts */
  defaultInput?: string
}

export function TwoTruthsLieDemo({
  defaultInput = "",
}: TwoTruthsLieDemoProps = {}) {
  const [input, setInput] = useState(defaultInput)
  const [mode, setMode] = useState<"topic" | "facts">("topic")
  const [game, setGame] = useState<Game | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim() && mode === "facts") return
    setIsLoading(true)
    setGame(null)
    setSelectedIndex(null)
    setRevealed(false)

    try {
      const prompt = mode === "facts"
        ? `Based on these facts about someone/something: "${input}"

Create a "Two Truths and a Lie" game. Generate 2 true statements based on the facts, and 1 believable lie that could be true but isn't.

Format as JSON:
{
  "statements": [
    {"text": "statement 1", "isLie": false},
    {"text": "statement 2", "isLie": false},
    {"text": "statement 3", "isLie": true}
  ],
  "explanation": "why the lie is the lie"
}

Shuffle the order randomly.`
        : `Create a "Two Truths and a Lie" game about: "${input || "interesting random facts"}"

Generate 2 true and surprising facts, and 1 believable lie that sounds true but isn't.

Format as JSON:
{
  "statements": [
    {"text": "statement 1", "isLie": false},
    {"text": "statement 2", "isLie": false},
    {"text": "statement 3", "isLie": true}
  ],
  "explanation": "why the lie is the lie and the truths are true"
}

Shuffle the order randomly.`

      const result = await generateText({
        prompt,
        maxTokens: 400,
      })

      const parsed = JSON.parse(result.text)
      setGame(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuess = (index: number) => {
    if (revealed) return
    setSelectedIndex(index)
  }

  const handleReveal = () => {
    setRevealed(true)
  }

  const isCorrect = selectedIndex !== null && game?.statements[selectedIndex]?.isLie

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <Button
          variant={mode === "topic" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("topic")}
          className="flex-1"
        >
          Topic-based
        </Button>
        <Button
          variant={mode === "facts" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("facts")}
          className="flex-1"
        >
          About Me/Facts
        </Button>
      </div>

      <div>
        <Label className="text-sm mb-2 block">
          {mode === "topic" ? "Topic (optional)" : "Facts about you/something"}
        </Label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "topic"
            ? "e.g., Space exploration, Ancient Rome, or leave blank for random"
            : "e.g., I've visited 20 countries, I speak 3 languages, I have a twin..."
          }
          className="min-h-[80px]"
        />
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>Generate Game</>
        )}
      </Button>

      {game && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium text-center">Guess the Lie!</h3>

            <div className="space-y-2">
              {game.statements.map((s, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-3 text-left justify-start",
                    selectedIndex === i && !revealed && "border-primary bg-primary/10",
                    revealed && s.isLie && "border-red-500 bg-red-50 dark:bg-red-950",
                    revealed && !s.isLie && "border-green-500 bg-green-50 dark:bg-green-950"
                  )}
                  onClick={() => handleGuess(i)}
                  disabled={revealed}
                >
                  <span className="mr-2">{i + 1}.</span>
                  <span className="text-wrap flex-1">{s.text}</span>
                  {revealed && (
                    s.isLie
                      ? <X className="h-4 w-4 text-red-500 ml-2" />
                      : <Check className="h-4 w-4 text-green-500 ml-2" />
                  )}
                </Button>
              ))}
            </div>

            {selectedIndex !== null && !revealed && (
              <Button onClick={handleReveal} className="w-full">
                Reveal Answer
              </Button>
            )}

            {revealed && (
              <div className="space-y-3">
                <div className={cn(
                  "text-center font-medium",
                  isCorrect ? "text-green-600" : "text-red-600"
                )}>
                  {isCorrect ? "You got it! 🎉" : "Not quite! 🤔"}
                </div>

                <div className="bg-muted p-3 rounded text-sm">
                  <p className="font-medium mb-1">Explanation:</p>
                  <p className="text-muted-foreground">{game.explanation}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    New Game
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
