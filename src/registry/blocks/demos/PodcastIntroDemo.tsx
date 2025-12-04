"use client"

import { useState, useRef } from "react"
import { generateText, generateSpeech } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Play, Square, Loader2, Mic2, Radio, Sparkles } from "lucide-react"

const DEFAULT_TOPIC = `The surprising science behind why we procrastinate - and it's not about laziness. Recent studies show procrastination is actually an emotional regulation problem. When we face tasks that trigger negative emotions like anxiety, boredom, or self-doubt, our brains seek immediate relief by switching to something more pleasant. The key to overcoming it isn't willpower, but self-compassion and breaking tasks into less emotionally threatening chunks.`

export interface PodcastIntroDemoProps {
  /** Default topic/article content */
  defaultTopic?: string
  /** Default podcast name */
  defaultPodcastName?: string
  /** Default host name */
  defaultHostName?: string
}

export function PodcastIntroDemo({
  defaultTopic = DEFAULT_TOPIC,
  defaultPodcastName = "Mind Matters Daily",
  defaultHostName = "Alex",
}: PodcastIntroDemoProps = {}) {
  const [topic, setTopic] = useState(defaultTopic)
  const [podcastName, setPodcastName] = useState(defaultPodcastName)
  const [hostName, setHostName] = useState(defaultHostName)
  const [script, setScript] = useState<string | null>(null)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generatePodcast = async () => {
    if (!topic.trim()) return

    setError(null)
    setScript(null)

    // Step 1: Generate podcast script
    setIsGeneratingScript(true)
    try {
      const scriptResult = await generateText({
        prompt: `Write a short podcast segment script (150-200 words) for a podcast called "${podcastName}" hosted by ${hostName}.

The script should:
1. Start with a catchy greeting and show intro
2. Present the following topic in an engaging, conversational way
3. Add a brief call-to-action at the end (subscribe, share, etc.)

Topic content to discuss:
${topic}

Write the full script as if ${hostName} is speaking directly to listeners. Be conversational, warm, and engaging. Include brief pauses marked with "..." for natural delivery.`,
        maxTokens: 400,
        temperature: 0.8,
      })

      const scriptText = scriptResult.text.trim()
      setScript(scriptText)
      setIsGeneratingScript(false)

      // Step 2: Generate audio
      setIsGeneratingAudio(true)
      const audioResult = await generateSpeech({
        text: scriptText,
        voice: "ash",
        speed: 1.0,
        model: "gpt-4o-mini-tts",
        instructions: `You are ${hostName}, a charismatic podcast host with a warm, engaging presence. Speak naturally and conversationally, as if talking to a friend. Vary your tone - be enthusiastic for exciting points, thoughtful for insights. Use natural pauses and emphasis. Sound genuine and passionate about the topic. This is audio-only so paint pictures with your words.`,
      })

      const blob = new Blob([audioResult.audio.audioData], { type: audioResult.audio.mimeType })
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate podcast")
      setScript(null)
    } finally {
      setIsGeneratingScript(false)
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

  const isLoading = isGeneratingScript || isGeneratingAudio

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic2 className="h-5 w-5" />
              <CardTitle className="text-lg">Podcast Generator</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1">
              <Radio className="h-3 w-3" />
              AI Host
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Transform any topic into a podcast segment with a professional host
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Podcast Name
              </label>
              <Input
                value={podcastName}
                onChange={(e) => setPodcastName(e.target.value)}
                placeholder="Your Podcast Name"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Host Name
              </label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Host Name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Topic or Content
            </label>
            <Textarea
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value)
                setScript(null)
              }}
              placeholder="Paste article text or describe the topic..."
              className="min-h-[120px] resize-none"
            />
          </div>

          {script && (
            <div className="p-3 bg-muted rounded-lg max-h-[200px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Generated Script</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {script}
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

          <div className="flex items-center justify-center gap-2">
            {!isPlaying ? (
              <Button
                onClick={generatePodcast}
                disabled={isLoading || !topic.trim()}
                size="lg"
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isGeneratingScript ? "Writing script..." : "Recording..."}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Generate Podcast
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

          {script && !isPlaying && !isLoading && (
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
        AI-generated script + professional narration
      </p>
    </div>
  )
}
