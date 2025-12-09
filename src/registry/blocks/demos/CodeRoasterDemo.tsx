"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Loader2, Flame, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

const PERSONAS = [
  { id: "senior-dev", label: "Senior Dev", avatar: "👨‍💻", style: "experienced but fair senior developer" },
  { id: "tech-lead", label: "Tech Lead", avatar: "👩‍💼", style: "pragmatic tech lead focused on maintainability" },
  { id: "gordon", label: "Gordon Ramsay", avatar: "👨‍🍳", style: "Gordon Ramsay if he reviewed code instead of food" },
  { id: "linus", label: "Linus Torvalds", avatar: "🐧", style: "Linus Torvalds reviewing a kernel patch" },
  { id: "mentor", label: "Caring Mentor", avatar: "🤗", style: "supportive mentor who believes in you" },
]

export interface CodeRoasterDemoProps {
  /** Default code to roast */
  defaultCode?: string
}

export function CodeRoasterDemo({
  defaultCode = `function getData() {
  var data = null;
  $.ajax({
    url: '/api/data',
    async: false,
    success: function(result) {
      data = result;
    }
  });
  return data;
}`,
}: CodeRoasterDemoProps = {}) {
  const [code, setCode] = useState(defaultCode)
  const [selectedPersona, setSelectedPersona] = useState("senior-dev")
  const [intensity, setIntensity] = useState([50])
  const [showFixes, setShowFixes] = useState(false)
  const [roast, setRoast] = useState("")
  const [fixes, setFixes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const getIntensityLabel = () => {
    const val = intensity[0]
    if (val < 25) return "Gentle"
    if (val < 50) return "Moderate"
    if (val < 75) return "Brutal"
    return "Savage"
  }

  const handleRoast = async () => {
    if (!code.trim()) return
    setIsLoading(true)
    setRoast("")
    setFixes("")

    const persona = PERSONAS.find(p => p.id === selectedPersona)
    const intensityPrompt = intensity[0] < 25
      ? "gentle and constructive"
      : intensity[0] < 50
      ? "honest but helpful"
      : intensity[0] < 75
      ? "brutally honest"
      : "absolutely savage"

    try {
      const result = await generateText({
        prompt: `You are a ${persona?.style}. Review this code in a ${intensityPrompt} way.

Code:
\`\`\`
${code}
\`\`\`

Give your review as the persona, pointing out issues, bad practices, and room for improvement. Be specific about what's wrong.${showFixes ? "\n\nAlso include a section called '## Actually, here's how to fix it:' with the improved code." : ""}`,
        maxTokens: 800,
      })

      const text = result.text
      if (showFixes && text.includes("## Actually")) {
        const parts = text.split("## Actually")
        setRoast(parts[0].trim())
        setFixes(parts[1] || "")
      } else {
        setRoast(text)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Your Code</Label>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="min-h-[150px] font-mono text-sm"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Roast Persona</Label>
          <div className="flex flex-wrap gap-2">
            {PERSONAS.map((persona) => (
              <Button
                key={persona.id}
                variant={selectedPersona === persona.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPersona(persona.id)}
              >
                <span className="mr-1">{persona.avatar}</span>
                {persona.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block">
            Intensity: <span className="font-bold">{getIntensityLabel()}</span>
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-xs">🤗</span>
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs">🔥</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Show fixes too</Label>
            <p className="text-xs text-muted-foreground">Include actual suggestions</p>
          </div>
          <Switch checked={showFixes} onCheckedChange={setShowFixes} />
        </div>
      </div>

      <Button
        onClick={handleRoast}
        disabled={isLoading || !code.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Roasting...
          </>
        ) : (
          <>
            <Flame className="h-4 w-4 mr-2" />
            Roast My Code
          </>
        )}
      </Button>

      {roast && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">
                {PERSONAS.find(p => p.id === selectedPersona)?.avatar}
              </span>
              <span className="font-medium">
                {PERSONAS.find(p => p.id === selectedPersona)?.label}
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{roast}</div>
            </div>

            {fixes && showFixes && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-sm">Actually, here's how to fix it:</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {fixes}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
