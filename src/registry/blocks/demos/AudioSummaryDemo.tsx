"use client"

import { useState, useRef } from "react"
import { generateText, generateSpeech } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Play, Square, Loader2, Volume2, FileText, Sparkles } from "lucide-react"

const DEFAULT_ARTICLE = `Artificial intelligence is transforming industries at an unprecedented pace. From healthcare diagnostics that can detect diseases earlier than human doctors, to autonomous vehicles navigating complex urban environments, AI systems are becoming integral to modern life.

The latest generation of language models demonstrates remarkable capabilities in understanding and generating human-like text. These models, trained on vast amounts of data, can assist with writing, coding, analysis, and creative tasks. However, they also raise important questions about authenticity, employment, and the nature of intelligence itself.

As AI continues to advance, society faces crucial decisions about governance, ethics, and the distribution of benefits. Researchers emphasize the importance of developing AI systems that are aligned with human values and transparent in their operations. The coming decade will likely see AI become even more deeply woven into the fabric of daily life.`

export interface AudioSummaryDemoProps {
  /** Default article text */
  defaultText?: string
  /** Voice to use for TTS */
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | "ash" | "coral" | "sage" | "ballad" | "verse"
}

export function AudioSummaryDemo({
  defaultText = DEFAULT_ARTICLE,
  voice = "nova",
}: AudioSummaryDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [summary, setSummary] = useState<string | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generateSummaryAndAudio = async () => {
    if (!text.trim()) return

    setError(null)
    setSummary(null)

    // Step 1: Generate summary
    setIsGeneratingSummary(true)
    try {
      const summaryResult = await generateText({
        prompt: `Summarize this article in 2-3 concise sentences that capture the key points. Make it sound natural for audio listening:\n\n${text}`,
        maxTokens: 150,
        temperature: 0.7,
      })

      const summaryText = summaryResult.text.trim()
      setSummary(summaryText)
      setIsGeneratingSummary(false)

      // Step 2: Generate audio from summary
      setIsGeneratingAudio(true)
      const audioResult = await generateSpeech({
        text: summaryText,
        voice: voice,
        speed: 1.0,
        model: "gpt-4o-mini-tts",
        instructions: "You are a friendly podcast host giving a quick summary. Speak naturally and conversationally, with a warm and engaging tone. Keep the pace steady but not rushed.",
      })

      const blob = new Blob([audioResult.audio.audioData], { type: audioResult.audio.mimeType })
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate audio summary")
      setSummary(null)
    } finally {
      setIsGeneratingSummary(false)
      setIsGeneratingAudio(false)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const isLoading = isGeneratingSummary || isGeneratingAudio

  const getLoadingText = () => {
    if (isGeneratingSummary) return "Summarizing article..."
    if (isGeneratingAudio) return "Generating audio..."
    return "Generate Audio Summary"
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <CardTitle className="text-lg">Audio Summary</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              TLDR + Voice
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Get a quick audio summary of any article - perfect for busy readers
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setSummary(null) // Clear summary when text changes
            }}
            placeholder="Paste article text here..."
            className="min-h-[150px] resize-none"
          />

          {summary && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Summary</span>
              </div>
              <p className="text-sm text-muted-foreground">{summary}</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

          <div className="flex items-center justify-center gap-2">
            {!isPlaying ? (
              <Button
                onClick={generateSummaryAndAudio}
                disabled={isLoading || !text.trim()}
                size="lg"
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {getLoadingText()}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Generate Audio Summary
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

          {summary && !isPlaying && !isLoading && (
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

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Volume2 className="h-3 w-3" />
        <span>Summarize with AI, then hear it spoken naturally</span>
      </div>
    </div>
  )
}
