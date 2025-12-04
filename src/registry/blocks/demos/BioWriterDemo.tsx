"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Copy, Check, RefreshCw } from "lucide-react"

export interface BioTone {
  id: string
  label: string
  icon: string
}

export interface BioLength {
  id: string
  label: string
  chars: string
}

const DEFAULT_TONES: BioTone[] = [
  { id: "professional", label: "Professional", icon: "💼" },
  { id: "casual", label: "Casual", icon: "😊" },
  { id: "creative", label: "Creative", icon: "🎨" },
  { id: "minimal", label: "Minimal", icon: "✨" },
]

const DEFAULT_LENGTHS: BioLength[] = [
  { id: "short", label: "Short", chars: "~50 chars" },
  { id: "medium", label: "Medium", chars: "~150 chars" },
  { id: "long", label: "Long", chars: "~300 chars" },
]

const DEFAULT_NAME = "Alex Chen"
const DEFAULT_DETAILS = "Software engineer, 5 years experience, loves hiking and photography, works at a startup, based in San Francisco"

export interface BioWriterDemoProps {
  /** List of tones to choose from */
  tones?: BioTone[]
  /** List of length options */
  lengths?: BioLength[]
  /** Initial name */
  defaultName?: string
  /** Initial details */
  defaultDetails?: string
  /** Initial tone ID */
  defaultToneId?: string
  /** Initial length ID */
  defaultLengthId?: string
  /** Placeholder for name input */
  namePlaceholder?: string
  /** Placeholder for details textarea */
  detailsPlaceholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function BioWriterDemo({
  tones = DEFAULT_TONES,
  lengths = DEFAULT_LENGTHS,
  defaultName = DEFAULT_NAME,
  defaultDetails = DEFAULT_DETAILS,
  defaultToneId = "professional",
  defaultLengthId = "medium",
  namePlaceholder = "Name (optional)",
  detailsPlaceholder = "Key details: job, experience, interests, location...",
  temperature = 0.8,
  maxTokens = 200,
}: BioWriterDemoProps = {}) {
  const [name, setName] = useState(defaultName)
  const [details, setDetails] = useState(defaultDetails)
  const [tone, setTone] = useState<string>(defaultToneId)
  const [length, setLength] = useState<string>(defaultLengthId)
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!details.trim()) return
    setIsLoading(true)
    setBio("")

    const lengthInstructions = {
      short: "about 50 characters, very concise",
      medium: "about 100-150 characters",
      long: "about 250-300 characters, detailed"
    }

    try {
      const result = await generateText({
        prompt: `Write a ${tone} bio for ${name || "this person"} based on these details:
${details}

The bio should be ${lengthInstructions[length as keyof typeof lengthInstructions]}.
Write in third person. Don't use hashtags or emojis unless the tone is casual/creative.

Bio:`,
        temperature,
        maxTokens,
      })
      setBio(result.text.trim())
    } catch (error) {
      setBio(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(bio)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={namePlaceholder}
      />

      <Textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder={detailsPlaceholder}
        rows={3}
      />

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Tone</p>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <Button
                key={t.id}
                variant={tone === t.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTone(t.id)}
              >
                <span className="mr-1">{t.icon}</span>
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Length</p>
          <div className="flex flex-wrap gap-2">
            {lengths.map((l) => (
              <Button
                key={l.id}
                variant={length === l.id ? "default" : "outline"}
                size="sm"
                onClick={() => setLength(l.id)}
              >
                {l.label}
                <Badge variant="secondary" className="ml-1 text-xs">{l.chars}</Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={isLoading || !details.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Writing...
          </>
        ) : bio ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Bio
          </>
        ) : (
          <>
            <User className="h-4 w-4 mr-2" />
            Generate Bio
          </>
        )}
      </Button>

      {bio && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm">{bio}</p>
              <Button variant="ghost" size="icon" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{bio.length} characters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
