"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCw, Share2, Save, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const THEMES = [
  { id: "professional", label: "Professional" },
  { id: "philosophical", label: "Philosophical" },
  { id: "silly", label: "Silly" },
  { id: "pop-culture", label: "Pop Culture" },
  { id: "tech", label: "Tech" },
  { id: "food", label: "Food" },
]

interface Dilemma {
  optionA: string
  optionB: string
  percentageA?: number
}

export interface WouldYouRatherDemoProps {
  /** Default theme */
  defaultTheme?: string
}

export function WouldYouRatherDemo({
  defaultTheme = "silly",
}: WouldYouRatherDemoProps = {}) {
  const [theme, setTheme] = useState(defaultTheme)
  const [currentDilemma, setCurrentDilemma] = useState<Dilemma | null>(null)
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null)
  const [savedDilemmas, setSavedDilemmas] = useState<Dilemma[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkDilemmas, setBulkDilemmas] = useState<Dilemma[]>([])

  const generateDilemma = async () => {
    setIsLoading(true)
    setSelectedOption(null)

    const themeName = THEMES.find(t => t.id === theme)?.label

    try {
      const result = await generateText({
        prompt: `Generate a creative "Would You Rather" question with a ${themeName} theme.

Make it thought-provoking and fun. Both options should be interesting and make people think.

Format as JSON:
{
  "optionA": "first option",
  "optionB": "second option"
}`,
        maxTokens: 150,
      })

      const parsed = JSON.parse(result.text)
      setCurrentDilemma(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = async (option: "A" | "B") => {
    setSelectedOption(option)

    // Simulate "what others chose" (random for demo)
    const percentageA = Math.floor(Math.random() * 60) + 20
    setCurrentDilemma(prev => prev ? { ...prev, percentageA } : null)
  }

  const handleSave = () => {
    if (currentDilemma) {
      setSavedDilemmas(prev => [...prev, currentDilemma])
    }
  }

  const generateBulk = async () => {
    setIsLoading(true)
    setBulkMode(true)
    setBulkDilemmas([])

    const themeName = THEMES.find(t => t.id === theme)?.label

    try {
      const result = await generateText({
        prompt: `Generate 5 creative "Would You Rather" questions with a ${themeName} theme for a party game.

Make them fun, varied, and conversation-starting.

Format as JSON array:
[
  {"optionA": "...", "optionB": "..."},
  ...
]`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(result.text)
      if (Array.isArray(parsed)) {
        setBulkDilemmas(parsed)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-sm mb-2 block">Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="self-end">
          <Button variant="outline" onClick={() => setBulkMode(!bulkMode)}>
            {bulkMode ? "Single" : "Party Mode"}
          </Button>
        </div>
      </div>

      {!bulkMode ? (
        <>
          {currentDilemma ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-center font-medium text-lg">Would you rather...</h3>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-auto py-4 text-left",
                      selectedOption === "A" && "border-primary bg-primary/10"
                    )}
                    onClick={() => handleSelect("A")}
                    disabled={selectedOption !== null}
                  >
                    <span className="text-wrap">{currentDilemma.optionA}</span>
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">OR</div>

                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-auto py-4 text-left",
                      selectedOption === "B" && "border-primary bg-primary/10"
                    )}
                    onClick={() => handleSelect("B")}
                    disabled={selectedOption !== null}
                  >
                    <span className="text-wrap">{currentDilemma.optionB}</span>
                  </Button>
                </div>

                {selectedOption && currentDilemma.percentageA !== undefined && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Others chose:</p>
                    <div className="flex gap-2 text-sm">
                      <div className="flex-1 text-right">
                        <span className={cn(selectedOption === "A" ? "font-bold" : "")}>
                          {currentDilemma.percentageA}%
                        </span>
                      </div>
                      <div className="w-px bg-border" />
                      <div className="flex-1 text-left">
                        <span className={cn(selectedOption === "B" ? "font-bold" : "")}>
                          {100 - currentDilemma.percentageA}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Generate a dilemma to get started!
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={generateDilemma} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {currentDilemma ? "Next" : "Generate"}
                </>
              )}
            </Button>
            {currentDilemma && (
              <>
                <Button variant="outline" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {bulkDilemmas.length > 0 ? (
            <div className="space-y-3">
              {bulkDilemmas.map((d, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <p className="font-medium text-sm mb-2">#{i + 1}</p>
                    <p className="text-sm">
                      <span className="text-primary">A:</span> {d.optionA}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="text-primary">B:</span> {d.optionB}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Generate 5 dilemmas for party mode!
                </p>
              </CardContent>
            </Card>
          )}

          <Button onClick={generateBulk} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>Generate 5 Dilemmas</>
            )}
          </Button>
        </>
      )}

      {savedDilemmas.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {savedDilemmas.length} saved for later
        </div>
      )}
    </div>
  )
}
