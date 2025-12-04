"use client"

import { useState, useRef } from "react"
import { generateText, generateSpeech } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Play, Square, Loader2, Moon, Sparkles, BookOpen } from "lucide-react"

interface StoryTheme {
  id: string
  name: string
  emoji: string
  prompt: string
}

const STORY_THEMES: StoryTheme[] = [
  {
    id: "forest",
    name: "Forest Friends",
    emoji: "🌲",
    prompt: "a gentle adventure in a magical forest with friendly woodland creatures",
  },
  {
    id: "ocean",
    name: "Under the Sea",
    emoji: "🐠",
    prompt: "a peaceful journey through a colorful underwater world with sea creatures",
  },
  {
    id: "space",
    name: "Starry Night",
    emoji: "🌙",
    prompt: "a dreamy voyage through the stars meeting friendly constellations",
  },
  {
    id: "garden",
    name: "Secret Garden",
    emoji: "🌸",
    prompt: "a magical garden where flowers whisper secrets and butterflies guide the way",
  },
]

export interface StoryNarratorDemoProps {
  /** Default theme ID */
  defaultTheme?: string
  /** Child's name to personalize the story */
  defaultName?: string
}

export function StoryNarratorDemo({
  defaultTheme = "forest",
  defaultName = "",
}: StoryNarratorDemoProps = {}) {
  const [theme, setTheme] = useState(defaultTheme)
  const [childName, setChildName] = useState(defaultName)
  const [story, setStory] = useState<string | null>(null)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTheme = STORY_THEMES.find(t => t.id === theme) || STORY_THEMES[0]

  const generateBedtimeStory = async () => {
    setError(null)
    setStory(null)

    const nameClause = childName.trim() ? ` The main character is named ${childName.trim()}.` : ""

    // Step 1: Generate story
    setIsGeneratingStory(true)
    try {
      const storyResult = await generateText({
        prompt: `Write a short, soothing bedtime story (about 100-150 words) about ${currentTheme.prompt}.${nameClause} The story should be calming, have a gentle happy ending, and be perfect for helping a child fall asleep. Use soft, peaceful imagery. End with the character drifting off to sleep.`,
        maxTokens: 300,
        temperature: 0.8,
      })

      const storyText = storyResult.text.trim()
      setStory(storyText)
      setIsGeneratingStory(false)

      // Step 2: Generate soothing audio narration
      setIsGeneratingAudio(true)
      const audioResult = await generateSpeech({
        text: storyText,
        voice: "nova",
        speed: 0.9,
        model: "gpt-4o-mini-tts",
        instructions: "You are a gentle, loving storyteller reading a bedtime story. Speak very softly and soothingly, with a warm, peaceful tone. Pace yourself slowly - this is meant to help a child fall asleep. Use a hushed, tender voice as if you're in a quiet bedroom at night. Pause gently between sentences.",
      })

      const blob = new Blob([audioResult.audio.audioData], { type: audioResult.audio.mimeType })
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate bedtime story")
      setStory(null)
    } finally {
      setIsGeneratingStory(false)
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

  const isLoading = isGeneratingStory || isGeneratingAudio

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card className="bg-gradient-to-b from-indigo-950/30 to-background border-indigo-500/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-lg">Bedtime Story</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1 border-indigo-500/30">
              <Sparkles className="h-3 w-3" />
              AI Narrator
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate a soothing bedtime story with a gentle narrator
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Child's Name (optional)
            </label>
            <Input
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Enter name for a personalized story..."
              className="bg-background/50"
            />
          </div>

          {/* Theme Selection */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Story Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STORY_THEMES.map((t) => (
                <Button
                  key={t.id}
                  variant={theme === t.id ? "default" : "outline"}
                  className="justify-start gap-2 h-auto py-3"
                  onClick={() => setTheme(t.id)}
                  disabled={isLoading}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-sm">{t.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {story && (
            <div className="p-4 bg-indigo-950/20 rounded-lg border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Tonight's Story</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {story}
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
                onClick={generateBedtimeStory}
                disabled={isLoading}
                size="lg"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isGeneratingStory ? "Writing story..." : "Preparing narration..."}
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Generate Bedtime Story
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

          {story && !isPlaying && !isLoading && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="border-indigo-500/30"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.play()
                    setIsPlaying(true)
                  }
                }}
              >
                <Play className="h-3 w-3 mr-2" />
                Listen Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Sweet dreams powered by AI storytelling 🌙
      </p>
    </div>
  )
}
