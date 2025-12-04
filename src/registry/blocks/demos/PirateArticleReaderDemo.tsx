"use client"

import { useState, useRef } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Play, Square, Loader2, Volume2, Skull, FastForward } from "lucide-react"

const DEFAULT_ARTICLE = `The ancient art of navigation has fascinated humanity for millennia. From the earliest Polynesian wayfinders who read the stars and ocean swells, to modern GPS systems, our need to find our way has driven remarkable innovation.

The compass, invented in China during the Han Dynasty, revolutionized sea travel. For the first time, sailors could determine direction regardless of weather or time of day. This simple magnetic device opened up vast oceanic trade routes.

Today, satellites orbit Earth providing precise positioning to billions of devices. Yet something magical remains about the old ways - reading currents, watching birds, feeling the wind. These skills remind us of our deep connection to the natural world.`

export interface PirateArticleReaderDemoProps {
  /** Default article text */
  defaultText?: string
  /** Default speech speed (0.25-4.0) */
  defaultSpeed?: number
  /** Voice to use */
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | "ash" | "coral" | "sage" | "ballad" | "verse"
}

export function PirateArticleReaderDemo({
  defaultText = DEFAULT_ARTICLE,
  defaultSpeed = 1.0,
  voice = "onyx",
}: PirateArticleReaderDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [speed, setSpeed] = useState(defaultSpeed)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<WebLLMClient | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (!clientRef.current) {
    clientRef.current = new WebLLMClient()
  }

  const pirateInstructions = `You are a salty old sea captain narrating tales. Speak with a hearty pirate accent - add "arr", "matey", "ye", "be", and nautical expressions naturally. Roll your R's, be dramatic and theatrical. Sound like you've spent years on the high seas.`

  const generatePirateAudio = async () => {
    if (!text.trim()) return

    setIsGenerating(true)
    setError(null)
    setAudioUrl(null)

    try {
      const result = await clientRef.current!.generateSpeech({
        text: text,
        voice: voice,
        speed: speed,
        model: "gpt-4o-mini-tts",
        instructions: pirateInstructions,
      })

      const blob = new Blob([result.audio.audioData], { type: result.audio.mimeType })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      // Auto-play
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate pirate audio")
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

  const handleAudioEnd = () => {
    setIsPlaying(false)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skull className="h-5 w-5" />
              <CardTitle className="text-lg">Pirate Article Reader</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <Volume2 className="h-3 w-3" />
              AI Voice
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Listen to any article narrated by a salty sea captain! Arr!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste article text here..."
            className="min-h-[150px] resize-none"
          />

          {/* Speed Control */}
          <div className="flex items-center gap-4">
            <FastForward className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
              min={0.5}
              max={1.5}
              step={0.1}
              className="flex-1"
            />
            <Badge variant="secondary">{speed}x</Badge>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Audio element (hidden) */}
          <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {!isPlaying ? (
              <Button
                onClick={generatePirateAudio}
                disabled={isGenerating || !text.trim()}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Summoning the captain...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Read Like a Pirate
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

          {audioUrl && !isPlaying && !isGenerating && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.play()
                    setIsPlaying(true)
                  }
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
        Powered by gpt-4o-mini-tts with voice instructions
      </p>
    </div>
  )
}
