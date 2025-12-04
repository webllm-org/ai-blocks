"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Braces, Copy, Check } from "lucide-react"

const DEFAULT_DESCRIPTION = "A user profile with name, email, age, and list of hobbies"

export interface JsonGeneratorDemoProps {
  /** Initial description value */
  defaultDescription?: string
  /** Placeholder for textarea */
  placeholder?: string
  /** Temperature for generation (0-1) */
  temperature?: number
  /** Max tokens for generation */
  maxTokens?: number
}

export function JsonGeneratorDemo({
  defaultDescription = DEFAULT_DESCRIPTION,
  placeholder = "Describe the JSON structure you need...",
  temperature = 0.7,
  maxTokens = 500,
}: JsonGeneratorDemoProps = {}) {
  const [description, setDescription] = useState(defaultDescription)
  const [generatedJson, setGeneratedJson] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isValid, setIsValid] = useState(true)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setIsLoading(true)
    setGeneratedJson("")

    try {
      const result = await generateText({
        prompt: `Generate a JSON object based on this description. Include realistic sample data.

Description: ${description}

Return ONLY valid JSON, no explanation:`,
        temperature,
        maxTokens,
      })

      const jsonMatch = result.text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          setGeneratedJson(JSON.stringify(parsed, null, 2))
          setIsValid(true)
        } catch {
          setGeneratedJson(jsonMatch[0])
          setIsValid(false)
        }
      } else {
        setGeneratedJson(result.text.trim())
        setIsValid(false)
      }
    } catch (error) {
      setGeneratedJson("Error generating JSON")
      setIsValid(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />

      <div className="text-xs text-muted-foreground">
        Examples: "API response for a blog post", "Config file for a web app", "Product catalog item"
      </div>

      <Button onClick={handleGenerate} disabled={isLoading || !description.trim()} className="w-full">
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
        ) : (
          <><Braces className="h-4 w-4 mr-2" />Generate JSON</>
        )}
      </Button>

      {generatedJson && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Braces className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Generated JSON</span>
                {isValid ? (
                  <span className="text-xs text-green-600">Valid</span>
                ) : (
                  <span className="text-xs text-yellow-600">May need formatting</span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
              <code>{generatedJson}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
