"use client"

import { useState } from "react"
import { useWebLLMStatus } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  Settings,
  ExternalLink,
  X,
  Sparkles
} from "lucide-react"

/**
 * AvailabilityBannerDemo
 *
 * Shows contextual banners with action CTAs based on WebLLM status.
 * Use cases:
 * - Onboarding prompts
 * - Setup guidance
 * - Feature gates with helpful actions
 */
export function AvailabilityBannerDemo() {
  const { status, loading, available, details, message, refresh } = useWebLLMStatus()
  const [dismissed, setDismissed] = useState(false)

  if (loading) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Checking AI Availability</AlertTitle>
          <AlertDescription>
            Detecting WebLLM extension and configured providers...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Ready state - show success banner
  if (available) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700 dark:text-green-400">AI Features Ready</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-300">
            {message}
            {details?.providers && details.providers.count > 0 && (
              <span className="block mt-1 text-xs opacity-80">
                Providers: {details.providers.list.slice(0, 3).join(", ")}
                {details.providers.count > 3 && ` +${details.providers.count - 3} more`}
              </span>
            )}
          </AlertDescription>
        </Alert>

        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">
              Your app can now use AI-powered features
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dismissed state
  if (dismissed) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => setDismissed(false)} className="w-full">
          Show Setup Banner
        </Button>
      </div>
    )
  }

  // Not installed - show install CTA
  if (status === "not-installed") {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Alert className="border-blue-500/50 bg-blue-500/10 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
          <Download className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700 dark:text-blue-400">Enable AI Features</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-300">
            <p>Install the WebLLM extension to unlock AI-powered features in this app.</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" asChild>
                <a href={details?.browser.installUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 mr-2" />
                  Install Extension
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={refresh}>
                Already Installed?
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              This app works without AI features, but you'll have a better experience with them enabled.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No providers configured
  if (status === "no-providers") {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Alert className="border-yellow-500/50 bg-yellow-500/10 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-700 dark:text-yellow-400">Configure AI Provider</AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-300">
            <p>WebLLM is installed, but no AI providers are configured yet.</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm">
                <Settings className="h-3 w-3 mr-2" />
                Open Settings
              </Button>
              <Button size="sm" variant="outline" onClick={refresh}>
                Check Again
              </Button>
            </div>
            <p className="text-xs mt-2 opacity-80">
              Add an API key for OpenAI, Anthropic, or connect to Ollama
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Unsupported browser
  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <Alert variant="destructive" className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
        <XCircle className="h-4 w-4" />
        <AlertTitle>Browser Not Supported</AlertTitle>
        <AlertDescription>
          <p>{message}</p>
          <Button size="sm" variant="outline" className="mt-3" asChild>
            <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-2" />
              Get Chrome
            </a>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
