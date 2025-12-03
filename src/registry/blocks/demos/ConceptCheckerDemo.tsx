"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

const concepts = [
  {
    topic: "Photosynthesis",
    description: "Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.",
    keyPoints: ["chlorophyll", "light energy", "glucose", "oxygen release"]
  },
  {
    topic: "Supply and Demand",
    description: "Economic model where price is determined by the relationship between availability and desire for goods.",
    keyPoints: ["equilibrium", "scarcity", "price mechanism", "market forces"]
  },
  {
    topic: "Newton's First Law",
    description: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
    keyPoints: ["inertia", "external force", "velocity", "equilibrium state"]
  }
]

type FeedbackType = {
  score: number
  correct: string[]
  missing: string[]
  misconceptions: string[]
  feedback: string
}

export function ConceptCheckerDemo() {
  const [selectedConcept, setSelectedConcept] = useState(concepts[0])
  const [explanation, setExplanation] = useState("")
  const [feedback, setFeedback] = useState<FeedbackType | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkUnderstanding = async () => {
    if (!explanation.trim()) return

    setIsChecking(true)
    setFeedback(null)

    try {
      const result = await generateText({
        prompt: `Evaluate this student explanation of "${selectedConcept.topic}":

Correct definition: ${selectedConcept.description}
Key concepts that should be mentioned: ${selectedConcept.keyPoints.join(", ")}

Student's explanation: "${explanation}"

Return JSON:
{
  "score": 0-100,
  "correct": ["concepts they got right"],
  "missing": ["important concepts not mentioned"],
  "misconceptions": ["any incorrect understanding"],
  "feedback": "brief encouraging feedback with one tip"
}

JSON:`,
        temperature: 0.5,
        maxTokens: 250,
      })

      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setFeedback(parsed)
        }
      } catch {
        setFeedback({
          score: 50,
          correct: ["Attempted explanation"],
          missing: ["Could not analyze"],
          misconceptions: [],
          feedback: "Please try again with a more detailed explanation."
        })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const reset = () => {
    setExplanation("")
    setFeedback(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-8 w-8 text-green-500" />
    if (score >= 60) return <AlertCircle className="h-8 w-8 text-yellow-500" />
    return <XCircle className="h-8 w-8 text-red-500" />
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {/* Concept Selection */}
      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <Badge
            key={concept.topic}
            variant={selectedConcept.topic === concept.topic ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => {
              setSelectedConcept(concept)
              reset()
            }}
          >
            {concept.topic}
          </Badge>
        ))}
      </div>

      {/* Challenge Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Explain It Back</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium mb-1">Your challenge:</p>
            <p className="text-sm text-muted-foreground">
              Explain <span className="font-medium text-foreground">{selectedConcept.topic}</span> in your own words.
            </p>
          </div>

          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Type your explanation here... Try to cover the key concepts."
            rows={4}
            disabled={isChecking}
          />

          <div className="flex gap-2">
            <Button
              onClick={checkUnderstanding}
              disabled={isChecking || !explanation.trim()}
              className="flex-1"
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Check My Understanding
            </Button>
            {feedback && (
              <Button onClick={reset} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {feedback && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4">
              {getScoreIcon(feedback.score)}
              <div>
                <div className={`text-3xl font-bold ${getScoreColor(feedback.score)}`}>
                  {feedback.score}%
                </div>
                <div className="text-sm text-muted-foreground">Understanding Score</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {feedback.correct.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> You got right:
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {feedback.correct.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-green-50">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {feedback.missing.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Missing concepts:
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {feedback.missing.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-yellow-50">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {feedback.misconceptions.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> To clarify:
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {feedback.misconceptions.map((item, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-red-50">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted rounded-lg p-3 text-sm">
                {feedback.feedback}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
