"use client"

import { useState } from "react"
import { useCloudAuth } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Cloud,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Settings
} from "lucide-react"

/**
 * CloudAuthButtonDemo
 *
 * Shows various button styles for cloud authentication.
 * Use cases:
 * - Header auth buttons
 * - Inline connect CTAs
 * - Account dropdown menus
 */
export function CloudAuthButtonDemo() {
  const {
    connected,
    loading,
    error,
    connect,
    disconnect,
    status
  } = useCloudAuth()

  return (
    <div className="space-y-6 w-full max-w-xl mx-auto">
      {/* Simple Button */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Simple Button</CardTitle>
          <CardDescription>Basic connect/disconnect button</CardDescription>
        </CardHeader>
        <CardContent>
          <CloudAuthButton
            connected={connected}
            loading={loading}
            onConnect={() => connect()}
            onDisconnect={() => disconnect({ revokeToken: true })}
          />
          {error && (
            <p className="text-xs text-destructive mt-2">{error.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Icon Button */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Icon Button</CardTitle>
          <CardDescription>Compact icon-only variant for toolbars</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CloudAuthIconButton
              connected={connected}
              loading={loading}
              onConnect={() => connect()}
              onDisconnect={() => disconnect({ revokeToken: true })}
            />
            <Badge variant={connected ? "default" : "secondary"}>
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Dropdown Menu */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account Dropdown</CardTitle>
          <CardDescription>For navigation bars and headers</CardDescription>
        </CardHeader>
        <CardContent>
          <CloudAuthDropdown
            connected={connected}
            loading={loading}
            gatewayUrl={status.gatewayUrl}
            onConnect={() => connect()}
            onDisconnect={() => disconnect({ revokeToken: true })}
          />
        </CardContent>
      </Card>

      {/* Status Badge */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status Badge</CardTitle>
          <CardDescription>Connection status indicator with details</CardDescription>
        </CardHeader>
        <CardContent>
          <CloudStatusBadge
            connected={connected}
            loading={loading}
            gatewayUrl={status.gatewayUrl}
            expiresAt={status.expiresAt}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Simple connect/disconnect button
 */
function CloudAuthButton({
  connected,
  loading,
  onConnect,
  onDisconnect,
}: {
  connected: boolean
  loading: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  if (connected) {
    return (
      <Button variant="outline" onClick={onDisconnect} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Cloud className="h-4 w-4 mr-2 text-green-500" />
        )}
        Cloud Connected
        <LogOut className="h-3 w-3 ml-2 opacity-50" />
      </Button>
    )
  }

  return (
    <Button onClick={onConnect} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Cloud className="h-4 w-4 mr-2" />
      )}
      Connect to Cloud
    </Button>
  )
}

/**
 * Icon-only button variant
 */
function CloudAuthIconButton({
  connected,
  loading,
  onConnect,
  onDisconnect,
}: {
  connected: boolean
  loading: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  if (connected) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onDisconnect}
        className="text-green-600 hover:text-green-700"
        title="Disconnect from cloud"
      >
        <Cloud className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onConnect}
      title="Connect to cloud"
    >
      <Cloud className="h-4 w-4" />
    </Button>
  )
}

/**
 * Dropdown menu for account management
 */
function CloudAuthDropdown({
  connected,
  loading,
  gatewayUrl,
  onConnect,
  onDisconnect,
}: {
  connected: boolean
  loading: boolean
  gatewayUrl?: string
  onConnect: () => void
  onDisconnect: () => void
}) {
  if (!connected) {
    return (
      <Button variant="outline" onClick={onConnect} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4 mr-2" />
        )}
        Sign in
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <User className="h-4 w-4 mr-2" />
          )}
          Account
          <ChevronDown className="h-3 w-3 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">WebLLM Cloud</span>
          </div>
          {gatewayUrl && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {gatewayUrl}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDisconnect}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Status badge with connection details
 */
function CloudStatusBadge({
  connected,
  loading,
  gatewayUrl,
  expiresAt,
}: {
  connected: boolean
  loading: boolean
  gatewayUrl?: string
  expiresAt?: number
}) {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Connecting...</span>
      </div>
    )
  }

  if (connected) {
    const timeRemaining = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))

    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
        <CheckCircle2 className="h-3 w-3" />
        <span>Connected</span>
        {gatewayUrl && (
          <span className="opacity-60 text-xs">
            {gatewayUrl.replace('https://', '').split('/')[0]}
          </span>
        )}
        {hoursRemaining > 0 && (
          <span className="opacity-60 text-xs">
            ({hoursRemaining}h left)
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
      <AlertCircle className="h-3 w-3" />
      <span>Not connected</span>
    </div>
  )
}
