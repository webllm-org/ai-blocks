"use client"

import { useState, useRef } from "react"
import { generateSpeech } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, Play, Pause, BookOpen, SkipForward } from "lucide-react"

const NARRATOR_VOICES = [
  { id: "alloy", label: "Classic Narrator", description: "Warm, traditional audiobook voice" },
  { id: "echo", label: "Deep Voice", description: "Rich, resonant tone" },
  { id: "fable", label: "British Narrator", description: "Refined, storytelling voice" },
  { id: "onyx", label: "Dramatic", description: "Expressive, theatrical delivery" },
  { id: "nova", label: "Friendly", description: "Approachable, engaging tone" },
  { id: "shimmer", label: "Soft", description: "Gentle, soothing narration" },
]

export interface AudiobookPreviewDemoProps {
  /** Default text excerpt */
  defaultExcerpt?: string
  /** Default chapter title */
  defaultChapter?: string
}

export function AudiobookPreviewDemo({
  defaultExcerpt = "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions.",
  defaultChapter = "Chapter 1",
}: AudiobookPreviewDemoProps = {}) {
  const [excerpt, setExcerpt] = useState(defaultExcerpt)
  const [chapterTitle, setChapterTitle] = useState(defaultChapter)
  const [selectedVoice, setSelectedVoice] = useState("alloy")
  const [pacing, setPacing] = useState([50]) // 0 = slower, 100 = faster
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleGenerate = async () => {
    if (!excerpt.trim()) return
    setIsLoading(true)
    setAudioUrl(null)

    try {
      // Add chapter announcement if provided
      const fullText = chapterTitle
        ? `${chapterTitle}. ${excerpt.trim()}`
        : excerpt.trim()

      const result = await generateSpeech({
        text: fullText,
        voice: selectedVoice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
        model: "gpt-4o-mini-tts",
      })

      if (result.audio) {
        const blob = new Blob([result.audio], { type: "audio/mpeg" })
        setAudioUrl(URL.createObjectURL(blob))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Adjust playback rate based on pacing
        audioRef.current.playbackRate = 0.75 + (pacing[0] / 100) * 0.5
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Book Excerpt</Label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Paste your book excerpt or chapter..."
            className="min-h-[120px]"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Chapter Title (optional)</Label>
          <Input
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            placeholder="e.g., Chapter 1"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Narrator Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NARRATOR_VOICES.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div>
                    <span className="font-medium">{voice.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {voice.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Pacing</Label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Slower</span>
            <Slider
              value={pacing}
              onValueChange={setPacing}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">Faster</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !excerpt.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Audiobook Preview...
          </>
        ) : (
          <>
            <BookOpen className="h-4 w-4 mr-2" />
            Generate Preview
          </>
        )}
      </Button>

      {audioUrl && (
        <Card>
          <CardContent className="p-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Audio player controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-14 w-14 rounded-full"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>
            </div>

            {chapterTitle && (
              <div className="text-center mt-4">
                <p className="text-sm font-medium">{chapterTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {excerpt.length} characters
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full">
                <SkipForward className="h-4 w-4 mr-1" />
                Continue from here
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
