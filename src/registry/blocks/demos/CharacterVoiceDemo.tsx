"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Wand2, Copy, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"

const CHARACTERS = [
  { id: "shakespeare", label: "Shakespeare", emoji: "🎭", style: "Elizabethan English, poetic, dramatic" },
  { id: "yoda", label: "Yoda", emoji: "👽", style: "inverted sentence structure, wise, cryptic" },
  { id: "lawyer", label: "Corporate Lawyer", emoji: "⚖️", style: "formal legalese, precise, verbose" },
  { id: "valley-girl", label: "Valley Girl", emoji: "💅", style: "casual, like totally, uptalk" },
  { id: "noir", label: "1940s Noir Detective", emoji: "🕵️", style: "hard-boiled, metaphors, cynical" },
  { id: "attenborough", label: "David Attenborough", emoji: "🦁", style: "nature documentary, measured, reverent" },
  { id: "pirate", label: "Pirate", emoji: "🏴‍☠️", style: "arr matey, nautical terms, boisterous" },
  { id: "robot", label: "Formal Robot", emoji: "🤖", style: "precise, logical, emotionless" },
]

export interface CharacterVoiceWriterDemoProps {
  /** Default text to transform */
  defaultText?: string
}

export function CharacterVoiceDemo({
  defaultText = "I'm really excited to announce that our new product is launching next week. We've worked incredibly hard on this, and I think you're going to love it.",
}: CharacterVoiceWriterDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [selectedCharacter, setSelectedCharacter] = useState("shakespeare")
  const [intensity, setIntensity] = useState([50])
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const getIntensityLabel = () => {
    const val = intensity[0]
    if (val < 33) return "Subtle"
    if (val < 66) return "Moderate"
    return "Full Character"
  }

  const handleTransform = async () => {
    if (!text.trim()) return
    setIsLoading(true)
    setResult("")

    const character = CHARACTERS.find(c => c.id === selectedCharacter)
    const intensityLevel = intensity[0] < 33
      ? "subtle hints of"
      : intensity[0] < 66
      ? "moderate use of"
      : "fully committed"

    try {
      const response = await generateText({
        prompt: `Rewrite this text in the voice/style of ${character?.label} (${character?.style}).

Intensity: ${intensityLevel} the character's style.

Original text:
"${text.trim()}"

Rewrite it while keeping the same meaning, but in the character's distinctive voice. ${intensity[0] >= 66 ? "Go all in on the character's quirks and speech patterns." : "Keep it readable while adding the character's flavor."}`,
        maxTokens: 400,
      })

      setResult(response.text)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Original Text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to transform..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Character Voice</Label>
          <div className="grid grid-cols-4 gap-2">
            {CHARACTERS.map((char) => (
              <Button
                key={char.id}
                variant={selectedCharacter === char.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCharacter(char.id)}
                className="flex flex-col h-auto py-2"
              >
                <span className="text-lg">{char.emoji}</span>
                <span className="text-xs">{char.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">
            Intensity: <span className="font-medium">{getIntensityLabel()}</span>
          </Label>
          <Slider
            value={intensity}
            onValueChange={setIntensity}
            min={0}
            max={100}
            step={1}
          />
        </div>
      </div>

      <Button
        onClick={handleTransform}
        disabled={isLoading || !text.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Transforming...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 mr-2" />
            Transform Text
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {CHARACTERS.find(c => c.id === selectedCharacter)?.emoji}
                </span>
                <span className="text-sm font-medium">
                  {CHARACTERS.find(c => c.id === selectedCharacter)?.label}
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{result}</p>
            </div>

            <div className="mt-4 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setText(result)}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Use as input (transform again)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="text-xs text-muted-foreground text-center">
          Compare: original ({text.length} chars) → transformed ({result.length} chars)
        </div>
      )}
    </div>
  )
}
