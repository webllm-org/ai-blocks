"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Package, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface InventoryNarrative {
  status: "in_stock" | "low_stock" | "out_of_stock" | "pre_order"
  message: string
  urgency: "none" | "low" | "medium" | "high"
  details: string[]
  eta?: string
  alternatives?: string[]
}

const TONE_OPTIONS = [
  { id: "friendly", label: "Friendly", description: "Casual and approachable" },
  { id: "professional", label: "Professional", description: "Business formal" },
  { id: "urgent", label: "Urgent", description: "Create FOMO" },
  { id: "reassuring", label: "Reassuring", description: "Calm and helpful" },
]

export interface InventoryNarratorDemoProps {
  /** Default product name */
  defaultProduct?: string
  /** Default stock count */
  defaultStock?: string
}

export function InventoryNarratorDemo({
  defaultProduct = "Wireless Earbuds Pro",
  defaultStock = "3",
}: InventoryNarratorDemoProps = {}) {
  const [product, setProduct] = useState(defaultProduct)
  const [stockCount, setStockCount] = useState(defaultStock)
  const [tone, setTone] = useState("friendly")
  const [narrative, setNarrative] = useState<InventoryNarrative | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!product.trim()) return
    setIsLoading(true)
    setNarrative(null)

    const toneInfo = TONE_OPTIONS.find(t => t.id === tone)
    const count = parseInt(stockCount) || 0

    try {
      const response = await generateText({
        prompt: `Generate an inventory status message for an e-commerce product page:

Product: ${product}
Stock count: ${count}
Tone: ${toneInfo?.label} (${toneInfo?.description})

Create a compelling inventory message that informs customers about availability.

Return as JSON:
{
  "status": "in_stock|low_stock|out_of_stock|pre_order",
  "message": "The main inventory message to display",
  "urgency": "none|low|medium|high",
  "details": ["Additional info like shipping times", "Restock dates"],
  "eta": "Expected delivery or restock date if relevant",
  "alternatives": ["Suggested alternatives if out of stock"]
}

${count === 0 ? "Product is out of stock. Be helpful about alternatives or restock." : ""}
${count > 0 && count <= 5 ? "Low stock - create appropriate urgency based on tone." : ""}
${count > 5 ? "Good availability - reassure the customer." : ""}

Make the message natural and helpful, not robotic.`,
        maxTokens: 350,
      })

      const parsed = JSON.parse(response.text)
      setNarrative(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "low_stock":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "out_of_stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "pre_order":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Package className="h-5 w-5 text-green-600" />
      case "low_stock":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "out_of_stock":
        return <Clock className="h-5 w-5 text-red-600" />
      case "pre_order":
        return <TrendingUp className="h-5 w-5 text-blue-600" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const formatStatus = (status: string) => {
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">Product name</Label>
          <Input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Enter product name..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block">Stock count</Label>
            <Input
              type="number"
              min="0"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">Message tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !product.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Package className="h-4 w-4 mr-2" />
            Generate Status Message
          </>
        )}
      </Button>

      {narrative && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(narrative.status)}
              <div className="flex-1">
                <Badge className={getStatusColor(narrative.status)}>
                  {formatStatus(narrative.status)}
                </Badge>
                {narrative.urgency !== "none" && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {narrative.urgency} urgency
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{narrative.message}</p>
            </div>

            {narrative.details.length > 0 && (
              <ul className="space-y-1">
                {narrative.details.map((detail, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            {narrative.eta && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{narrative.eta}</span>
              </div>
            )}

            {narrative.alternatives && narrative.alternatives.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  You might also like:
                </p>
                <div className="flex flex-wrap gap-2">
                  {narrative.alternatives.map((alt, i) => (
                    <Badge key={i} variant="secondary">
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Preview of how this would appear on your product page
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
