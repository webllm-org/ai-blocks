"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Mail, Copy, Check } from "lucide-react"

const EMAIL_TYPES = [
  { id: "follow-up", label: "Follow-up", icon: "📬" },
  { id: "request", label: "Request", icon: "🙏" },
  { id: "thank-you", label: "Thank You", icon: "🙏" },
  { id: "introduction", label: "Introduction", icon: "👋" },
  { id: "apology", label: "Apology", icon: "😔" },
  { id: "announcement", label: "Announcement", icon: "📢" },
] as const

export function EmailComposerDemo() {
  const [recipient, setRecipient] = useState("Sarah")
  const [context, setContext] = useState("Met at tech conference last week, discussed potential partnership, wants to schedule follow-up call")
  const [emailType, setEmailType] = useState<string>("follow-up")
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleCompose = async () => {
    if (!context.trim() || !clientRef.current) return
    setIsLoading(true)
    setEmail(null)

    try {
      const result = await clientRef.current.generateText({
        prompt: `Write a professional ${emailType} email based on these details:
Recipient: ${recipient || "the recipient"}
Context: ${context}

Create a concise, professional email with a clear subject line.

Respond in JSON format:
{"subject": "Email subject line", "body": "Email body text"}`,
        temperature: 0.7,
        maxTokens: 400,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        setEmail(JSON.parse(jsonMatch[0]))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (!email) return
    const fullEmail = `Subject: ${email.subject}\n\n${email.body}`
    navigator.clipboard.writeText(fullEmail)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient name (optional)"
      />

      <Textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Key points: who, what, why, any specific details to include..."
        rows={3}
      />

      <div>
        <p className="text-sm text-muted-foreground mb-2">Email Type</p>
        <div className="flex flex-wrap gap-2">
          {EMAIL_TYPES.map((type) => (
            <Button
              key={type.id}
              variant={emailType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setEmailType(type.id)}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <Button onClick={handleCompose} disabled={isLoading || !context.trim()} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Composing...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Compose Email
          </>
        )}
      </Button>

      {email && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="font-medium">{email.subject}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Body</p>
              <p className="text-sm whitespace-pre-wrap">{email.body}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
