"use client"

import { useState, useRef } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Play,
  Square,
  Loader2,
  Volume2,
  Radio,
  BookOpen,
  Newspaper,
  Megaphone,
  GraduationCap,
  Sparkles
} from "lucide-react"

const DEFAULT_TEXT = `Scientists have discovered a new species of deep-sea fish that produces its own light through bioluminescence. The fish, found at depths of over 3,000 meters, uses an array of photophores along its body to communicate with others and attract prey in the pitch-black environment.`

interface CharacterVoice {
  id: string
  name: string
  icon: typeof Radio
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | "ash" | "coral" | "sage" | "ballad" | "verse"
  instructions: string
  color: string
}

const CHARACTER_VOICES: CharacterVoice[] = [
  {
    id: "news-anchor",
    name: "News Anchor",
    icon: Newspaper,
    voice: "onyx",
    instructions: "You are a professional news anchor delivering a broadcast. Speak with authority, clarity, and measured pacing. Use the classic newsroom tone - serious but engaging. Pause appropriately between sentences for emphasis.",
    color: "bg-blue-500",
  },
  {
    id: "storyteller",
    name: "Storyteller",
    icon: BookOpen,
    voice: "fable",
    instructions: "You are a captivating storyteller by a warm fireplace. Speak with wonder and emotion. Vary your pace - slow down for dramatic moments, speed up for excitement. Add warmth and intimacy to your voice as if sharing a treasured tale.",
    color: "bg-amber-500",
  },
  {
    id: "sports-commentator",
    name: "Sports Commentator",
    icon: Megaphone,
    voice: "echo",
    instructions: "You are an energetic sports commentator. Speak with excitement and enthusiasm! Build tension and energy. React to the content as if it's an exciting play. Use dynamic pacing - quick bursts of excitement followed by brief pauses.",
    color: "bg-green-500",
  },
  {
    id: "professor",
    name: "Professor",
    icon: GraduationCap,
    voice: "sage",
    instructions: "You are a distinguished university professor giving a lecture. Speak thoughtfully and clearly, with intellectual gravitas. Emphasize key terms and concepts. Use a measured, academic tone that conveys deep knowledge and passion for the subject.",
    color: "bg-purple-500",
  },
  {
    id: "dramatic-narrator",
    name: "Movie Narrator",
    icon: Sparkles,
    voice: "ballad",
    instructions: "You are a dramatic movie trailer narrator. Speak with intense gravitas and cinematic flair. Use dramatic pauses. Lower your voice for mystery, raise it for impact. Make everything sound epic and momentous.",
    color: "bg-red-500",
  },
]

export interface CharacterVoicesDemoProps {
  /** Default text to read */
  defaultText?: string
  /** Default character voice ID */
  defaultVoice?: string
}

export function CharacterVoicesDemo({
  defaultText = DEFAULT_TEXT,
  defaultVoice = "news-anchor",
}: CharacterVoicesDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [selectedVoice, setSelectedVoice] = useState(defaultVoice)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<WebLLMClient | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (!clientRef.current) {
    clientRef.current = new WebLLMClient()
  }

  const currentCharacter = CHARACTER_VOICES.find(v => v.id === selectedVoice) || CHARACTER_VOICES[0]

  const generateAudio = async () => {
    if (!text.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const result = await clientRef.current!.generateSpeech({
        text: text,
        voice: currentCharacter.voice,
        speed: 1.0,
        model: "gpt-4o-mini-tts",
        instructions: currentCharacter.instructions,
      })

      const blob = new Blob([result.audio.audioData], { type: result.audio.mimeType })
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate audio")
    } finally {
      setIsGenerating(false)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              <CardTitle className="text-lg">Character Voices</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <Volume2 className="h-3 w-3" />
              {currentCharacter.name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Hear your content in different character voices
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Selection */}
          <div className="grid grid-cols-5 gap-2">
            {CHARACTER_VOICES.map((voice) => {
              const Icon = voice.icon
              const isSelected = selectedVoice === voice.id
              return (
                <Button
                  key={voice.id}
                  variant={isSelected ? "default" : "outline"}
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setSelectedVoice(voice.id)}
                  disabled={isGenerating}
                >
                  <div className={`p-1.5 rounded-full ${isSelected ? "bg-background/20" : voice.color + "/10"}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? "" : voice.color.replace("bg-", "text-")}`} />
                  </div>
                  <span className="text-[10px] leading-tight">{voice.name}</span>
                </Button>
              )
            })}
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to read..."
            className="min-h-[120px] resize-none"
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

          <div className="flex items-center justify-center gap-2">
            {!isPlaying ? (
              <Button
                onClick={generateAudio}
                disabled={isGenerating || !text.trim()}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play as {currentCharacter.name}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={stopAudio}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Powered by gpt-4o-mini-tts with voice instructions
      </p>
    </div>
  )
}
