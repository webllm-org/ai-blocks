"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Cookie, RefreshCw, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Fortune {
  fortune: string
  luckyNumbers: number[]
  chineseWord: { word: string; pinyin: string; meaning: string }
  mood: string
}

export interface FortuneCookieDemoProps {
  /** Default state */
  isCracked?: boolean
}

export function FortuneCookieDemo({
  isCracked = false,
}: FortuneCookieDemoProps = {}) {
  const [fortune, setFortune] = useState<Fortune | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cracked, setCracked] = useState(isCracked)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleCrack = async () => {
    setIsAnimating(true)
    setIsLoading(true)

    // Animation delay
    await new Promise(resolve => setTimeout(resolve, 500))
    setCracked(true)

    try {
      const response = await generateText({
        prompt: `Generate a fortune cookie fortune.

Requirements:
- Sound wise but slightly cryptic
- Be positive or inspirational
- Could apply to anyone but feel personal
- Mix of traditional wisdom and modern life
- Keep it short (1-2 sentences max)

Return as JSON:
{
  "fortune": "The fortune message (short and wise)",
  "luckyNumbers": [7, 14, 23, 38, 42],
  "chineseWord": {
    "word": "希望",
    "pinyin": "xī wàng",
    "meaning": "hope"
  },
  "mood": "One word describing today's energy"
}

Make it feel authentic like a real fortune cookie!`,
        maxTokens: 200,
      })

      const parsed = JSON.parse(response.text)
      setFortune(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
      setIsAnimating(false)
    }
  }

  const handleReset = () => {
    setCracked(false)
    setFortune(null)
  }

  const handleShare = async () => {
    if (!fortune) return
    const text = `🥠 My Fortune Cookie:\n\n"${fortune.fortune}"\n\n🔢 Lucky numbers: ${fortune.luckyNumbers.join(", ")}\n📖 Learn Chinese: ${fortune.chineseWord.word} (${fortune.chineseWord.pinyin}) = ${fortune.chineseWord.meaning}`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard!")
    }
  }

  return (
    <div className="space-y-4 w-full max-w-sm mx-auto">
      <div className="text-center">
        <div
          className={cn(
            "text-8xl transition-transform duration-500 cursor-pointer",
            isAnimating && "animate-bounce",
            cracked ? "rotate-12" : "hover:scale-110"
          )}
          onClick={!cracked ? handleCrack : undefined}
        >
          🥠
        </div>
        {!cracked && !isLoading && (
          <p className="text-sm text-muted-foreground mt-2">
            Click the cookie to crack it open!
          </p>
        )}
      </div>

      {!cracked ? (
        <Button
          onClick={handleCrack}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cracking...
            </>
          ) : (
            <>
              <Cookie className="h-4 w-4 mr-2" />
              Crack the Cookie
            </>
          )}
        </Button>
      ) : fortune ? (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-lg font-medium italic leading-relaxed">
                "{fortune.fortune}"
              </p>
            </div>

            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm">
                ✨ {fortune.mood}
              </Badge>
            </div>

            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Lucky Numbers</p>
              <div className="flex justify-center gap-2">
                {fortune.luckyNumbers.map((num, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Learn Chinese</p>
              <p className="text-2xl">{fortune.chineseWord.word}</p>
              <p className="text-sm text-muted-foreground">
                {fortune.chineseWord.pinyin}
              </p>
              <p className="text-sm font-medium">{fortune.chineseWord.meaning}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Cookie
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Reading your fortune...</p>
        </div>
      )}
    </div>
  )
}
