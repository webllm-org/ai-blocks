"use client"

import { useCloudAuth } from "@webllm/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, Cloud, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CloudLoginButtonProps {
  /** Optional OAuth app client ID for branding/analytics */
  clientId?: string
  /** Button size variant */
  size?: "default" | "sm" | "lg" | "icon"
  /** Additional class names */
  className?: string
}

/**
 * CloudLoginButton
 *
 * A simple button for WebLLM Cloud authentication.
 * - When disconnected: Shows "Connect Cloud" button
 * - When connected: Shows green glowing dot with dropdown to disconnect
 *
 * @example Basic usage
 * ```tsx
 * <CloudLoginButton />
 * ```
 *
 * @example With registered app
 * ```tsx
 * <CloudLoginButton clientId="your_app_client_id" />
 * ```
 */
export function CloudLoginButton({
  clientId,
  size = "default",
  className,
}: CloudLoginButtonProps) {
  const { connected, loading, connect, disconnect } = useCloudAuth({
    clientId,
  })

  // Loading state
  if (loading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {size !== "icon" && <span className="ml-2">Connecting...</span>}
      </Button>
    )
  }

  // Connected state - show green dot with dropdown
  if (connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={size}
            className={cn("relative", className)}
          >
            <Cloud className="h-4 w-4" />
            {/* Green glowing dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            {size !== "icon" && <span className="ml-2">Cloud</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => disconnect({ revokeToken: true })}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect Cloud
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Disconnected state - show connect button
  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => connect()}
      className={className}
    >
      <Cloud className="h-4 w-4" />
      {size !== "icon" && <span className="ml-2">Connect Cloud</span>}
    </Button>
  )
}
