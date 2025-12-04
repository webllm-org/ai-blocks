"use client"

import { useState, useRef } from "react"
import { generateSpeech } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Play, Square, Loader2, Users, MessageSquare, Pause } from "lucide-react"

interface DialogueLine {
  speaker: string
  text: string
}

interface VoiceConfig {
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | "ash" | "coral" | "sage" | "ballad" | "verse"
  instructions: string
}

const DEFAULT_DIALOGUE = `NARRATOR: The two colleagues met at the coffee machine, both reaching for the last cup.

ALEX: Oh, sorry! You go ahead. I've already had three cups today anyway.

MAYA: No, no, please. I was just about to make a fresh pot. Besides, you look like you need it more than me.

ALEX: That obvious, huh? Yeah, this deadline is killing me. Haven't slept properly in days.

MAYA: The Henderson project? I heard about that. Actually, I might be able to help. I finished early on my end.

ALEX: Really? That would be amazing! I've been trying to figure out the data visualization part and...

MAYA: Say no more. That's literally my specialty. Let's grab a meeting room and I'll show you some tricks.

NARRATOR: And with that, a great collaboration was born - all because of a single cup of coffee.`

const VOICE_MAPPING: Record<string, VoiceConfig> = {
  NARRATOR: {
    voice: "onyx",
    instructions: "You are a calm, professional narrator. Speak with a smooth, measured tone. Set the scene clearly without being dramatic.",
  },
  ALEX: {
    voice: "echo",
    instructions: "You are Alex, a friendly but tired professional. Speak with warmth but also show signs of fatigue. Be genuine and appreciative.",
  },
  MAYA: {
    voice: "nova",
    instructions: "You are Maya, a helpful and confident colleague. Speak with enthusiasm and warmth. Be supportive and energetic.",
  },
  DEFAULT: {
    voice: "alloy",
    instructions: "Speak naturally and conversationally.",
  },
}

function parseDialogue(text: string): DialogueLine[] {
  const lines: DialogueLine[] = []
  const regex = /^([A-Z][A-Z0-9_\s]+):\s*(.+)$/gm
  let match

  while ((match = regex.exec(text)) !== null) {
    const speaker = match[1].trim()
    const dialogue = match[2].trim()
    if (dialogue) {
      lines.push({ speaker, text: dialogue })
    }
  }

  return lines
}

export interface MultiVoiceDialogueDemoProps {
  /** Default dialogue script */
  defaultDialogue?: string
}

export function MultiVoiceDialogueDemo({
  defaultDialogue = DEFAULT_DIALOGUE,
}: MultiVoiceDialogueDemoProps = {}) {
  const [dialogue, setDialogue] = useState(defaultDialogue)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioQueue, setAudioQueue] = useState<string[]>([])
  const [parsedLines, setParsedLines] = useState<DialogueLine[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playingRef = useRef(false)

  const generateDialogueAudio = async () => {
    const lines = parseDialogue(dialogue)
    if (lines.length === 0) {
      setError("No dialogue found. Use format: SPEAKER: dialogue text")
      return
    }

    setIsGenerating(true)
    setError(null)
    setParsedLines(lines)
    setAudioQueue([])
    setCurrentLineIndex(0)

    try {
      const audioUrls: string[] = []

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const voiceConfig = VOICE_MAPPING[line.speaker] || VOICE_MAPPING.DEFAULT

        const result = await generateSpeech({
          text: line.text,
          voice: voiceConfig.voice,
          speed: 1.0,
          model: "gpt-4o-mini-tts",
          instructions: voiceConfig.instructions,
        })

        const blob = new Blob([result.audio.audioData], { type: result.audio.mimeType })
        const url = URL.createObjectURL(blob)
        audioUrls.push(url)
      }

      setAudioQueue(audioUrls)
      setIsGenerating(false)

      // Start playing
      playingRef.current = true
      setIsPlaying(true)
      playAudioSequence(audioUrls, 0)
    } catch (err: any) {
      setError(err.message || "Failed to generate dialogue audio")
      setIsGenerating(false)
    }
  }

  const playAudioSequence = (urls: string[], index: number) => {
    if (!playingRef.current || index >= urls.length) {
      setIsPlaying(false)
      playingRef.current = false
      return
    }

    setCurrentLineIndex(index)

    if (audioRef.current) {
      audioRef.current.src = urls[index]
      audioRef.current.onended = () => {
        setTimeout(() => {
          playAudioSequence(urls, index + 1)
        }, 300) // Small pause between lines
      }
      audioRef.current.play()
    }
  }

  const stopAudio = () => {
    playingRef.current = false
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentLineIndex(0)
  }

  const togglePause = () => {
    if (audioRef.current) {
      if (isPaused) {
        audioRef.current.play()
        setIsPaused(false)
      } else {
        audioRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const uniqueSpeakers = [...new Set(parseDialogue(dialogue).map(l => l.speaker))]

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle className="text-lg">Multi-Voice Dialogue</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              {uniqueSpeakers.length} voices
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Each character gets their own unique voice
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={dialogue}
            onChange={(e) => setDialogue(e.target.value)}
            placeholder="SPEAKER: Their dialogue here..."
            className="min-h-[200px] resize-none font-mono text-sm"
          />

          <div className="text-xs text-muted-foreground">
            Format: <code className="bg-muted px-1 rounded">SPEAKER: dialogue text</code>
            <br />
            Known voices: NARRATOR, ALEX, MAYA (or any uppercase name)
          </div>

          {parsedLines.length > 0 && isPlaying && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="space-y-2">
                {parsedLines.map((line, index) => (
                  <div
                    key={index}
                    className={`text-sm transition-all ${
                      index === currentLineIndex
                        ? "text-foreground font-medium bg-primary/10 p-2 rounded"
                        : index < currentLineIndex
                        ? "text-muted-foreground/50"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">{line.speaker}:</span> {line.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <audio ref={audioRef} className="hidden" />

          <div className="flex items-center justify-center gap-2">
            {!isPlaying && !isGenerating && (
              <Button
                onClick={generateDialogueAudio}
                disabled={!dialogue.trim()}
                size="lg"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Generate & Play
              </Button>
            )}

            {isGenerating && (
              <Button disabled size="lg" className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating voices...
              </Button>
            )}

            {isPlaying && (
              <>
                <Button
                  onClick={togglePause}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  onClick={stopAudio}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {audioQueue.length > 0 && !isPlaying && !isGenerating && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  playingRef.current = true
                  setIsPlaying(true)
                  playAudioSequence(audioQueue, 0)
                }}
              >
                <Play className="h-3 w-3 mr-2" />
                Play Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Different voices for each character using gpt-4o-mini-tts
      </p>
    </div>
  )
}
