"use client"

import { useState, useRef, useEffect } from "react"
import { WebLLMClient } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, RotateCcw } from "lucide-react"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  role: string
}

const EMPTY_FORM: FormData = { firstName: "", lastName: "", email: "", phone: "", company: "", role: "" }

export function FormAutofillDemo() {
  const [naturalInput, setNaturalInput] = useState("I'm John Smith, software engineer at Acme Corp. My email is john.smith@acme.com and phone is 555-123-4567")
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const clientRef = useRef<WebLLMClient | null>(null)

  useEffect(() => {
    clientRef.current = new WebLLMClient()
  }, [])

  const handleAutofill = async () => {
    if (!naturalInput.trim() || !clientRef.current) return
    setIsLoading(true)

    try {
      const result = await clientRef.current.generateText({
        prompt: `Extract contact information from this text and return as JSON.

Text: "${naturalInput}"

Return JSON with these fields (use empty string if not found):
{"firstName": "", "lastName": "", "email": "", "phone": "", "company": "", "role": ""}`,
        temperature: 0.3,
        maxTokens: 200,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as FormData
        setFormData(parsed)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setFormData(EMPTY_FORM)
    setNaturalInput("")
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div>
        <Label className="text-sm text-muted-foreground">Describe yourself naturally:</Label>
        <Textarea
          value={naturalInput}
          onChange={(e) => setNaturalInput(e.target.value)}
          placeholder="e.g., I'm Jane Doe, marketing manager at TechCo..."
          rows={2}
          className="mt-1"
        />
      </div>

      <Button onClick={handleAutofill} disabled={isLoading || !naturalInput.trim()} className="w-full">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Parsing...</>
        ) : (
          <><Sparkles className="h-4 w-4 mr-2" />Autofill Form</>
        )}
      </Button>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">First Name</Label>
              <Input value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="John" />
            </div>
            <div>
              <Label className="text-xs">Last Name</Label>
              <Input value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="Doe" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="john@example.com" type="email" />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="555-123-4567" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Company</Label>
              <Input value={formData.company} onChange={(e) => updateField("company", e.target.value)} placeholder="Acme Inc" />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Input value={formData.role} onChange={(e) => updateField("role", e.target.value)} placeholder="Engineer" />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
            <RotateCcw className="h-3 w-3 mr-1" />Reset
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
