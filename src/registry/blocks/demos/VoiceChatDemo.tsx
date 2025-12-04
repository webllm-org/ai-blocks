"use client"

import { useState, useRef, useEffect } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react"

interface Message { role: "user" | "assistant"; content: string }

const DEFAULT_SYSTEM_PROMPT = "You are a voice assistant. Brief responses."

export interface VoiceChatDemoProps {
  /** System prompt for the assistant */
  systemPrompt?: string
  /** Whether TTS is enabled by default */
  defaultTtsEnabled?: boolean
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function VoiceChatDemo({
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  defaultTtsEnabled = true,
  temperature = 0.7,
  maxTokens = 100,
}: VoiceChatDemoProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [ttsEnabled, setTtsEnabled] = useState(defaultTtsEnabled)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setSupported(false); return }
    recognitionRef.current = new SR()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
  }, [])

  const speak = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.onstart = () => setIsSpeaking(true)
    u.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(u)
  }

  const processMessage = async (text: string) => {
    if (!text.trim()) return
    setMessages(p => [...p, { role: "user", content: text.trim() }])
    setTranscript("")
    setIsLoading(true)
    try {
      const r = await generateText({
        prompt: `${systemPrompt}\n\nUser: ${text}\n\nAssistant:`,
        temperature, maxTokens,
      })
      const response = r.text.trim()
      setMessages(p => [...p, { role: "assistant", content: response }])
      speak(response)
    } catch { setMessages(p => [...p, { role: "assistant", content: "Error occurred." }]) }
    finally { setIsLoading(false) }
  }

  const startListening = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.onresult = (e) => {
      const r = e.results[e.results.length - 1]
      setTranscript(r[0].transcript)
      if (r.isFinal) processMessage(r[0].transcript)
    }
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.start()
    setIsListening(true)
  }

  if (!supported) return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="p-6 text-center">
        <MicOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Speech recognition not supported. Try Chrome.</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card className="min-h-[200px]">
        <CardContent className="p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Mic className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Click the mic to start talking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-lg px-3 py-2 max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm">{m.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex justify-start"><Loader2 className="h-4 w-4 animate-spin" /></div>}
            </div>
          )}
        </CardContent>
      </Card>
      {transcript && <p className="text-sm text-center text-muted-foreground italic">"{transcript}"</p>}
      <div className="flex justify-center gap-2">
        <Button size="lg" variant={isListening ? "destructive" : "default"} className="rounded-full h-16 w-16"
          onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false) } : startListening} disabled={isLoading}>
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Button size="icon" variant="outline" className="rounded-full" onClick={() => setTtsEnabled(!ttsEnabled)}>
          {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Press mic to talk"}
      </p>
    </div>
  )
}
