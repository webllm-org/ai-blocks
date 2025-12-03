"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AIAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Avatar image source */
  src?: string
  /** Alt text for the avatar image */
  alt?: string
  /** Fallback text when no image (typically initials) */
  fallback?: string
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Whether this is an AI/assistant avatar */
  isAI?: boolean
  /** Show typing/thinking indicator */
  isThinking?: boolean
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
}

export function AIAvatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  isAI = false,
  isThinking = false,
  className,
  ...props
}: AIAvatarProps) {
  const [imageError, setImageError] = React.useState(false)

  const showFallback = !src || imageError

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        isAI ? "bg-primary text-primary-foreground" : "bg-muted",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-medium">
          {fallback || (isAI ? "AI" : "U")}
        </span>
      )}

      {isThinking && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
        </span>
      )}
    </div>
  )
}
