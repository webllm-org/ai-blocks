"use client"

import { useState, useEffect } from "react"
import { speak, getVoices } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Play,
  Square,
  Pause,
  Loader2,
  Volume2,
  Zap,
  Cloud,
  WifiOff,
  Speaker,
} from "lucide-react"

const DEFAULT_TEXT = `Welcome to WebLLM! This is a demonstration of the speak function, which uses browser-native text-to-speech for instant playback, with automatic fallback to cloud voices when needed.`

interface VoiceInfo {
  name: string
  lang: string
  source: 'browser' | 'cloud'
  provider?: string
  isDefault?: boolean
}

type PreferMode = 'instant' | 'quality' | 'offline'

const PREFER_MODES: { value: PreferMode; label: string; icon: typeof Zap; description: string }[] = [
  {
    value: 'instant',
    label: 'Instant',
    icon: Zap,
    description: 'Browser TTS first, cloud fallback'
  },
  {
    value: 'quality',
    label: 'Quality',
    icon: Cloud,
    description: 'Cloud TTS first, browser fallback'
  },
  {
    value: 'offline',
    label: 'Offline',
    icon: WifiOff,
    description: 'Browser TTS only'
  },
]

export interface InstantSpeakDemoProps {
  /** Default text to speak */
  defaultText?: string
  /** Default prefer mode */
  defaultPrefer?: PreferMode
}

export function InstantSpeakDemo({
  defaultText = DEFAULT_TEXT,
  defaultPrefer = 'instant',
}: InstantSpeakDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [prefer, setPrefer] = useState<PreferMode>(defaultPrefer)
  const [rate, setRate] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [selectedVoice, setSelectedVoice] = useState<string>('default')
  const [voices, setVoices] = useState<VoiceInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastMethod, setLastMethod] = useState<'browser' | 'cloud' | null>(null)
  const [lastVoice, setLastVoice] = useState<string | null>(null)

  // Controls from the speak result
  const [speakControls, setSpeakControls] = useState<{
    pause: () => void
    resume: () => void
    cancel: () => void
  } | null>(null)

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const availableVoices = await getVoices()
        setVoices(availableVoices)
      } catch (err) {
        console.error('Failed to load voices:', err)
      }
    }
    loadVoices()
  }, [])

  const handleSpeak = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError(null)
    setLastMethod(null)
    setLastVoice(null)

    try {
      const result = await speak({
        text: text.trim(),
        voice: selectedVoice === 'default' ? undefined : selectedVoice,
        prefer,
        rate,
        pitch,
      })

      setLastMethod(result.method)
      setLastVoice(result.voice)
      setIsSpeaking(true)
      setIsPaused(false)
      setSpeakControls({
        pause: result.pause,
        resume: result.resume,
        cancel: result.cancel,
      })

      // Wait for speech to finish
      result.finished.then(() => {
        setIsSpeaking(false)
        setIsPaused(false)
        setSpeakControls(null)
      }).catch((err: Error) => {
        if (err.message !== 'cancelled') {
          setError(err.message)
        }
        setIsSpeaking(false)
        setIsPaused(false)
        setSpeakControls(null)
      })
    } catch (err: any) {
      setError(err.message || 'Failed to speak')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePause = () => {
    speakControls?.pause()
    setIsPaused(true)
  }

  const handleResume = () => {
    speakControls?.resume()
    setIsPaused(false)
  }

  const handleStop = () => {
    speakControls?.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    setSpeakControls(null)
  }

  const browserVoices = voices.filter(v => v.source === 'browser')
  const cloudVoices = voices.filter(v => v.source === 'cloud')

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Speaker className="h-5 w-5" />
              <CardTitle className="text-lg">Instant Speak</CardTitle>
            </div>
            {lastMethod && (
              <Badge variant="outline" className="gap-1">
                {lastMethod === 'browser' ? (
                  <Zap className="h-3 w-3" />
                ) : (
                  <Cloud className="h-3 w-3" />
                )}
                {lastMethod === 'browser' ? 'Browser TTS' : 'Cloud TTS'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Browser-native TTS with cloud fallback
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prefer Mode Selection */}
          <div className="space-y-2">
            <Label>Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {PREFER_MODES.map((mode) => {
                const Icon = mode.icon
                const isSelected = prefer === mode.value
                return (
                  <Button
                    key={mode.value}
                    variant={isSelected ? "default" : "outline"}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setPrefer(mode.value)}
                    disabled={isSpeaking}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{mode.label}</span>
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {PREFER_MODES.find(m => m.value === prefer)?.description}
            </p>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select
              value={selectedVoice}
              onValueChange={setSelectedVoice}
              disabled={isSpeaking}
            >
              <SelectTrigger id="voice">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                {browserVoices.length > 0 && (
                  <>
                    <SelectItem value="browser-header" disabled className="text-xs font-semibold text-muted-foreground">
                      Browser Voices
                    </SelectItem>
                    {browserVoices.slice(0, 10).map((voice) => (
                      <SelectItem key={`browser-${voice.name}`} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </>
                )}
                {cloudVoices.length > 0 && (
                  <>
                    <SelectItem value="cloud-header" disabled className="text-xs font-semibold text-muted-foreground">
                      Cloud Voices
                    </SelectItem>
                    {cloudVoices.map((voice) => (
                      <SelectItem key={`cloud-${voice.name}`} value={voice.name}>
                        {voice.name} ({voice.provider})
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Rate and Pitch Sliders */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rate">Rate</Label>
                <span className="text-xs text-muted-foreground">{rate.toFixed(1)}x</span>
              </div>
              <Slider
                id="rate"
                min={0.5}
                max={2}
                step={0.1}
                value={[rate]}
                onValueChange={([v]) => setRate(v)}
                disabled={isSpeaking}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pitch">Pitch</Label>
                <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}</span>
              </div>
              <Slider
                id="pitch"
                min={0.5}
                max={2}
                step={0.1}
                value={[pitch]}
                onValueChange={([v]) => setPitch(v)}
                disabled={isSpeaking}
              />
            </div>
          </div>

          {/* Text Input */}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to speak..."
            className="min-h-[100px] resize-none"
            disabled={isSpeaking}
          />

          {/* Status */}
          {lastVoice && (
            <p className="text-xs text-muted-foreground text-center">
              Using voice: <span className="font-medium">{lastVoice}</span>
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {!isSpeaking ? (
              <Button
                onClick={handleSpeak}
                disabled={isLoading || !text.trim()}
                size="lg"
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Speak
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={isPaused ? handleResume : handlePause}
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
                  onClick={handleStop}
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
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        Uses browser Web Speech API with cloud TTS fallback
      </p>
    </div>
  )
}
