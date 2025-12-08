"use client"

import { useState, useRef } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, Copy, Mic } from "lucide-react"

export interface VoiceMemoTranscriberDemoProps {
  /** Show recording option */
  showRecording?: boolean
}

export function VoiceMemoTranscriberDemo({
  showRecording = true,
}: VoiceMemoTranscriberDemoProps = {}) {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [rawTranscript, setRawTranscript] = useState("")
  const [cleanedTranscript, setCleanedTranscript] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("cleaned")
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const handleTranscribe = async () => {
    if (!audioFile) return
    setIsLoading(true)

    // Simulated raw transcript (in real implementation, use speech-to-text API)
    const simulatedRaw = "Um, so like, I wanted to talk about, uh, the project update. So basically, um, we finished the, the first phase and, uh, we're moving on to, you know, the second phase. The team is, um, really excited about it."

    setRawTranscript(simulatedRaw)

    try {
      // Clean up the transcript
      const result = await generateText({
        prompt: `Clean up this voice memo transcript by:
1. Removing filler words (um, uh, like, you know, basically, so)
2. Fixing grammar and punctuation
3. Making sentences clear and professional
4. Keep the original meaning intact

Raw transcript:
"${simulatedRaw}"

Return ONLY the cleaned transcript, nothing else.`,
        maxTokens: 500,
      })

      setCleanedTranscript(result.text)
    } catch (error) {
      console.error("Error:", error)
      setCleanedTranscript(simulatedRaw)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    const text = activeTab === "cleaned" ? cleanedTranscript : rawTranscript
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlightFillers = (text: string) => {
    const fillers = /\b(um|uh|like|you know|basically|so|actually)\b/gi
    return text.split(fillers).map((part, i) =>
      fillers.test(part) ? (
        <span key={i} className="line-through text-muted-foreground">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        {audioFile ? (
          <div className="space-y-2">
            <Mic className="h-8 w-8 mx-auto text-primary" />
            <p className="font-medium">{audioFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(audioFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-muted-foreground">
            <Upload className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Upload voice memo</p>
            <p className="text-sm">Drag & drop or click to upload</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <Button
        onClick={handleTranscribe}
        disabled={isLoading || !audioFile}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Transcribing...
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Transcribe & Clean
          </>
        )}
      </Button>

      {(rawTranscript || cleanedTranscript) && (
        <Card>
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="cleaned">Cleaned</TabsTrigger>
                <TabsTrigger value="raw">Raw (with fillers)</TabsTrigger>
              </TabsList>

              <TabsContent value="cleaned" className="mt-4">
                <div className="prose prose-sm max-w-none">
                  <p>{cleanedTranscript}</p>
                </div>
              </TabsContent>

              <TabsContent value="raw" className="mt-4">
                <div className="prose prose-sm max-w-none">
                  <p>{highlightFillers(rawTranscript)}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Strikethrough = filler words removed
                </p>
              </TabsContent>
            </Tabs>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="w-full mt-4"
            >
              <Copy className="h-4 w-4 mr-1" />
              {copied ? "Copied!" : "Copy Cleaned Text"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
