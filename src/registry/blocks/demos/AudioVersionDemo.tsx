"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Volume2, FastForward, RotateCcw } from "lucide-react"

const sampleArticle = {
  title: "The Rise of Remote Work",
  content: `Remote work has transformed from a rare perk to a global norm. Studies show that 70% of workers worldwide work remotely at least once a week. Companies like GitLab and Zapier have been fully remote since their founding, proving that distributed teams can build successful products.

The benefits extend beyond flexibility. Remote workers report higher job satisfaction, better work-life balance, and often increased productivity. Cities are seeing migration patterns shift as workers relocate from expensive urban centers to more affordable areas.

However, challenges remain. Collaboration, company culture, and mentorship are harder to maintain virtually. Many organizations are now adopting hybrid models, combining the best of both in-office and remote work.

The future of work is clearly more flexible than ever before.`
}

export function AudioVersionDemo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [rate, setRate] = useState(1)
  const [progress, setProgress] = useState(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const sentencesRef = useRef<string[]>([])

  const sentences = sampleArticle.content
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0)

  const speak = (startIndex = 0) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech not supported in this browser")
      return
    }

    window.speechSynthesis.cancel()
    sentencesRef.current = sentences

    const speakSentence = (index: number) => {
      if (index >= sentences.length) {
        setIsPlaying(false)
        setIsPaused(false)
        setProgress(100)
        return
      }

      const utterance = new SpeechSynthesisUtterance(sentences[index])
      utterance.rate = rate
      utterance.onend = () => {
        setCurrentIndex(index + 1)
        setProgress(((index + 1) / sentences.length) * 100)
        speakSentence(index + 1)
      }
      utterance.onerror = () => {
        setIsPlaying(false)
      }

      utteranceRef.current = utterance
      setCurrentIndex(index)
      window.speechSynthesis.speak(utterance)
    }

    setIsPlaying(true)
    setIsPaused(false)
    speakSentence(startIndex)
  }

  const togglePlayPause = () => {
    if (!isPlaying) {
      speak(currentIndex)
    } else if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentIndex(0)
    setProgress(0)
  }

  const restart = () => {
    stop()
    setTimeout(() => speak(0), 100)
  }

  const changeRate = (value: number[]) => {
    setRate(value[0])
    if (isPlaying && !isPaused) {
      const idx = currentIndex
      window.speechSynthesis.cancel()
      setTimeout(() => speak(idx), 100)
    }
  }

  const estimatedTime = Math.round((sampleArticle.content.split(' ').length / 150) * (1 / rate))

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{sampleArticle.title}</CardTitle>
            <Badge variant="outline">
              ~{estimatedTime} min read
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Article Preview */}
          <div className="relative">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {sentences.map((sentence, index) => (
                <span
                  key={index}
                  className={`transition-colors duration-200 ${
                    isPlaying && index === currentIndex
                      ? "bg-primary/20 text-foreground"
                      : index < currentIndex && isPlaying
                      ? "text-muted-foreground/50"
                      : ""
                  }`}
                >
                  {sentence}{" "}
                </span>
              ))}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentIndex} / {sentences.length} sentences</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={restart} disabled={!isPlaying && currentIndex === 0}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="lg" onClick={togglePlayPause} className="px-6">
              {isPlaying && !isPaused ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={stop} disabled={!isPlaying}>
              <Square className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-4">
            <FastForward className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[rate]}
              onValueChange={changeRate}
              min={0.5}
              max={2}
              step={0.25}
              className="flex-1"
            />
            <Badge variant="secondary">{rate}x</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Volume2 className="h-3 w-3" />
        <span>Browser text-to-speech • No API costs</span>
      </div>
    </div>
  )
}
