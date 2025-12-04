"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, Type, AlignLeft, RefreshCw } from "lucide-react"

const DEFAULT_TEXT = `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is often used for typography demonstrations.

Reading can be challenging when text is presented in formats that don't accommodate different learning needs. Research shows that certain fonts, spacing, and formatting choices can significantly impact reading comprehension and speed.

Studies indicate that approximately 15-20% of the population has some form of reading difficulty. Simple adjustments to text presentation can make a substantial difference in accessibility and comfort.`

type DyslexiaSettings = {
  largerSpacing: boolean
  shorterLines: boolean
  simplifiedText: boolean
  fontSize: number
  lineHeight: number
}

export interface DyslexiaModeDemoProps {
  /** Text to display */
  defaultText?: string
  /** Default font size */
  defaultFontSize?: number
  /** Default line height */
  defaultLineHeight?: number
  /** Temperature for simplification (0-1) */
  temperature?: number
  /** Max tokens for simplification */
  maxTokens?: number
}

export function DyslexiaModeDemo({
  defaultText = DEFAULT_TEXT,
  defaultFontSize = 16,
  defaultLineHeight = 1.5,
  temperature = 0.5,
  maxTokens = 300,
}: DyslexiaModeDemoProps = {}) {
  const [originalText] = useState(defaultText)
  const [displayText, setDisplayText] = useState(defaultText)
  const [settings, setSettings] = useState<DyslexiaSettings>({
    largerSpacing: false,
    shorterLines: false,
    simplifiedText: false,
    fontSize: defaultFontSize,
    lineHeight: defaultLineHeight
  })
  const [isSimplifying, setIsSimplifying] = useState(false)

  const simplifyText = async () => {

    setIsSimplifying(true)
    try {
      const result = await generateText({
        prompt: `Rewrite this text to be more dyslexia-friendly:
- Use shorter, simpler sentences
- Replace complex words with simpler alternatives
- Break up long paragraphs
- Maintain the same meaning

Original text:
"${originalText}"

Simplified text:`,
        temperature,
        maxTokens,
      })

      setDisplayText(result.text.trim())
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSimplifying(false)
    }
  }

  const handleSettingChange = async (key: keyof DyslexiaSettings, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    if (key === "simplifiedText") {
      if (value) {
        await simplifyText()
      } else {
        setDisplayText(originalText)
      }
    }
  }

  const getTextStyle = (): React.CSSProperties => ({
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    letterSpacing: settings.largerSpacing ? "0.12em" : "normal",
    wordSpacing: settings.largerSpacing ? "0.16em" : "normal",
    maxWidth: settings.shorterLines ? "45ch" : "100%",
    fontFamily: "system-ui, -apple-system, sans-serif"
  })

  const reset = () => {
    setSettings({
      largerSpacing: false,
      shorterLines: false,
      simplifiedText: false,
      fontSize: defaultFontSize,
      lineHeight: defaultLineHeight
    })
    setDisplayText(originalText)
  }

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Dyslexia-Friendly Settings
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle Settings */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="spacing" className="text-sm">Larger Spacing</Label>
              <Switch
                id="spacing"
                checked={settings.largerSpacing}
                onCheckedChange={(v) => handleSettingChange("largerSpacing", v)}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="lines" className="text-sm">Shorter Lines</Label>
              <Switch
                id="lines"
                checked={settings.shorterLines}
                onCheckedChange={(v) => handleSettingChange("shorterLines", v)}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="simplify" className="text-sm">Simplify Text</Label>
              <Switch
                id="simplify"
                checked={settings.simplifiedText}
                onCheckedChange={(v) => handleSettingChange("simplifiedText", v)}
                disabled={isSimplifying}
              />
            </div>
          </div>

          {/* Sliders */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-1">
                  <Type className="h-3 w-3" /> Font Size
                </Label>
                <Badge variant="secondary">{settings.fontSize}px</Badge>
              </div>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([v]) => handleSettingChange("fontSize", v)}
                min={14}
                max={24}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-1">
                  <AlignLeft className="h-3 w-3" /> Line Height
                </Label>
                <Badge variant="secondary">{settings.lineHeight}</Badge>
              </div>
              <Slider
                value={[settings.lineHeight]}
                onValueChange={([v]) => handleSettingChange("lineHeight", v)}
                min={1.2}
                max={2.5}
                step={0.1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Display */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Preview</CardTitle>
            {isSimplifying && (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Simplifying...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 transition-all duration-300"
            style={getTextStyle()}
          >
            {displayText.split('\n\n').map((paragraph, index) => (
              <p key={index} className={index > 0 ? "mt-4" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Settings */}
      <div className="flex flex-wrap gap-2 justify-center">
        {settings.largerSpacing && <Badge variant="outline">Larger Spacing</Badge>}
        {settings.shorterLines && <Badge variant="outline">Shorter Lines</Badge>}
        {settings.simplifiedText && <Badge variant="outline">Simplified</Badge>}
        {settings.fontSize !== defaultFontSize && <Badge variant="outline">{settings.fontSize}px Font</Badge>}
        {settings.lineHeight !== defaultLineHeight && <Badge variant="outline">{settings.lineHeight} Line Height</Badge>}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Adjust settings to find your most comfortable reading experience
      </p>
    </div>
  )
}
