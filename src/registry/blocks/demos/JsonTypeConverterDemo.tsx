"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowRight, Copy, Check, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"

const OUTPUT_TYPES = [
  { id: "typescript", label: "TypeScript Interface" },
  { id: "zod", label: "Zod Schema" },
  { id: "json-schema", label: "JSON Schema" },
  { id: "python-dataclass", label: "Python Dataclass" },
  { id: "python-pydantic", label: "Python Pydantic" },
  { id: "go-struct", label: "Go Struct" },
  { id: "rust-struct", label: "Rust Struct" },
]

export interface JsonTypeConverterDemoProps {
  /** Default JSON input */
  defaultJson?: string
}

export function JsonTypeConverterDemo({
  defaultJson = `{
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "roles": ["admin", "user"],
    "metadata": {
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  }
}`,
}: JsonTypeConverterDemoProps = {}) {
  const [jsonInput, setJsonInput] = useState(defaultJson)
  const [outputType, setOutputType] = useState("typescript")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const handleConvert = async () => {
    if (!jsonInput.trim()) return

    // Validate JSON first
    try {
      JSON.parse(jsonInput)
    } catch {
      setError("Invalid JSON input")
      return
    }

    setIsLoading(true)
    setError("")
    setOutput("")

    const outputConfig = OUTPUT_TYPES.find(t => t.id === outputType)

    try {
      const response = await generateText({
        prompt: `Convert this JSON to ${outputConfig?.label}:

${jsonInput}

Requirements:
- Infer proper types from the values
- Use appropriate naming conventions for the target language
- Include any necessary imports
- Make the types as specific as possible (not just "any" or "string")
- For dates, use appropriate date types

Return ONLY the code, no explanations.`,
        maxTokens: 500,
      })

      // Clean up the response - remove markdown code blocks if present
      let cleanOutput = response.text.trim()
      cleanOutput = cleanOutput.replace(/^```\w*\n?/gm, "").replace(/```$/gm, "").trim()
      setOutput(cleanOutput)
    } catch (err) {
      console.error("Error:", err)
      setError("Failed to convert")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSwap = () => {
    // Try to convert output back to JSON if it looks like JSON
    try {
      const parsed = JSON.parse(output)
      setJsonInput(JSON.stringify(parsed, null, 2))
      setOutput("")
    } catch {
      // Not JSON, do nothing
    }
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">JSON Input</Label>
          <Textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value)
              setError("")
            }}
            placeholder="Paste your JSON here..."
            className={cn(
              "font-mono text-xs min-h-[200px]",
              error && "border-red-500"
            )}
          />
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Output</Label>
            {output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7"
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Converted output will appear here..."
            className="font-mono text-xs min-h-[200px] bg-muted"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={outputType} onValueChange={setOutputType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OUTPUT_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleConvert}
          disabled={isLoading || !jsonInput.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Convert
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>

        {output && (
          <Button
            variant="outline"
            onClick={handleSwap}
            title="Swap (if output is JSON)"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
