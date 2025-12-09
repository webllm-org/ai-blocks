"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, CheckCircle, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationResult {
  isValid: boolean
  explanation: string
  suggestion?: string
  canAutoFix: boolean
}

const FIELD_TYPES = [
  { id: "email", label: "Email Address", example: "john@example" },
  { id: "phone", label: "Phone Number", example: "555-123-45" },
  { id: "url", label: "Website URL", example: "www.example" },
  { id: "date", label: "Date", example: "Feb 30 2024" },
  { id: "password", label: "Password", example: "pass" },
  { id: "credit-card", label: "Credit Card", example: "1234-5678" },
]

export interface ValidationExplainerDemoProps {
  /** Default field type */
  defaultFieldType?: string
}

export function ValidationExplainerDemo({
  defaultFieldType = "email",
}: ValidationExplainerDemoProps = {}) {
  const [fieldType, setFieldType] = useState(defaultFieldType)
  const [value, setValue] = useState(FIELD_TYPES.find(f => f.id === defaultFieldType)?.example || "")
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleValidate = async () => {
    if (!value.trim()) return
    setIsLoading(true)
    setResult(null)

    const fieldInfo = FIELD_TYPES.find(f => f.id === fieldType)

    try {
      const response = await generateText({
        prompt: `Validate this ${fieldInfo?.label} input:

Value: "${value}"
Field type: ${fieldType}

Check if it's valid. If invalid, explain WHY in a friendly, helpful way (not just "Invalid input").

Format as JSON:
{
  "isValid": false,
  "explanation": "US phone numbers need 10 digits, but this only has 8. It looks like you might be missing the area code.",
  "suggestion": "555-123-4567",
  "canAutoFix": true
}

If valid, explanation should confirm what was checked.`,
        maxTokens: 200,
      })

      const parsed = JSON.parse(response.text)
      setResult(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoFix = () => {
    if (result?.suggestion) {
      setValue(result.suggestion)
      setResult(null)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Field Type</Label>
          <Select
            value={fieldType}
            onValueChange={(v) => {
              setFieldType(v)
              setValue(FIELD_TYPES.find(f => f.id === v)?.example || "")
              setResult(null)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Value to Validate</Label>
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setResult(null)
            }}
            placeholder={`Enter ${FIELD_TYPES.find(f => f.id === fieldType)?.label}...`}
            className={cn(
              "transition-all",
              result?.isValid === false && "border-red-500 focus-visible:ring-red-500",
              result?.isValid === true && "border-green-500 focus-visible:ring-green-500"
            )}
          />
        </div>
      </div>

      <Button
        onClick={handleValidate}
        disabled={isLoading || !value.trim()}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Validate"
        )}
      </Button>

      {result && (
        <Card className={cn(
          result.isValid
            ? "border-green-200 bg-green-50 dark:bg-green-950"
            : "border-red-200 bg-red-50 dark:bg-red-950"
        )}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
              {result.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={cn(
                  "font-medium text-sm",
                  result.isValid ? "text-green-700" : "text-red-700"
                )}>
                  {result.isValid ? "Valid!" : "Invalid"}
                </p>
                <p className="text-sm mt-1">{result.explanation}</p>
              </div>
            </div>

            {result.suggestion && !result.isValid && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Suggestion:</span>
                <code className="px-2 py-1 bg-white dark:bg-gray-900 rounded text-sm flex-1">
                  {result.suggestion}
                </code>
                {result.canAutoFix && (
                  <Button size="sm" variant="outline" onClick={handleAutoFix}>
                    <Wand2 className="h-4 w-4 mr-1" />
                    Fix
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
