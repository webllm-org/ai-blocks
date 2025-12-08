"use client"

import { useState } from "react"
import { generateSpeech, generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Volume2, RotateCcw } from "lucide-react"
import { useRef } from "react"

const ACCENTS = [
  { id: "us", label: "US English" },
  { id: "uk", label: "UK English" },
  { id: "au", label: "Australian English" },
]

export interface PronunciationGuideDemoProps {
  /** Default word to pronounce */
  defaultWord?: string
}

export function PronunciationGuideDemo({
  defaultWord = "entrepreneur",
}: PronunciationGuideDemoProps = {}) {
  const [word, setWord] = useState(defaultWord)
  const [accent, setAccent] = useState("us")
  const [phonetic, setPhonetic] = useState<string | null>(null)
  const [simplified, setSimplified] = useState<string | null>(null)
  const [similarWords, setSimilarWords] = useState<string[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleGenerate = async () => {
    if (!word.trim()) return
    setIsLoading(true)
    setAudioUrl(null)

    try {
      // Get phonetic info
      const phoneticResult = await generateText({
        prompt: `For the word "${word.trim()}", provide:
1. IPA phonetic spelling
2. Simple phonetic spelling that anyone can read
3. 3 similar sounding words

Respond as JSON: { "ipa": "...", "simple": "...", "similar": ["word1", "word2", "word3"] }`,
        maxTokens: 150,
      })

      try {
        const parsed = JSON.parse(phoneticResult.text)
        setPhonetic(parsed.ipa)
        setSimplified(parsed.simple)
        setSimilarWords(parsed.similar || [])
      } catch {
        setPhonetic(null)
        setSimplified(null)
        setSimilarWords([])
      }

      // Generate pronunciation audio
      const accentVoice = accent === "uk" ? "nova" : accent === "au" ? "nova" : "alloy"
      const audioResult = await generateSpeech({
        text: word.trim(),
        voice: accentVoice,
        model: "gpt-4o-mini-tts",
      })

      if (audioResult.audio) {
        const blob = new Blob([audioResult.audio], { type: "audio/mpeg" })
        setAudioUrl(URL.createObjectURL(blob))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.playbackRate = 1
      audioRef.current.play()
    }
  }

  const playSlower = () => {
    if (audioRef.current) {
      audioRef.current.playbackRate = 0.7
      audioRef.current.play()
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Word or Name</Label>
          <Input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word or name"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Accent</Label>
          <Select value={accent} onValueChange={setAccent}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCENTS.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.label}
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
            Generating...
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-2" />
            Get Pronunciation
          </>
        )}
      </Button>

      {audioUrl && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <audio ref={audioRef} src={audioUrl} />

            <div className="flex gap-2">
              <Button onClick={playAudio} className="flex-1">
                <Volume2 className="h-4 w-4 mr-1" />
                Play
              </Button>
              <Button onClick={playSlower} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-1" />
                Slower
              </Button>
            </div>

            {phonetic && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">IPA</p>
                <p className="text-lg font-mono">{phonetic}</p>
              </div>
            )}

            {simplified && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Simplified</p>
                <p className="text-lg">{simplified}</p>
              </div>
            )}

            {similarWords.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Similar Sounding Words</p>
                <div className="flex flex-wrap gap-1">
                  {similarWords.map((w, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-muted rounded text-sm cursor-pointer hover:bg-muted/80"
                      onClick={() => setWord(w)}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
