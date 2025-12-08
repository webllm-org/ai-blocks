"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Music, Copy, Check, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface RhymeResult {
  rhymes: { word: string; type: string; syllables: number }[]
  nearRhymes: string[]
  exampleLine: string
}

const RHYME_TYPES = [
  { id: "all", label: "All rhymes" },
  { id: "perfect", label: "Perfect rhymes" },
  { id: "near", label: "Near/slant rhymes" },
  { id: "multi", label: "Multi-syllable" },
]

export interface RhymeHelperDemoProps {
  /** Default word to rhyme */
  defaultWord?: string
}

export function RhymeHelperDemo({
  defaultWord = "love",
}: RhymeHelperDemoProps = {}) {
  const [word, setWord] = useState(defaultWord)
  const [rhymeType, setRhymeType] = useState("all")
  const [result, setResult] = useState<RhymeResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedWord, setCopiedWord] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!word.trim()) return
    setIsLoading(true)
    setResult(null)

    try {
      const response = await generateText({
        prompt: `Find rhymes for the word "${word}".

Rhyme type preference: ${RHYME_TYPES.find(t => t.id === rhymeType)?.label}

Return as JSON:
{
  "rhymes": [
    {"word": "rhyme word", "type": "perfect|near|multi", "syllables": 1}
  ],
  "nearRhymes": ["words that almost rhyme but not perfectly"],
  "exampleLine": "A creative example line using one of the rhymes"
}

Provide 10-15 rhymes, sorted by how well they rhyme.
Include a mix of common and creative options.
${rhymeType === "multi" ? "Focus on multi-syllable rhymes." : ""}
${rhymeType === "near" ? "Include more slant/near rhymes for creative writing." : ""}`,
        maxTokens: 400,
      })

      const parsed = JSON.parse(response.text)
      setResult(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (wordToCopy: string) => {
    await navigator.clipboard.writeText(wordToCopy)
    setCopiedWord(wordToCopy)
    setTimeout(() => setCopiedWord(null), 2000)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "perfect":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "near":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "multi":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Word to rhyme</Label>
          <Input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word..."
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Rhyme type</Label>
          <Select value={rhymeType} onValueChange={setRhymeType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RHYME_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !word.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Finding rhymes...
          </>
        ) : (
          <>
            <Music className="h-4 w-4 mr-2" />
            Find Rhymes
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Rhymes for "{word}"</h3>
              <Badge variant="outline">{result.rhymes.length} found</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {result.rhymes.map((rhyme, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className={cn(
                    "cursor-pointer hover:opacity-80 transition-opacity px-3 py-1",
                    getTypeColor(rhyme.type)
                  )}
                  onClick={() => handleCopy(rhyme.word)}
                >
                  {rhyme.word}
                  {copiedWord === rhyme.word ? (
                    <Check className="h-3 w-3 ml-1" />
                  ) : (
                    <span className="text-xs ml-1 opacity-50">
                      {rhyme.syllables}
                    </span>
                  )}
                </Badge>
              ))}
            </div>

            {result.nearRhymes.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Near/slant rhymes:</p>
                <div className="flex flex-wrap gap-2">
                  {result.nearRhymes.map((nearRhyme, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => handleCopy(nearRhyme)}
                    >
                      {nearRhyme}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-primary/5 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Example line:</p>
              <p className="text-sm italic">"{result.exampleLine}"</p>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Click any word to copy</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                className="h-6 px-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
