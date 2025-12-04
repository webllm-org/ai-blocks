"use client"

import { useWebLLMStatus } from "@webllm/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

/**
 * AvailabilityBadgeDemo
 *
 * Shows simple status pills/badges for WebLLM availability.
 * Use cases:
 * - Header status indicator
 * - Feature availability tags
 * - Quick status checks
 */
export function AvailabilityBadgeDemo() {
  const { status, loading, available, providers, refresh } = useWebLLMStatus()

  const getBadgeVariant = () => {
    if (loading) return "secondary"
    if (available) return "default"
    if (status === "no-providers") return "outline"
    return "destructive"
  }

  const getIcon = () => {
    if (loading) return <Loader2 className="h-3 w-3 animate-spin" />
    if (available) return <CheckCircle2 className="h-3 w-3" />
    if (status === "no-providers") return <AlertCircle className="h-3 w-3" />
    return <XCircle className="h-3 w-3" />
  }

  const getLabel = () => {
    if (loading) return "Checking..."
    if (available) return `AI Ready (${providers.length} provider${providers.length !== 1 ? "s" : ""})`
    if (status === "no-providers") return "No Providers"
    if (status === "not-installed") return "Extension Required"
    return "Not Supported"
  }

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status Badge Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Status:</span>
            <Badge variant={getBadgeVariant()} className="gap-1">
              {getIcon()}
              {getLabel()}
            </Badge>
          </div>

          {/* Compact variant */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Compact:</span>
            <Badge variant={getBadgeVariant()} className="gap-1 text-xs px-2 py-0">
              {getIcon()}
              {loading ? "..." : available ? "Ready" : "Unavailable"}
            </Badge>
          </div>

          {/* Icon only */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Icon Only:</span>
            <Badge variant={getBadgeVariant()} className="px-1.5">
              {getIcon()}
            </Badge>
          </div>

          {/* Dot indicator */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Dot Indicator:</span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                loading ? "bg-muted-foreground animate-pulse" :
                available ? "bg-green-500" :
                status === "no-providers" ? "bg-yellow-500" :
                "bg-red-500"
              }`} />
              <span className="text-sm">{loading ? "Checking" : available ? "Online" : "Offline"}</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={refresh} className="w-full mt-2">
            <RefreshCw className="h-3 w-3 mr-2" />
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Use these badge patterns to show AI availability status in your UI
      </p>
    </div>
  )
}
