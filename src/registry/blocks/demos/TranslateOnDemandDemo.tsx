"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Languages, ArrowRight } from "lucide-react"

const LANGUAGES = [
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
] as const

const SAMPLE_TEXT = `Welcome to our website! We're excited to share our latest collection of handcrafted jewelry. Each piece is made with love and attention to detail. Browse our catalog and find something special for yourself or a loved one.`

export function TranslateOnDemandDemo() {
  const [text, setText] = useState(SAMPLE_TEXT)
  const [targetLang, setTargetLang] = useState<string>("es")
  const [translated, setTranslated] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTranslate = async () => {
    if (!text.trim()) return
    setIsLoading(true)
    setTranslated("")

    const lang = LANGUAGES.find(l => l.code === targetLang)

    try {
      const result = await generateText({
        prompt: `Translate the following text to ${lang?.name}. Provide only the translation, no explanations.

Text to translate:
${text}

${lang?.name} translation:`,
        temperature: 0.3,
        maxTokens: 500,
      })
      setTranslated(result.text.trim())
    } catch (error) {
      setTranslated(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedLang = LANGUAGES.find(l => l.code === targetLang)

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to translate..."
        rows={4}
      />

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Translate to:</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.code}
              variant={targetLang === lang.code ? "default" : "outline"}
              size="sm"
              onClick={() => setTargetLang(lang.code)}
            >
              <span className="mr-1">{lang.flag}</span>
              {lang.name}
            </Button>
          ))}
        </div>
      </div>

      <Button onClick={handleTranslate} disabled={isLoading || !text.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Translating...
          </>
        ) : (
          <>
            <Languages className="h-4 w-4 mr-2" />
            Translate to {selectedLang?.name}
          </>
        )}
      </Button>

      {translated && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <span>🇺🇸 English</span>
              <ArrowRight className="h-4 w-4" />
              <span>{selectedLang?.flag} {selectedLang?.name}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{translated}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
