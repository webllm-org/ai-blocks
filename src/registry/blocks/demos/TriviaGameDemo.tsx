"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Gamepad2, Check, X, HelpCircle, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

const TOPICS = [
  { id: "general", label: "General Knowledge" },
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "geography", label: "Geography" },
  { id: "entertainment", label: "Entertainment" },
  { id: "sports", label: "Sports" },
  { id: "custom", label: "Custom Topic" },
]

const DIFFICULTIES = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
]

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface TriviaGameDemoProps {
  /** Default topic */
  defaultTopic?: string
}

export function TriviaGameDemo({
  defaultTopic = "general",
}: TriviaGameDemoProps = {}) {
  const [topic, setTopic] = useState(defaultTopic)
  const [customTopic, setCustomTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [started, setStarted] = useState(false)

  const fetchQuestion = async () => {
    setIsLoading(true)
    setSelectedAnswer(null)
    setShowExplanation(false)

    const topicName = topic === "custom" ? customTopic : TOPICS.find(t => t.id === topic)?.label

    try {
      const result = await generateText({
        prompt: `Generate a ${difficulty} trivia question about ${topicName}.

Format as JSON:
{
  "question": "the question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0,
  "explanation": "brief explanation of why the answer is correct"
}

Make it interesting and educational. Difficulty: ${difficulty} (${difficulty === "easy" ? "common knowledge" : difficulty === "medium" ? "requires some knowledge" : "challenging, specific knowledge needed"}).`,
        maxTokens: 300,
      })

      const parsed = JSON.parse(result.text)
      setCurrentQuestion(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStart = () => {
    setStarted(true)
    setScore(0)
    setStreak(0)
    setQuestionsAnswered(0)
    fetchQuestion()
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    setQuestionsAnswered(q => q + 1)

    if (index === currentQuestion?.correctIndex) {
      setScore(s => s + (streak >= 3 ? 2 : 1))
      setStreak(s => s + 1)
    } else {
      setStreak(0)
    }
  }

  const handleNext = () => {
    // Adapt difficulty based on performance
    if (questionsAnswered >= 3) {
      const recentAccuracy = score / questionsAnswered
      if (recentAccuracy > 0.8 && difficulty !== "hard") {
        setDifficulty(difficulty === "easy" ? "medium" : "hard")
      } else if (recentAccuracy < 0.4 && difficulty !== "easy") {
        setDifficulty(difficulty === "hard" ? "medium" : "easy")
      }
    }
    fetchQuestion()
  }

  if (!started) {
    return (
      <div className="space-y-4 w-full max-w-md mx-auto">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
          <CardContent className="p-6 text-center">
            <Gamepad2 className="h-8 w-8 mx-auto mb-3 text-indigo-500" />
            <h3 className="font-medium mb-2">Trivia Game</h3>
            <p className="text-sm text-muted-foreground">
              Test your knowledge! Difficulty adapts to your performance.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div>
            <Label className="text-sm mb-2 block">Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {topic === "custom" && (
            <div>
              <Label className="text-sm mb-2 block">Custom Topic</Label>
              <Input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g., Marvel movies, World War II"
              />
            </div>
          )}

          <div>
            <Label className="text-sm mb-2 block">Starting Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleStart} className="w-full">
          <Gamepad2 className="h-4 w-4 mr-2" />
          Start Game
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {/* Score bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Score: {score}</Badge>
          {streak >= 3 && (
            <Badge variant="default" className="bg-orange-500">
              <Flame className="h-3 w-3 mr-1" />
              {streak}x
            </Badge>
          )}
        </div>
        <Badge variant="outline">{difficulty}</Badge>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Loading question...</p>
          </CardContent>
        </Card>
      ) : currentQuestion ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="font-medium">{currentQuestion.question}</p>

            <div className="space-y-2">
              {currentQuestion.options.map((option, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left h-auto py-3",
                    selectedAnswer !== null && i === currentQuestion.correctIndex && "border-green-500 bg-green-50 dark:bg-green-950",
                    selectedAnswer === i && i !== currentQuestion.correctIndex && "border-red-500 bg-red-50 dark:bg-red-950"
                  )}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="mr-2">{String.fromCharCode(65 + i)}.</span>
                  {option}
                  {selectedAnswer !== null && i === currentQuestion.correctIndex && (
                    <Check className="h-4 w-4 ml-auto text-green-500" />
                  )}
                  {selectedAnswer === i && i !== currentQuestion.correctIndex && (
                    <X className="h-4 w-4 ml-auto text-red-500" />
                  )}
                </Button>
              ))}
            </div>

            {selectedAnswer !== null && (
              <div className="space-y-2">
                <div className={cn(
                  "text-sm font-medium",
                  selectedAnswer === currentQuestion.correctIndex ? "text-green-600" : "text-red-600"
                )}>
                  {selectedAnswer === currentQuestion.correctIndex ? "Correct! 🎉" : "Incorrect"}
                </div>

                <button
                  className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  <HelpCircle className="h-3 w-3" />
                  {showExplanation ? "Hide" : "Show"} explanation
                </button>

                {showExplanation && (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {currentQuestion.explanation}
                  </p>
                )}

                <Button onClick={handleNext} className="w-full">
                  Next Question
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
