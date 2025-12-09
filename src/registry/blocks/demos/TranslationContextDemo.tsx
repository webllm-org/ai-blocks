"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Languages, Copy, Check, Info } from "lucide-react"

interface TranslationResult {
  translation: string
  alternatives?: { text: string; context: string }[]
  culturalNotes?: string[]
  formalityLevel: string
}

const LANGUAGES = [
  { id: "es", label: "Spanish" },
  { id: "fr", label: "French" },
  { id: "de", label: "German" },
  { id: "it", label: "Italian" },
  { id: "pt", label: "Portuguese" },
  { id: "ja", label: "Japanese" },
  { id: "ko", label: "Korean" },
  { id: "zh", label: "Chinese (Simplified)" },
  { id: "ar", label: "Arabic" },
  { id: "hi", label: "Hindi" },
]

export interface TranslationContextDemoProps {
  /** Default text to translate */
  defaultText?: string
}

export function TranslationContextDemo({
  defaultText = "Let's circle back on this and touch base next week.",
}: TranslationContextDemoProps = {}) {
  const [inputText, setInputText] = useState(defaultText)
  const [targetLang, setTargetLang] = useState("es")
  const [context, setContext] = useState("business email")
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    setResult(null)

    const langInfo = LANGUAGES.find(l => l.id === targetLang)

    try {
      const response = await generateText({
        prompt: `Translate this text to ${langInfo?.label} with cultural context awareness:

Text: "${inputText}"
Context: ${context || "general"}
Target language: ${langInfo?.label}

Consider:
- Cultural appropriateness
- Idiomatic expressions
- Formality level for the context
- Any phrases that don't translate directly

Return as JSON:
{
  "translation": "The main translation",
  "alternatives": [
    {"text": "Alternative phrasing", "context": "When to use this version"}
  ],
  "culturalNotes": ["Any cultural considerations or differences"],
  "formalityLevel": "formal/informal/neutral"
}

Provide alternatives only if there are meaningful different ways to express this.`,
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

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.translation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Text to translate</Label>
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to translate..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm">Target language</Label>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Context (optional)</Label>
          <Input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., casual chat, legal document"
          />
        </div>
      </div>

      <Button
        onClick={handleTranslate}
        disabled={isLoading || !inputText.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Translating...
          </>
        ) : (
          <>
            <Languages className="h-4 w-4 mr-2" />
            Translate with Context
          </>
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge>{LANGUAGES.find(l => l.id === targetLang)?.label}</Badge>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{result.formalityLevel}</Badge>
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

            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-lg">{result.translation}</p>
            </div>

            {result.alternatives && result.alternatives.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Alternative phrasings:</p>
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="p-2 bg-muted rounded text-sm">
                    <p>{alt.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use when: {alt.context}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {result.culturalNotes && result.culturalNotes.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-1 mb-2">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">Cultural notes:</p>
                </div>
                <ul className="space-y-1">
                  {result.culturalNotes.map((note, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
