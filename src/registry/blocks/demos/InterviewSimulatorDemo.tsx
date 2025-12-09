"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Briefcase, Send, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const INTERVIEW_TYPES = [
  { id: "behavioral", label: "Behavioral" },
  { id: "technical", label: "Technical" },
  { id: "case", label: "Case Study" },
]

const COMPANY_TYPES = [
  { id: "startup", label: "Startup" },
  { id: "bigtech", label: "Big Tech" },
  { id: "enterprise", label: "Enterprise" },
  { id: "consulting", label: "Consulting" },
]

interface Message {
  role: "interviewer" | "candidate"
  content: string
  feedback?: {
    good: string[]
    improve: string[]
  }
}

export interface InterviewSimulatorDemoProps {
  /** Default role */
  defaultRole?: string
}

export function InterviewSimulatorDemo({
  defaultRole = "Senior Frontend Developer",
}: InterviewSimulatorDemoProps = {}) {
  const [role, setRole] = useState(defaultRole)
  const [companyType, setCompanyType] = useState("bigtech")
  const [interviewType, setInterviewType] = useState("behavioral")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState<number | null>(null)
  const [started, setStarted] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    setStarted(true)
    setMessages([])

    try {
      const result = await generateText({
        prompt: `You are an interviewer at a ${COMPANY_TYPES.find(c => c.id === companyType)?.label} company conducting a ${interviewType} interview for a ${role} position.

Start the interview with a brief introduction and your first question. Be realistic and professional.`,
        maxTokens: 300,
      })

      setMessages([{ role: "interviewer", content: result.text }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!input.trim()) return
    setIsLoading(true)

    const candidateMessage: Message = { role: "candidate", content: input.trim() }
    setMessages(prev => [...prev, candidateMessage])
    setInput("")

    try {
      // Get AI response and feedback
      const result = await generateText({
        prompt: `You are an interviewer at a ${companyType} company conducting a ${interviewType} interview for ${role}.

Interview so far:
${messages.map(m => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n")}

Candidate: ${input.trim()}

Respond as the interviewer with a follow-up question or move to the next topic. Also provide private feedback on the candidate's last answer.

Format:
RESPONSE: [Your next question/comment]
FEEDBACK_GOOD: [What was good about their answer, comma separated]
FEEDBACK_IMPROVE: [What could be better, comma separated]`,
        maxTokens: 400,
      })

      const text = result.text
      const responseMatch = text.match(/RESPONSE:\s*([\s\S]*?)(?=FEEDBACK_GOOD:|$)/)
      const goodMatch = text.match(/FEEDBACK_GOOD:\s*([\s\S]*?)(?=FEEDBACK_IMPROVE:|$)/)
      const improveMatch = text.match(/FEEDBACK_IMPROVE:\s*([\s\S]*)/)

      // Add feedback to candidate's message
      const feedback = {
        good: goodMatch?.[1]?.split(",").map(s => s.trim()).filter(Boolean) || [],
        improve: improveMatch?.[1]?.split(",").map(s => s.trim()).filter(Boolean) || [],
      }

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...candidateMessage, feedback }
        return [...updated, { role: "interviewer", content: responseMatch?.[1]?.trim() || text }]
      })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnd = async () => {
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Based on this interview for ${role}:

${messages.map(m => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`).join("\n\n")}

Provide a final assessment with:
1. Overall impression
2. Strongest points
3. Areas to work on
4. Suggested practice topics`,
        maxTokens: 500,
      })

      setMessages(prev => [...prev, { role: "interviewer", content: `📋 **Interview Complete**\n\n${result.text}` }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!started) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <div className="space-y-3">
          <div>
            <Label className="text-sm mb-2 block">Role</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm mb-2 block">Company Type</Label>
              <Select value={companyType} onValueChange={setCompanyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_TYPES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Interview Type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button onClick={handleStart} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Briefcase className="h-4 w-4 mr-2" />
          )}
          Start Interview
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardContent className="p-4 max-h-[400px] overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={cn(
                  "p-3 rounded-lg",
                  msg.role === "interviewer"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground ml-8"
                )}
              >
                <div className="text-xs font-medium mb-1">
                  {msg.role === "interviewer" ? "🎤 Interviewer" : "You"}
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>

              {msg.feedback && (
                <div
                  className="ml-8 mt-2 text-xs cursor-pointer"
                  onClick={() => setShowFeedback(showFeedback === i ? null : i)}
                >
                  <span className="text-muted-foreground hover:text-foreground">
                    💡 View feedback
                  </span>

                  {showFeedback === i && (
                    <div className="mt-2 p-2 border rounded bg-muted/50 space-y-2">
                      {msg.feedback.good.length > 0 && (
                        <div className="flex items-start gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                          <span>{msg.feedback.good.join(", ")}</span>
                        </div>
                      )}
                      {msg.feedback.improve.length > 0 && (
                        <div className="flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5" />
                          <span>{msg.feedback.improve.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          className="min-h-[60px]"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleRespond())}
        />
        <Button onClick={handleRespond} disabled={isLoading || !input.trim()} className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <Button variant="outline" onClick={handleEnd} disabled={isLoading} className="w-full">
        End Interview & Get Assessment
      </Button>
    </div>
  )
}
