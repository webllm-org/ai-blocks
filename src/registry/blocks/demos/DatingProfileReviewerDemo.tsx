"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Heart, ThumbsUp, ThumbsDown, Lightbulb, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileReview {
  overallScore: number
  vibe: string
  strengths: string[]
  redFlags: string[]
  suggestions: { original: string; improved: string }[]
  firstImpressions: string
}

export interface DatingProfileReviewerDemoProps {
  /** Default profile text */
  defaultProfile?: string
}

export function DatingProfileReviewerDemo({
  defaultProfile = `Hey there! I'm just a chill guy who loves adventures and trying new things. I work hard and play hard. Looking for someone who can keep up with me.

In my free time I like:
- Netflix
- Gym
- Hanging with friends
- Food

If you can make me laugh, you're already winning. Message me if you're not boring!`,
}: DatingProfileReviewerDemoProps = {}) {
  const [profileText, setProfileText] = useState(defaultProfile)
  const [review, setReview] = useState<ProfileReview | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReview = async () => {
    if (!profileText.trim()) return
    setIsLoading(true)
    setReview(null)

    try {
      const response = await generateText({
        prompt: `Review this dating profile and give constructive feedback:

"${profileText}"

Analyze for:
- Authenticity and uniqueness
- Red flags or clichés
- Conversation starters
- Overall appeal

Return as JSON:
{
  "overallScore": 65,
  "vibe": "One word describing the vibe",
  "strengths": ["What works well (be specific)", "Another strength"],
  "redFlags": ["Clichés or issues", "Things that might turn people off"],
  "suggestions": [
    {
      "original": "A specific phrase that could be improved",
      "improved": "A better version of that phrase"
    }
  ],
  "firstImpressions": "What someone would think in the first 3 seconds"
}

Be honest but constructive. Help them improve their profile.`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(response.text)
      setReview(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "💘 Swipe right material!"
    if (score >= 60) return "👍 Good, with room to improve"
    if (score >= 40) return "😐 Needs some work"
    return "😬 Major overhaul needed"
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Paste your dating profile</Label>
        <Textarea
          value={profileText}
          onChange={(e) => setProfileText(e.target.value)}
          placeholder="Paste your dating profile bio here..."
          rows={6}
        />
      </div>

      <Button
        onClick={handleReview}
        disabled={isLoading || !profileText.trim()}
        className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Heart className="h-4 w-4 mr-2" />
            Review My Profile
          </>
        )}
      </Button>

      {review && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="text-center">
              <p className={cn("text-4xl font-bold", getScoreColor(review.overallScore))}>
                {review.overallScore}/100
              </p>
              <Progress
                value={review.overallScore}
                className={cn(
                  "h-2 mt-2",
                  review.overallScore >= 80 && "[&>div]:bg-green-500",
                  review.overallScore >= 60 && review.overallScore < 80 && "[&>div]:bg-yellow-500",
                  review.overallScore < 60 && "[&>div]:bg-red-500"
                )}
              />
              <p className="text-sm mt-2">{getScoreLabel(review.overallScore)}</p>
              <Badge variant="outline" className="mt-2">Vibe: {review.vibe}</Badge>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">First impression:</p>
              <p className="text-sm italic">"{review.firstImpressions}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">What's Working</span>
                </div>
                <ul className="space-y-1">
                  {review.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      ✓ {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1 text-red-600">
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Red Flags</span>
                </div>
                <ul className="space-y-1">
                  {review.redFlags.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      ✗ {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {review.suggestions.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Suggested Improvements</span>
                </div>
                {review.suggestions.map((suggestion, i) => (
                  <div key={i} className="p-3 bg-muted rounded-lg space-y-2">
                    <p className="text-xs">
                      <span className="text-muted-foreground">Instead of: </span>
                      <span className="line-through">"{suggestion.original}"</span>
                    </p>
                    <p className="text-xs">
                      <span className="text-green-600">Try: </span>
                      <span className="font-medium">"{suggestion.improved}"</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleReview}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
