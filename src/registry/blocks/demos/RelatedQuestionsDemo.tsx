"use client"

import { useState, useEffect } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, HelpCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"

const sampleArticle = {
  title: "Understanding Machine Learning",
  content: `Machine learning is a subset of artificial intelligence that enables computers to learn from data without explicit programming. The three main types are supervised learning (learning from labeled examples), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error).

Deep learning, a subset of machine learning, uses neural networks with multiple layers to process complex patterns. It powers technologies like image recognition, natural language processing, and autonomous vehicles.

Training ML models requires large datasets and significant computational resources. Transfer learning helps by using pre-trained models as starting points, reducing the data and compute needed for new tasks.`
}

type Question = {
  text: string
  answer: string | null
  isExpanded: boolean
}

export function RelatedQuestionsDemo() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

  const generateQuestions = async () => {

    setIsGenerating(true)
    setQuestions([])

    try {
      const result = await generateText({
        prompt: `Based on this article about "${sampleArticle.title}":

${sampleArticle.content}

Generate 5 questions a curious reader might wonder about. Format: one question per line, no numbers or bullets.`,
        temperature: 0.8,
        maxTokens: 200,
      })

      const qs = result.text.split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 10 && q.includes('?'))
        .slice(0, 5)
        .map(text => ({ text, answer: null, isExpanded: false }))

      setQuestions(qs)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getAnswer = async (index: number) => {
    if (questions[index].answer) {
      // Toggle expand if answer exists
      setQuestions(prev => prev.map((q, i) =>
        i === index ? { ...q, isExpanded: !q.isExpanded } : q
      ))
      return
    }

    setLoadingIndex(index)

    try {
      const result = await generateText({
        prompt: `Based on this article:

${sampleArticle.content}

Answer this question concisely (2-3 sentences):
${questions[index].text}`,
        temperature: 0.7,
        maxTokens: 100,
      })

      setQuestions(prev => prev.map((q, i) =>
        i === index ? { ...q, answer: result.text.trim(), isExpanded: true } : q
      ))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoadingIndex(null)
    }
  }

  useEffect(() => {
    generateQuestions()
  }, [])

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{sampleArticle.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {sampleArticle.content.slice(0, 200)}...
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">What you might be wondering...</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateQuestions}
          disabled={isGenerating}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {isGenerating ? (
          <Card>
            <CardContent className="py-8 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Generating questions...</span>
            </CardContent>
          </Card>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No questions generated yet
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                className="w-full text-left p-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
                onClick={() => getAnswer(index)}
              >
                <span className="text-sm font-medium pr-2">{question.text}</span>
                {loadingIndex === index ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : question.isExpanded ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              {question.isExpanded && question.answer && (
                <div className="px-3 pb-3 pt-0">
                  <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                    {question.answer}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Click questions to reveal AI-generated answers
      </p>
    </div>
  )
}
