"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AIAvatar } from "@/registry/ui/ai-avatar"

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The message content */
  message: string
  /** Role of the message sender */
  role: "user" | "assistant"
  /** Avatar image source */
  avatar?: string
  /** Timestamp of the message */
  timestamp?: Date
  /** Whether the message is currently streaming */
  isStreaming?: boolean
  /** Show avatar */
  showAvatar?: boolean
  /** Variant for styling */
  variant?: "default" | "minimal"
}

export function ChatBubble({
  message,
  role,
  avatar,
  timestamp,
  isStreaming = false,
  showAvatar = true,
  variant = "default",
  className,
  ...props
}: ChatBubbleProps) {
  const isUser = role === "user"

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
      {...props}
    >
      {showAvatar && (
        <AIAvatar
          src={avatar}
          isAI={!isUser}
          isThinking={isStreaming && !isUser}
          fallback={isUser ? "U" : "AI"}
          className="shrink-0"
        />
      )}

      <div
        className={cn(
          "flex flex-col",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
            variant === "default" && [
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
            ],
            variant === "minimal" && [
              isUser
                ? "bg-primary/10 text-foreground"
                : "bg-transparent text-foreground",
            ]
          )}
        >
          <p className="whitespace-pre-wrap break-words">
            {message}
            {isStreaming && (
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
            )}
          </p>
        </div>

        {timestamp && (
          <span className="mt-1 text-xs text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}
