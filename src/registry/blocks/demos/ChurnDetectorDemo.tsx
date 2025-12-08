"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, UserMinus, AlertTriangle, TrendingDown, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChurnAnalysis {
  riskLevel: "low" | "medium" | "high" | "critical"
  riskScore: number
  signals: { signal: string; severity: "low" | "medium" | "high"; description: string }[]
  recommendations: string[]
  timeframe: string
}

export interface ChurnDetectorDemoProps {
  /** Default customer data */
  defaultData?: string
}

export function ChurnDetectorDemo({
  defaultData = `Customer: Sarah M.
Account age: 18 months
Subscription: Pro plan ($49/month)
Last login: 2 weeks ago
Usage last 30 days: 3 sessions (down from 20/month average)
Support tickets: 2 open (billing question, feature request)
Last feature used: Basic dashboard only
Email engagement: Hasn't opened last 4 emails
Payment: Credit card expiring next month`,
}: ChurnDetectorDemoProps = {}) {
  const [customerData, setCustomerData] = useState(defaultData)
  const [analysis, setAnalysis] = useState<ChurnAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!customerData.trim()) return
    setIsLoading(true)
    setAnalysis(null)

    try {
      const response = await generateText({
        prompt: `Analyze this customer data for churn risk:

${customerData}

Identify warning signals and provide actionable recommendations.

Return as JSON:
{
  "riskLevel": "low|medium|high|critical",
  "riskScore": 75,
  "signals": [
    {
      "signal": "Signal name",
      "severity": "low|medium|high",
      "description": "Why this indicates churn risk"
    }
  ],
  "recommendations": ["Specific action to retain this customer"],
  "timeframe": "When action is needed (e.g., 'within 7 days')"
}

Be specific about the signals you detect and why they matter.`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(response.text)
      setAnalysis(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      default:
        return "text-blue-600"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Customer data</Label>
        <Textarea
          value={customerData}
          onChange={(e) => setCustomerData(e.target.value)}
          placeholder="Paste customer data, activity logs, or describe customer behavior..."
          rows={8}
          className="text-sm"
        />
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={isLoading || !customerData.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <UserMinus className="h-4 w-4 mr-2" />
            Detect Churn Risk
          </>
        )}
      </Button>

      {analysis && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-lg px-3 py-1", getRiskColor(analysis.riskLevel))}>
                  {analysis.riskLevel.toUpperCase()} RISK
                </Badge>
                {analysis.riskLevel === "critical" && (
                  <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{analysis.riskScore}%</p>
                <p className="text-xs text-muted-foreground">churn probability</p>
              </div>
            </div>

            <div className="space-y-1">
              <Progress
                value={analysis.riskScore}
                className={cn(
                  "h-3",
                  analysis.riskScore >= 75 && "[&>div]:bg-red-500",
                  analysis.riskScore >= 50 && analysis.riskScore < 75 && "[&>div]:bg-orange-500",
                  analysis.riskScore >= 25 && analysis.riskScore < 50 && "[&>div]:bg-yellow-500",
                  analysis.riskScore < 25 && "[&>div]:bg-green-500"
                )}
              />
              <p className="text-xs text-muted-foreground">
                Action needed: {analysis.timeframe}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Warning Signals</span>
              </div>
              {analysis.signals.map((signal, i) => (
                <div key={i} className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{signal.signal}</span>
                    <Badge variant="outline" className={cn("text-xs", getSeverityColor(signal.severity))}>
                      {signal.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{signal.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Retention Actions</span>
              </div>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold">{i + 1}.</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
