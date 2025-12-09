"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Wand2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormField {
  id: string
  label: string
  value: string
  source?: string
  highlighted?: boolean
}

export interface MagicFillFormDemoProps {
  /** Initial form fields */
  fields?: Array<{ id: string; label: string }>
}

export function MagicFillFormDemo({
  fields = [
    { id: "name", label: "Full Name" },
    { id: "email", label: "Email" },
    { id: "company", label: "Company" },
    { id: "role", label: "Role/Title" },
    { id: "phone", label: "Phone" },
    { id: "website", label: "Website" },
  ],
}: MagicFillFormDemoProps = {}) {
  const [pastedText, setPastedText] = useState("")
  const [formFields, setFormFields] = useState<FormField[]>(
    fields.map(f => ({ ...f, value: "" }))
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleMagicFill = async () => {
    if (!pastedText.trim()) return
    setIsLoading(true)

    try {
      const result = await generateText({
        prompt: `Extract contact/profile information from this text:

"${pastedText}"

Map to these fields: ${fields.map(f => f.label).join(", ")}

Format as JSON with field IDs:
{
  "name": "extracted value or empty string",
  "email": "...",
  "company": "...",
  "role": "...",
  "phone": "...",
  "website": "..."
}

Only include values you can confidently extract. Leave as empty string if not found.`,
        maxTokens: 200,
      })

      const parsed = JSON.parse(result.text)

      setFormFields(prev =>
        prev.map(field => ({
          ...field,
          value: parsed[field.id] || field.value,
          highlighted: !!parsed[field.id] && parsed[field.id] !== field.value,
          source: parsed[field.id] ? "AI extracted" : undefined,
        }))
      )
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (id: string, value: string) => {
    setFormFields(prev =>
      prev.map(f =>
        f.id === id ? { ...f, value, highlighted: false } : f
      )
    )
  }

  const clearHighlights = () => {
    setFormFields(prev =>
      prev.map(f => ({ ...f, highlighted: false, source: undefined }))
    )
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Paste anything about yourself</span>
          </div>
          <Textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your LinkedIn bio, email signature, business card text, or any description..."
            className="min-h-[80px] bg-white dark:bg-gray-900"
          />
          <Button
            onClick={handleMagicFill}
            disabled={isLoading || !pastedText.trim()}
            className="w-full mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Magic Fill
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.id} className="text-sm">
                  {field.label}
                </Label>
                {field.source && (
                  <span className="text-xs text-purple-500">{field.source}</span>
                )}
              </div>
              <Input
                id={field.id}
                value={field.value}
                onChange={(e) => updateField(field.id, e.target.value)}
                className={cn(
                  "transition-all",
                  field.highlighted && "ring-2 ring-purple-300 bg-purple-50 dark:bg-purple-950"
                )}
              />
            </div>
          ))}

          {formFields.some(f => f.highlighted) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHighlights}
              className="text-xs"
            >
              Clear highlights
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
