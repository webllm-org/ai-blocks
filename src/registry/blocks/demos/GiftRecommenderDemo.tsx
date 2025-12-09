"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Loader2, Gift, Heart, RefreshCw, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface GiftIdea {
  name: string
  description: string
  priceRange: string
  matchScore: number
  whyTheyLoveIt: string
  whereToBuy: string
  category: string
}

export interface GiftRecommenderDemoProps {
  /** Default recipient description */
  defaultRecipient?: string
}

export function GiftRecommenderDemo({
  defaultRecipient = "My mom, 55 years old. She loves gardening, reading mystery novels, and cooking Italian food. She's practical and doesn't like wasteful gifts.",
}: GiftRecommenderDemoProps = {}) {
  const [recipient, setRecipient] = useState(defaultRecipient)
  const [occasion, setOccasion] = useState("birthday")
  const [budget, setBudget] = useState([75])
  const [ideas, setIdeas] = useState<GiftIdea[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!recipient.trim()) return
    setIsLoading(true)
    setIdeas([])

    try {
      const response = await generateText({
        prompt: `Suggest thoughtful gift ideas:

Recipient: ${recipient}
Occasion: ${occasion}
Budget: around $${budget[0]}

Generate 5 personalized gift ideas that match their interests and personality.

Return as JSON array:
[
  {
    "name": "Gift name",
    "description": "Brief description of the gift",
    "priceRange": "$50-75",
    "matchScore": 95,
    "whyTheyLoveIt": "Why this is perfect for them specifically",
    "whereToBuy": "Amazon, local bookstore, etc.",
    "category": "hobby/experience/practical/sentimental"
  }
]

Be creative and specific to their interests. Avoid generic suggestions.`,
        maxTokens: 600,
      })

      const parsed = JSON.parse(response.text)
      if (Array.isArray(parsed)) {
        setIdeas(parsed.sort((a, b) => b.matchScore - a.matchScore))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      hobby: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      experience: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      practical: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      sentimental: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Tell me about the recipient</Label>
          <Textarea
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Age, interests, hobbies, personality traits..."
            rows={3}
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Occasion</Label>
          <div className="flex flex-wrap gap-2">
            {["birthday", "anniversary", "holiday", "thank you", "just because"].map((occ) => (
              <Badge
                key={occ}
                variant={occasion === occ ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setOccasion(occ)}
              >
                {occ}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Budget</Label>
            <span className="text-sm font-medium">${budget[0]}</span>
          </div>
          <Slider
            value={budget}
            onValueChange={setBudget}
            min={20}
            max={500}
            step={10}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$20</span>
            <span>$500</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !recipient.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Finding gifts...
          </>
        ) : (
          <>
            <Gift className="h-4 w-4 mr-2" />
            Get Gift Ideas
          </>
        )}
      </Button>

      {ideas.length > 0 && (
        <div className="space-y-3">
          {ideas.map((idea, i) => (
            <Card key={i} className={cn(i === 0 && "ring-2 ring-primary")}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {i === 0 && <Heart className="h-4 w-4 text-red-500 fill-red-500" />}
                      <h3 className="font-medium">{idea.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {idea.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{idea.priceRange}</p>
                    <Badge className={getCategoryColor(idea.category)}>
                      {idea.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-2 bg-primary/5 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Why they'll love it:</span>{" "}
                    {idea.whyTheyLoveIt}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Match: <span className="font-medium text-foreground">{idea.matchScore}%</span>
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {idea.whereToBuy}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={handleGenerate}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Get More Ideas
          </Button>
        </div>
      )}
    </div>
  )
}
