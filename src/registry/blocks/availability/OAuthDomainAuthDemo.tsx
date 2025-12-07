"use client"

import { useState, useEffect } from "react"
import { useCloudAuth } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Cloud,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield,
  Globe,
  Key,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Info,
  Sparkles,
  Lock
} from "lucide-react"

/**
 * OAuthDomainAuthDemo
 *
 * Comprehensive demo showing how websites can implement OAuth to let users
 * connect their WebLLM Cloud accounts. Demonstrates:
 * - The OAuth authorization flow (popup and redirect)
 * - Domain-based authorization and restrictions
 * - Token lifecycle management
 * - Scope-based permissions
 * - Best practices for secure integration
 *
 * Use cases:
 * - SaaS apps wanting to add AI features using user's cloud credits
 * - B2C applications where users bring their own cloud account
 * - Internal tools that need secure, per-user AI access
 */
export function OAuthDomainAuthDemo() {
  const {
    connected,
    loading,
    error,
    connect,
    disconnect,
    status
  } = useCloudAuth()

  const [activeTab, setActiveTab] = useState<"flow" | "code" | "status">("flow")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">OAuth Domain Authorization</span>
        </div>
        <h2 className="text-2xl font-bold">Connect Your Cloud Account</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Allow this website to use your WebLLM Cloud credits for AI features.
          You control what permissions to grant.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flow">Live Demo</TabsTrigger>
          <TabsTrigger value="code">Integration</TabsTrigger>
          <TabsTrigger value="status">Token Status</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="flow" className="space-y-4 mt-4">
          {/* Current Connection Status */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Authorization Status
                </CardTitle>
                <Badge variant={connected ? "default" : "secondary"}>
                  {connected ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </>
                  )}
                </Badge>
              </div>
              <CardDescription>
                {connected
                  ? "This website has been authorized to use your WebLLM Cloud account."
                  : "Connect to allow this website to use AI features on your behalf."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connected ? (
                <>
                  {/* Connected State */}
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Gateway</span>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-mono">
                        {status.gatewayUrl?.replace('https://', '') || 'cloud.webllm.org'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Scopes</span>
                      </div>
                      <div className="flex gap-1">
                        {status.scopes?.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        )) || <Badge variant="outline" className="text-xs">inference</Badge>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Authorized Domain</span>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        {typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => disconnect({ revokeToken: false })}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4 mr-2" />
                      )}
                      Disconnect (Keep Token)
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => disconnect({ revokeToken: true })}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Revoke Access
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Not Connected State */}
                  <div className="space-y-4">
                    {/* What you're authorizing */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        What you're authorizing:
                      </h4>
                      <div className="grid gap-2">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">AI Inference</p>
                            <p className="text-xs text-muted-foreground">
                              Generate text, images, and other AI content using your credits
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Globe className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Domain-Specific</p>
                            <p className="text-xs text-muted-foreground">
                              Only this website ({typeof window !== 'undefined' ? window.location.hostname : 'example.com'}) can use your credentials
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Clock className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Time-Limited</p>
                            <p className="text-xs text-muted-foreground">
                              Access tokens expire and can be revoked anytime
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => connect()}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LogIn className="h-4 w-4 mr-2" />
                      )}
                      Connect WebLLM Cloud
                    </Button>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Connection Failed</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* OAuth Flow Explanation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Your App</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>OAuth Consent</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Key className="h-4 w-4 text-primary" />
                  <span>Token</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Cloud className="h-4 w-4 text-primary" />
                  <span>AI Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Code Tab */}
        <TabsContent value="code" className="space-y-4 mt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Developer Integration</AlertTitle>
            <AlertDescription>
              Add OAuth domain authorization to your app with just a few lines of code.
            </AlertDescription>
          </Alert>

          {/* Quick Start */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Start</CardTitle>
              <CardDescription>
                Use the useCloudAuth hook for the easiest integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeExample
                id="quick-start"
                language="tsx"
                code={`import { useCloudAuth } from '@webllm/client'

function CloudConnectButton() {
  const { connected, loading, connect, disconnect, error } = useCloudAuth()

  if (connected) {
    return (
      <button onClick={() => disconnect({ revokeToken: true })}>
        Disconnect
      </button>
    )
  }

  return (
    <>
      <button onClick={() => connect()} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Cloud'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </>
  )
}`}
                copied={copiedCode === "quick-start"}
                onCopy={() => copyToClipboard(`import { useCloudAuth } from '@webllm/client'

function CloudConnectButton() {
  const { connected, loading, connect, disconnect, error } = useCloudAuth()

  if (connected) {
    return (
      <button onClick={() => disconnect({ revokeToken: true })}>
        Disconnect
      </button>
    )
  }

  return (
    <>
      <button onClick={() => connect()} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Cloud'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </>
  )
}`, "quick-start")}
              />
            </CardContent>
          </Card>

          {/* Advanced: Custom Client ID */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Custom OAuth App</CardTitle>
              <CardDescription>
                Register your own OAuth app for production use with domain restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeExample
                id="custom-app"
                language="tsx"
                code={`import { connectCloud } from '@webllm/client'

// Connect with your registered OAuth app
const result = await connectCloud({
  // Your registered client ID
  clientId: 'webllm_your_app_id',

  // Gateway URL (defaults to cloud.webllm.org)
  gatewayUrl: 'https://cloud.webllm.org',

  // Requested scopes
  scopes: ['inference', 'inference:image'],

  // Your OAuth callback URL (must be registered)
  redirectUri: 'https://yourapp.com/oauth/callback',

  // Use popup (true) or redirect (false) flow
  usePopup: true,
})

console.log('Connected!', result.scopes)
console.log('Access token expires:', new Date(result.expiresAt))`}
                copied={copiedCode === "custom-app"}
                onCopy={() => copyToClipboard(`import { connectCloud } from '@webllm/client'

// Connect with your registered OAuth app
const result = await connectCloud({
  // Your registered client ID
  clientId: 'webllm_your_app_id',

  // Gateway URL (defaults to cloud.webllm.org)
  gatewayUrl: 'https://cloud.webllm.org',

  // Requested scopes
  scopes: ['inference', 'inference:image'],

  // Your OAuth callback URL (must be registered)
  redirectUri: 'https://yourapp.com/oauth/callback',

  // Use popup (true) or redirect (false) flow
  usePopup: true,
})

console.log('Connected!', result.scopes)
console.log('Access token expires:', new Date(result.expiresAt))`, "custom-app")}
              />

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Domain Restrictions</AlertTitle>
                <AlertDescription>
                  When you register an OAuth app, you specify allowed origins (e.g., https://yourapp.com).
                  Tokens are bound to the requesting domain, preventing misuse from other sites.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Redirect Flow */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Redirect Flow (SSR/Mobile)</CardTitle>
              <CardDescription>
                For server-rendered apps or when popups are blocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeExample
                id="redirect-flow"
                language="tsx"
                code={`// 1. Initiate redirect flow (on your main page)
import { connectCloud } from '@webllm/client'

await connectCloud({
  clientId: 'webllm_your_app_id',
  usePopup: false, // Use redirect instead
  redirectUri: 'https://yourapp.com/oauth/callback',
})
// User is redirected to OAuth consent page...

// 2. Handle callback (on your /oauth/callback page)
import { handleOAuthCallback } from '@webllm/client'

const result = await handleOAuthCallback()
if (result) {
  console.log('Connected!', result.scopes)
  // Redirect back to main app
  window.location.href = '/'
}`}
                copied={copiedCode === "redirect-flow"}
                onCopy={() => copyToClipboard(`// 1. Initiate redirect flow (on your main page)
import { connectCloud } from '@webllm/client'

await connectCloud({
  clientId: 'webllm_your_app_id',
  usePopup: false, // Use redirect instead
  redirectUri: 'https://yourapp.com/oauth/callback',
})
// User is redirected to OAuth consent page...

// 2. Handle callback (on your /oauth/callback page)
import { handleOAuthCallback } from '@webllm/client'

const result = await handleOAuthCallback()
if (result) {
  console.log('Connected!', result.scopes)
  // Redirect back to main app
  window.location.href = '/'
}`, "redirect-flow")}
              />
            </CardContent>
          </Card>

          {/* Using Cloud After Auth */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Using Cloud After Authentication</CardTitle>
              <CardDescription>
                Once connected, AI functions automatically use cloud credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeExample
                id="using-cloud"
                language="tsx"
                code={`import { generateText, isCloudConnected } from '@webllm/client'

// Check if user has connected their cloud account
if (isCloudConnected()) {
  // Requests automatically use the user's cloud credentials
  const result = await generateText({
    model: 'gpt-4o-mini',
    prompt: 'Explain quantum computing',
  })

  console.log(result.text)
} else {
  // Prompt user to connect
  showConnectCloudDialog()
}`}
                copied={copiedCode === "using-cloud"}
                onCopy={() => copyToClipboard(`import { generateText, isCloudConnected } from '@webllm/client'

// Check if user has connected their cloud account
if (isCloudConnected()) {
  // Requests automatically use the user's cloud credentials
  const result = await generateText({
    model: 'gpt-4o-mini',
    prompt: 'Explain quantum computing',
  })

  console.log(result.text)
} else {
  // Prompt user to connect
  showConnectCloudDialog()
}`, "using-cloud")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Token Status Tab */}
        <TabsContent value="status" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                Token Details
              </CardTitle>
              <CardDescription>
                Current OAuth token information and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connected ? (
                <div className="space-y-3">
                  <TokenDetail
                    label="Status"
                    value={
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    }
                  />
                  <TokenDetail
                    label="Gateway"
                    value={
                      <span className="font-mono text-sm">
                        {status.gatewayUrl || 'https://cloud.webllm.org'}
                      </span>
                    }
                  />
                  <TokenDetail
                    label="Scopes"
                    value={
                      <div className="flex gap-1 flex-wrap">
                        {(status.scopes || ['inference']).map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    }
                  />
                  <TokenDetail
                    label="Expires"
                    value={
                      status.expiresAt ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatExpiry(status.expiresAt)}
                          </span>
                          {status.isExpired && (
                            <Badge variant="destructive" className="text-xs">Expired</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unknown</span>
                      )
                    }
                  />
                  <TokenDetail
                    label="Domain"
                    value={
                      <span className="font-mono text-sm">
                        {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
                      </span>
                    }
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active token</p>
                  <p className="text-xs mt-1">Connect to WebLLM Cloud to see token details</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setActiveTab("flow")
                    }}
                  >
                    Go to Connect
                  </Button>
                </div>
              )}
            </CardContent>
            {connected && (
              <CardFooter className="flex-col gap-2">
                <Alert className="w-full">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Token Security</AlertTitle>
                  <AlertDescription className="text-xs">
                    Tokens are stored securely in localStorage and automatically refreshed before expiration.
                    Domain binding prevents tokens from being used by unauthorized websites.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            )}
          </Card>

          {/* Token Lifecycle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Token Lifecycle</CardTitle>
              <CardDescription>
                How OAuth tokens are managed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                    <Key className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Access Token</p>
                    <p className="text-xs text-muted-foreground">
                      Short-lived (1 hour). Used for API requests. Auto-refreshed.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30">
                    <Key className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Refresh Token</p>
                    <p className="text-xs text-muted-foreground">
                      Long-lived (90 days). Used to get new access tokens. Single-use rotation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                    <Shield className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Domain Binding</p>
                    <p className="text-xs text-muted-foreground">
                      Tokens are bound to the origin that requested them. Cannot be used from other domains.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Link */}
      <div className="text-center">
        <Button variant="link" asChild>
          <a href="/docs/cloud" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-2" />
            View Full Documentation
          </a>
        </Button>
      </div>
    </div>
  )
}

/**
 * Code example component with copy button
 */
function CodeExample({
  id,
  language,
  code,
  copied,
  onCopy
}: {
  id: string
  language: string
  code: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="relative">
      <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 text-xs overflow-x-auto">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-zinc-400 hover:text-zinc-100"
        onClick={onCopy}
      >
        {copied ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}

/**
 * Token detail row component
 */
function TokenDetail({
  label,
  value
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div>{value}</div>
    </div>
  )
}

/**
 * Format token expiry time
 */
function formatExpiry(expiresAt: number): string {
  const now = Date.now()
  const diff = expiresAt - now

  if (diff < 0) {
    return 'Expired'
  }

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h remaining`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m remaining`
  }
  return `${minutes}m remaining`
}
