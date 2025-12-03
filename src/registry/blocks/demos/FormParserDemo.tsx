"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, ArrowRight, CheckCircle } from "lucide-react"

type ParsedData = {
  name?: string
  email?: string
  phone?: string
  company?: string
  role?: string
  address?: string
  date?: string
  amount?: string
  notes?: string
}

const sampleInputs = [
  "Hey, this is Sarah Chen from Acme Corp. You can reach me at sarah.chen@acme.com or 415-555-0123. I'm the VP of Engineering.",
  "Invoice #1234 for $2,500.00 due March 15, 2024. Bill to: John Smith, 123 Main St, San Francisco CA 94102",
  "Meeting with Dr. James Wilson tomorrow at 3pm. His assistant's number is 212-555-9876. Topic: Partnership discussion"
]

export function FormParserDemo() {
  const [input, setInput] = useState("")
  const [parsed, setParsed] = useState<ParsedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const parseText = async () => {
    if (!clientRef.current || !input.trim()) return

    setIsProcessing(true)
    setParsed(null)

    try {
      const result = await clientRef.current.generateText({
        prompt: `Extract structured data from this text. Return JSON only.

Text: "${input}"

Extract any of these fields if present:
- name (person's full name)
- email (email address)
- phone (phone number)
- company (organization name)
- role (job title)
- address (physical address)
- date (any date mentioned)
- amount (money amount)
- notes (other important info, max 20 words)

Return only fields that are clearly present. JSON:`,
        temperature: 0.3,
        maxTokens: 200,
      })

      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0])
          setParsed(data)
        }
      } catch {
        setParsed({ notes: "Could not parse the text" })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const fieldLabels: Record<keyof ParsedData, string> = {
    name: "Name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    role: "Role/Title",
    address: "Address",
    date: "Date",
    amount: "Amount",
    notes: "Notes"
  }

  const parsedEntries = parsed ? Object.entries(parsed).filter(([_, v]) => v) : []

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Text to Structured Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste unstructured text like emails, messages, or notes..."
            rows={4}
            disabled={isProcessing}
          />

          <Button
            onClick={parseText}
            disabled={isProcessing || !input.trim()}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Parsing...
              </>
            ) : (
              <>
                Extract Fields
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Parsed Results */}
      {parsed && (
        <Card className="border-green-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Extracted {parsedEntries.length} field{parsedEntries.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {parsedEntries.map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 min-w-[80px] justify-center">
                    {fieldLabels[key as keyof ParsedData]}
                  </Badge>
                  <span className="text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Inputs */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Try these examples:</span>
        <div className="grid gap-2">
          {sampleInputs.map((sample, index) => (
            <button
              key={index}
              onClick={() => setInput(sample)}
              className="text-left text-xs p-2 rounded border hover:bg-accent/50 transition-colors line-clamp-2"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
