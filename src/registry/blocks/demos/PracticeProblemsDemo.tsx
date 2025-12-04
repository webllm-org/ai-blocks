"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, GraduationCap, CheckCircle, XCircle, RefreshCw, Eye } from "lucide-react"

interface Problem {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const DEFAULT_CONTENT = `Photosynthesis is the process by which plants convert light energy into chemical energy. During photosynthesis, plants absorb carbon dioxide from the air through tiny pores called stomata and water from the soil through their roots. Using sunlight captured by chlorophyll in their leaves, plants combine CO2 and H2O to produce glucose and oxygen. The glucose provides energy for the plant's growth and metabolism, while oxygen is released as a byproduct.`

export interface PracticeProblemsDemoProps {
  /** Initial educational content */
  defaultContent?: string
  /** Placeholder for textarea */
  placeholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function PracticeProblemsDemo({
  defaultContent = DEFAULT_CONTENT,
  placeholder = "Paste educational content to generate practice problems...",
  temperature = 0.8,
  maxTokens = 400,
}: PracticeProblemsDemoProps = {}) {
  const [content, setContent] = useState(defaultContent)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const generateProblem = async () => {
    if (!content.trim()) return
    setIsLoading(true)
    setProblem(null)
    setSelectedAnswer(null)
    setShowExplanation(false)

    try {
      const result = await generateText({
        prompt: `Create a multiple choice question based on this educational content:

${content}

Generate a challenging but fair question that tests understanding, not just memorization.

Respond in JSON format:
{"question": "The question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 0, "explanation": "Why this is the correct answer"}`,
        temperature,
        maxTokens,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setProblem(JSON.parse(jsonMatch[0]) as Problem)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    setScore(prev => ({
      correct: prev.correct + (index === problem?.correctIndex ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const getOptionStyle = (index: number) => {
    if (selectedAnswer === null) return "hover:bg-muted cursor-pointer"
    if (index === problem?.correctIndex) return "bg-green-100 border-green-500"
    if (index === selectedAnswer) return "bg-red-100 border-red-500"
    return "opacity-50"
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
      />

      <div className="flex gap-2">
        <Button onClick={generateProblem} disabled={isLoading || !content.trim()} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : problem ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Problem
            </>
          ) : (
            <>
              <GraduationCap className="h-4 w-4 mr-2" />
              Generate Problem
            </>
          )}
        </Button>
        {score.total > 0 && (
          <Badge variant="outline" className="px-3">
            Score: {score.correct}/{score.total}
          </Badge>
        )}
      </div>

      {problem && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="font-medium">{problem.question}</p>

            <div className="space-y-2">
              {problem.options.map((option, i) => (
                <div
                  key={i}
                  className={`p-3 border rounded-lg transition-colors ${getOptionStyle(i)}`}
                  onClick={() => handleAnswer(i)}
                >
                  <div className="flex items-center gap-2">
                    {selectedAnswer !== null && i === problem.correctIndex && (
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    {selectedAnswer === i && i !== problem.correctIndex && (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                    <span className="text-sm">{String.fromCharCode(65 + i)}. {option}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedAnswer !== null && (
              <div className="pt-2 border-t">
                {!showExplanation ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExplanation(true)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Show Explanation
                  </Button>
                ) : (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Explanation:</p>
                    <p className="text-sm text-muted-foreground">{problem.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
