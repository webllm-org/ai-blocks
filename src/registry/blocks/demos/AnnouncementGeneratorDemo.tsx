"use client"

import { useState, useRef } from "react"
import { generateSpeech } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Play, Download, Megaphone } from "lucide-react"

const CONTEXTS = [
  { id: "store-pa", label: "Store PA", description: "Retail store announcements", voice: "nova" },
  { id: "phone-hold", label: "Phone Hold", description: "On-hold messages", voice: "shimmer" },
  { id: "video-voiceover", label: "Video Voiceover", description: "Video narration", voice: "alloy" },
  { id: "event", label: "Event", description: "Event announcements", voice: "onyx" },
]

const TONES = [
  { id: "urgent", label: "Urgent", prompt: "urgent and important" },
  { id: "friendly", label: "Friendly", prompt: "warm and friendly" },
  { id: "professional", label: "Professional", prompt: "professional and formal" },
]

export interface AnnouncementGeneratorDemoProps {
  /** Default announcement text */
  defaultText?: string
}

export function AnnouncementGeneratorDemo({
  defaultText = "Attention shoppers: All items in aisle 5 are now 50% off for the next hour only!",
}: AnnouncementGeneratorDemoProps = {}) {
  const [text, setText] = useState(defaultText)
  const [context, setContext] = useState("store-pa")
  const [tone, setTone] = useState("friendly")
  const [backgroundMusic, setBackgroundMusic] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleGenerate = async () => {
    if (!text.trim()) return
    setIsLoading(true)
    setAudioUrl(null)

    const selectedContext = CONTEXTS.find(c => c.id === context)

    try {
      const result = await generateSpeech({
        text: text.trim(),
        voice: (selectedContext?.voice || "nova") as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
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

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a")
      link.href = audioUrl
      link.download = `announcement-${context}.mp3`
      link.click()
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Announcement Text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your announcement..."
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Context</Label>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTEXTS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Background Music</Label>
            <p className="text-xs text-muted-foreground">Add ambient music bed</p>
          </div>
          <Switch
            checked={backgroundMusic}
            onCheckedChange={setBackgroundMusic}
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !text.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Megaphone className="h-4 w-4 mr-2" />
            Generate Announcement
          </>
        )}
      </Button>

      {audioUrl && (
        <Card>
          <CardContent className="p-4">
            <audio ref={audioRef} src={audioUrl} className="hidden" />

            <div className="flex gap-2">
              <Button
                onClick={() => audioRef.current?.play()}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-1" />
                Play
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Context: {CONTEXTS.find(c => c.id === context)?.label}</p>
              <p>{CONTEXTS.find(c => c.id === context)?.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
