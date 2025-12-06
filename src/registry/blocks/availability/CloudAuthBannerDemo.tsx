"use client"

import { useState } from "react"
import { useWebLLMStatus, useCloudAuth } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  Download,
  ExternalLink,
  X,
  Sparkles,
  Zap
} from "lucide-react"

/**
 * CloudAuthBannerDemo
 *
 * Shows contextual banners for cloud authentication status with action CTAs.
 * Use cases:
 * - Onboarding new users to cloud-powered AI
 * - Showing connection status
 * - One-click sign in to WebLLM Cloud
 */
export function CloudAuthBannerDemo() {
  const { status, loading, available, details, message, transport, refresh } = useWebLLMStatus()
  const {
    connected: cloudConnected,
    loading: cloudLoading,
    error: cloudError,
    connect,
    disconnect,
    status: cloudStatus
  } = useCloudAuth()
  const [dismissed, setDismissed] = useState(false)

  if (loading) {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Checking AI Availability</AlertTitle>
          <AlertDescription>
            Detecting cloud connection and extension status...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Connected to cloud - show success state
  if (cloudConnected && transport === 'cloud') {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Alert className="border-green-500/50 bg-green-500/10">
          <Cloud className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700 dark:text-green-400">
            Connected to WebLLM Cloud
          </AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-300">
            <p>You're connected and ready to use AI features.</p>
            {cloudStatus.gatewayUrl && (
              <span className="block mt-1 text-xs opacity-80">
                Gateway: {cloudStatus.gatewayUrl}
              </span>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => disconnect({ revokeToken: true })}
                disabled={cloudLoading}
              >
                <LogOut className="h-3 w-3 mr-2" />
                Disconnect
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">
              All AI capabilities are available via cloud
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ready via extension/daemon - show mixed state
  if (available && transport !== 'cloud') {
    return (
      <div className="space-y-4 w-full max-w-xl mx-auto">
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700 dark:text-green-400">AI Features Ready</AlertTitle>
          <AlertDescription className="text-green-600 dark:text-green-300">
            {message}
            {details?.providers && details.providers.count > 0 && (
              <span className="block mt-1 text-xs opacity-80">
                Using: {transport} transport
              </span>
            )}
          </AlertDescription>
        </Alert>

        {!cloudConnected && (
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Cloud className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Want to use WebLLM Cloud?
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Connect to cloud for access without API keys
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => connect()}
                    disabled={cloudLoading}
                  >
                    {cloudLoading ? (
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                      <LogIn className="h-3 w-3 mr-2" />
                    )}
                    Connect to Cloud
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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

  // Not available - show cloud connect CTA
  if (status === "cloud-available" || status === "not-installed") {
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
          <Cloud className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700 dark:text-blue-400">
            Enable AI Features
          </AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-300">
            <p>Sign in to WebLLM Cloud for instant AI access - no API keys needed.</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => connect()}
                disabled={cloudLoading}
              >
                {cloudLoading ? (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-3 w-3 mr-2" />
                )}
                Sign in to Cloud
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={details?.browser.installUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3 mr-2" />
                  Install Extension
                </a>
              </Button>
            </div>
            {cloudError && (
              <p className="text-xs mt-2 text-red-600 dark:text-red-400">
                {cloudError.message}
              </p>
            )}
          </AlertDescription>
        </Alert>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <Cloud className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-xs font-medium">Cloud</p>
                <p className="text-xs text-muted-foreground">No setup needed</p>
              </div>
              <div>
                <Zap className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-xs font-medium">Extension</p>
                <p className="text-xs text-muted-foreground">Bring your own keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No providers configured (extension installed but no providers)
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
          <AlertTitle className="text-yellow-700 dark:text-yellow-400">
            Configure AI Provider
          </AlertTitle>
          <AlertDescription className="text-yellow-600 dark:text-yellow-300">
            <p>WebLLM is installed, but no AI providers are configured.</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => connect()}
                disabled={cloudLoading}
              >
                {cloudLoading ? (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <Cloud className="h-3 w-3 mr-2" />
                )}
                Use Cloud Instead
              </Button>
              <Button size="sm" variant="outline" onClick={refresh}>
                Check Again
              </Button>
            </div>
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
