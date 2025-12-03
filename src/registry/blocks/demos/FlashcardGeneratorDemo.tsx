"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, GraduationCap, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

interface Flashcard {
  question: string
  answer: string
}

const SAMPLE_CONTENT = `The water cycle, also known as the hydrological cycle, describes the continuous movement of water on, above, and below Earth's surface. Water evaporates from oceans and lakes, rises as water vapor, condenses into clouds, and falls back as precipitation. Transpiration from plants also contributes water vapor to the atmosphere. Groundwater flows through aquifers and eventually returns to the ocean, completing the cycle.`

export function FlashcardGeneratorDemo() {
  const [content, setContent] = useState(SAMPLE_CONTENT)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!content.trim()) return
    setIsLoading(true)
    setFlashcards([])
    setCurrentIndex(0)
    setIsFlipped(false)

    try {
      const result = await generateText({
        prompt: `Create 5 flashcards from this educational content. Each flashcard should test understanding of a key concept.

Content:
${content}

Respond with JSON array: [{"question": "Q1", "answer": "A1"}, {"question": "Q2", "answer": "A2"}, ...]`,
        temperature: 0.7,
        maxTokens: 600,
      })

      const jsonMatch = result.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Flashcard[]
        setFlashcards(parsed)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const goNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const currentCard = flashcards[currentIndex]

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste educational content to generate flashcards..."
        rows={4}
      />

      <Button onClick={handleGenerate} disabled={isLoading || !content.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating Cards...
          </>
        ) : (
          <>
            <GraduationCap className="h-4 w-4 mr-2" />
            Generate Flashcards
          </>
        )}
      </Button>

      {flashcards.length > 0 && currentCard && (
        <div className="space-y-3">
          <Card
            className="min-h-[180px] cursor-pointer transition-all hover:shadow-md"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[180px]">
              <p className="text-xs text-muted-foreground mb-2">
                {isFlipped ? "Answer" : "Question"} • Click to flip
              </p>
              <p className="text-center text-sm">
                {isFlipped ? currentCard.answer : currentCard.question}
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {flashcards.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goNext}
              disabled={currentIndex === flashcards.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
