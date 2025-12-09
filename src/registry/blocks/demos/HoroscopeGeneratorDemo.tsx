"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, RefreshCw, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Horoscope {
  prediction: string
  luckyNumber: number
  luckyColor: string
  advice: string
  compatibility: string
  mood: string
}

const ZODIAC_SIGNS = [
  { id: "aries", label: "Aries", emoji: "♈", dates: "Mar 21 - Apr 19" },
  { id: "taurus", label: "Taurus", emoji: "♉", dates: "Apr 20 - May 20" },
  { id: "gemini", label: "Gemini", emoji: "♊", dates: "May 21 - Jun 20" },
  { id: "cancer", label: "Cancer", emoji: "♋", dates: "Jun 21 - Jul 22" },
  { id: "leo", label: "Leo", emoji: "♌", dates: "Jul 23 - Aug 22" },
  { id: "virgo", label: "Virgo", emoji: "♍", dates: "Aug 23 - Sep 22" },
  { id: "libra", label: "Libra", emoji: "♎", dates: "Sep 23 - Oct 22" },
  { id: "scorpio", label: "Scorpio", emoji: "♏", dates: "Oct 23 - Nov 21" },
  { id: "sagittarius", label: "Sagittarius", emoji: "♐", dates: "Nov 22 - Dec 21" },
  { id: "capricorn", label: "Capricorn", emoji: "♑", dates: "Dec 22 - Jan 19" },
  { id: "aquarius", label: "Aquarius", emoji: "♒", dates: "Jan 20 - Feb 18" },
  { id: "pisces", label: "Pisces", emoji: "♓", dates: "Feb 19 - Mar 20" },
]

export interface HoroscopeGeneratorDemoProps {
  /** Default zodiac sign */
  defaultSign?: string
}

export function HoroscopeGeneratorDemo({
  defaultSign = "leo",
}: HoroscopeGeneratorDemoProps = {}) {
  const [sign, setSign] = useState(defaultSign)
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setHoroscope(null)

    const signInfo = ZODIAC_SIGNS.find(z => z.id === sign)

    try {
      const response = await generateText({
        prompt: `Generate a fun, entertaining daily horoscope for ${signInfo?.label} (${signInfo?.emoji}).

Make it:
- Vague enough to apply to anyone but feel personal
- Mix of career, love, and general life advice
- Entertaining with a touch of mysticism
- Include a specific but random detail for authenticity

Return as JSON:
{
  "prediction": "The main horoscope reading (3-4 sentences)",
  "luckyNumber": 7,
  "luckyColor": "Emerald green",
  "advice": "One piece of actionable advice",
  "compatibility": "Another zodiac sign that's compatible today",
  "mood": "Overall mood/energy for the day"
}

Be creative and fun, like a real horoscope writer!`,
        maxTokens: 350,
      })

      const parsed = JSON.parse(response.text)
      setHoroscope(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!horoscope) return
    const signInfo = ZODIAC_SIGNS.find(z => z.id === sign)
    const text = `${signInfo?.emoji} ${signInfo?.label} Daily Horoscope\n\n${horoscope.prediction}\n\n✨ Lucky number: ${horoscope.luckyNumber}\n🎨 Lucky color: ${horoscope.luckyColor}`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard!")
    }
  }

  const currentSign = ZODIAC_SIGNS.find(z => z.id === sign)

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Select your zodiac sign</Label>
        <div className="grid grid-cols-4 gap-2">
          {ZODIAC_SIGNS.map((zodiac) => (
            <Button
              key={zodiac.id}
              variant={sign === zodiac.id ? "default" : "outline"}
              onClick={() => setSign(zodiac.id)}
              className="flex flex-col h-auto py-2 px-1"
            >
              <span className="text-xl">{zodiac.emoji}</span>
              <span className="text-xs">{zodiac.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Reading the stars...
          </>
        ) : (
          <>
            <Star className="h-4 w-4 mr-2" />
            Get Today's Horoscope
          </>
        )}
      </Button>

      {horoscope && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
          <CardContent className="p-4 space-y-4">
            <div className="text-center">
              <span className="text-5xl">{currentSign?.emoji}</span>
              <h3 className="text-xl font-bold mt-2">{currentSign?.label}</h3>
              <p className="text-xs text-muted-foreground">{currentSign?.dates}</p>
            </div>

            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg">
              <p className="text-sm leading-relaxed">{horoscope.prediction}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Lucky Number</p>
                <p className="text-2xl font-bold">{horoscope.luckyNumber}</p>
              </div>
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground">Lucky Color</p>
                <p className="font-medium">{horoscope.luckyColor}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Mood: </span>
                <span className="font-medium">{horoscope.mood}</span>
              </div>
              <Badge variant="outline">
                💕 {horoscope.compatibility}
              </Badge>
            </div>

            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Today's advice:</p>
              <p className="text-sm font-medium">{horoscope.advice}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleGenerate}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Reading
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
      )}
    </div>
  )
}
