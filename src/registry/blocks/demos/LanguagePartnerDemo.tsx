"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Languages, ArrowRight, BookOpen, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const LANGUAGES = [
  { id: "spanish", label: "Spanish", flag: "🇪🇸" },
  { id: "french", label: "French", flag: "🇫🇷" },
  { id: "german", label: "German", flag: "🇩🇪" },
  { id: "italian", label: "Italian", flag: "🇮🇹" },
  { id: "japanese", label: "Japanese", flag: "🇯🇵" },
  { id: "mandarin", label: "Mandarin", flag: "🇨🇳" },
]

const PROFICIENCY = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
]

const SCENARIOS = [
  { id: "cafe", label: "Ordering at a café" },
  { id: "directions", label: "Asking for directions" },
  { id: "shopping", label: "Shopping" },
  { id: "interview", label: "Job interview" },
  { id: "casual", label: "Casual chat" },
]

interface Message {
  role: "user" | "partner"
  content: string
  correction?: string
  translation?: string
}

interface VocabWord {
  word: string
  translation: string
}

export interface LanguagePartnerDemoProps {
  /** Default language */
  defaultLanguage?: string
}

export function LanguagePartnerDemo({
  defaultLanguage = "spanish",
}: LanguagePartnerDemoProps = {}) {
  const [language, setLanguage] = useState(defaultLanguage)
  const [proficiency, setProficiency] = useState("beginner")
  const [scenario, setScenario] = useState("cafe")
  const [messages, setMessages] = useState<Message[]>([])
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [showTranslation, setShowTranslation] = useState<number | null>(null)

  const handleStart = async () => {
    setIsLoading(true)
    setStarted(true)
    setMessages([])
    setVocabulary([])

    const lang = LANGUAGES.find(l => l.id === language)
    const scen = SCENARIOS.find(s => s.id === scenario)

    try {
      const result = await generateText({
        prompt: `You are a friendly ${lang?.label} conversation partner. The learner is at ${proficiency} level and wants to practice: "${scen?.label}".

Start a conversation in ${lang?.label} appropriate for their level. Use simple vocabulary for beginners.

Format:
TEXT: [Your message in ${lang?.label}]
TRANSLATION: [English translation]
VOCAB: word1|translation1, word2|translation2 (2-3 key new words)`,
        maxTokens: 200,
      })

      const textMatch = result.text.match(/TEXT:\s*([\s\S]*?)(?=TRANSLATION:|$)/)
      const transMatch = result.text.match(/TRANSLATION:\s*([\s\S]*?)(?=VOCAB:|$)/)
      const vocabMatch = result.text.match(/VOCAB:\s*([\s\S]*)/)

      const vocabItems = vocabMatch?.[1]?.split(",").map(v => {
        const [word, trans] = v.split("|").map(s => s.trim())
        return { word, translation: trans }
      }).filter(v => v.word && v.translation) || []

      setMessages([{
        role: "partner",
        content: textMatch?.[1]?.trim() || result.text,
        translation: transMatch?.[1]?.trim(),
      }])
      setVocabulary(vocabItems)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!input.trim()) return
    setIsLoading(true)

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    const lang = LANGUAGES.find(l => l.id === language)

    try {
      const result = await generateText({
        prompt: `You are a ${lang?.label} conversation partner. Level: ${proficiency}. Scenario: ${scenario}.

Conversation:
${messages.map(m => `${m.role === "partner" ? "You" : "Learner"}: ${m.content}`).join("\n")}

Learner: ${input.trim()}

1. If they made any mistakes, gently correct them
2. Continue the conversation naturally in ${lang?.label}
3. Use vocabulary appropriate for ${proficiency} level

Format:
CORRECTION: [gentle correction if needed, or "none"]
TEXT: [Your response in ${lang?.label}]
TRANSLATION: [English translation]
VOCAB: word1|translation1, word2|translation2`,
        maxTokens: 250,
      })

      const corrMatch = result.text.match(/CORRECTION:\s*([\s\S]*?)(?=TEXT:|$)/)
      const textMatch = result.text.match(/TEXT:\s*([\s\S]*?)(?=TRANSLATION:|$)/)
      const transMatch = result.text.match(/TRANSLATION:\s*([\s\S]*?)(?=VOCAB:|$)/)
      const vocabMatch = result.text.match(/VOCAB:\s*([\s\S]*)/)

      const correction = corrMatch?.[1]?.trim()
      if (correction && correction.toLowerCase() !== "none") {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...userMessage, correction }
          return updated
        })
      }

      const newVocab = vocabMatch?.[1]?.split(",").map(v => {
        const [word, trans] = v.split("|").map(s => s.trim())
        return { word, translation: trans }
      }).filter(v => v.word && v.translation) || []

      setVocabulary(prev => [...prev, ...newVocab].slice(-10))

      setMessages(prev => [...prev, {
        role: "partner",
        content: textMatch?.[1]?.trim() || result.text,
        translation: transMatch?.[1]?.trim(),
      }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExplain = async () => {
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Explain the last exchange in simple English for a ${proficiency} learner of ${language}. Break down any grammar or vocabulary that might be confusing.`,
        maxTokens: 200,
      })

      setMessages(prev => [...prev, {
        role: "partner",
        content: `📚 ${result.text}`,
      }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!started) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardContent className="p-6 text-center">
            <Languages className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <h3 className="font-medium mb-2">Language Conversation Partner</h3>
            <p className="text-sm text-muted-foreground">
              Practice conversations with gentle corrections and vocabulary building.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.flag} {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Level</Label>
            <Select value={proficiency} onValueChange={setProficiency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Scenario</Label>
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCENARIOS.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleStart} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Languages className="h-4 w-4 mr-2" />
              Start Conversation
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between text-sm">
        <span>{LANGUAGES.find(l => l.id === language)?.flag} {language}</span>
        <Badge variant="secondary">{proficiency}</Badge>
      </div>

      <Card>
        <CardContent className="p-4 max-h-[300px] overflow-y-auto space-y-3">
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={cn(
                  "p-3 rounded-lg text-sm",
                  msg.role === "partner"
                    ? "bg-muted mr-8"
                    : "bg-primary text-primary-foreground ml-8"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.translation && (
                  <button
                    className="text-xs text-muted-foreground mt-1 hover:underline"
                    onClick={() => setShowTranslation(showTranslation === i ? null : i)}
                  >
                    {showTranslation === i ? msg.translation : "Show translation"}
                  </button>
                )}
              </div>
              {msg.correction && (
                <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 ml-8">
                  💡 {msg.correction}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>

      {vocabulary.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground">Vocab:</span>
          {vocabulary.map((v, i) => (
            <Badge key={i} variant="outline" className="text-xs" title={v.translation}>
              {v.word}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Reply in ${language}...`}
          className="min-h-[60px]"
        />
        <Button onClick={handleRespond} disabled={isLoading || !input.trim()} className="self-end">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Button variant="outline" onClick={handleExplain} disabled={isLoading} className="w-full">
        <HelpCircle className="h-4 w-4 mr-1" />
        Explain in English
      </Button>
    </div>
  )
}
