"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowRight, Copy, Check, ArrowLeftRight } from "lucide-react"

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "swift", label: "Swift" },
  { id: "kotlin", label: "Kotlin" },
]

export interface CodeConverterDemoProps {
  /** Default source language */
  defaultFromLang?: string
  /** Default target language */
  defaultToLang?: string
  /** Default code */
  defaultCode?: string
}

export function CodeConverterDemo({
  defaultFromLang = "javascript",
  defaultToLang = "python",
  defaultCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Usage
const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);`,
}: CodeConverterDemoProps = {}) {
  const [fromLang, setFromLang] = useState(defaultFromLang)
  const [toLang, setToLang] = useState(defaultToLang)
  const [inputCode, setInputCode] = useState(defaultCode)
  const [outputCode, setOutputCode] = useState("")
  const [notes, setNotes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleConvert = async () => {
    if (!inputCode.trim()) return
    setIsLoading(true)
    setOutputCode("")
    setNotes([])

    const fromLabel = LANGUAGES.find(l => l.id === fromLang)?.label
    const toLabel = LANGUAGES.find(l => l.id === toLang)?.label

    try {
      const response = await generateText({
        prompt: `Convert this ${fromLabel} code to ${toLabel}:

\`\`\`${fromLang}
${inputCode}
\`\`\`

Requirements:
1. Maintain the same functionality
2. Use idiomatic ${toLabel} patterns and conventions
3. Include equivalent comments
4. Handle any language-specific differences appropriately

Return as JSON:
{
  "code": "the converted code here",
  "notes": ["Important differences or considerations when converting"]
}

Only include meaningful notes about the conversion.`,
        maxTokens: 600,
      })

      const parsed = JSON.parse(response.text)
      // Clean up code - remove markdown code blocks if present
      let cleanCode = parsed.code || ""
      cleanCode = cleanCode.replace(/^```\w*\n?/gm, "").replace(/```$/gm, "").trim()
      setOutputCode(cleanCode)
      setNotes(parsed.notes || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = () => {
    setFromLang(toLang)
    setToLang(fromLang)
    if (outputCode) {
      setInputCode(outputCode)
      setOutputCode("")
      setNotes([])
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(outputCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-sm mb-2 block">From</Label>
          <Select value={fromLang} onValueChange={setFromLang}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSwap}
          className="mt-6"
          title="Swap languages"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <Label className="text-sm mb-2 block">To</Label>
          <Select value={toLang} onValueChange={setToLang}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">Input ({LANGUAGES.find(l => l.id === fromLang)?.label})</Label>
          <Textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Paste your code here..."
            className="font-mono text-xs min-h-[200px]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Output ({LANGUAGES.find(l => l.id === toLang)?.label})</Label>
            {outputCode && (
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
            value={outputCode}
            readOnly
            placeholder="Converted code will appear here..."
            className="font-mono text-xs min-h-[200px] bg-muted"
          />
        </div>
      </div>

      <Button
        onClick={handleConvert}
        disabled={isLoading || !inputCode.trim() || fromLang === toLang}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            Convert
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {notes.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground font-medium mb-2">Conversion notes:</p>
            <ul className="space-y-1">
              {notes.map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  • {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
