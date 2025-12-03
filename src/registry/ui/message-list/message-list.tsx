"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChatBubble, type ChatBubbleProps } from "@/registry/ui/chat-bubble"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  avatar?: string
}

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of messages to display */
  messages: Message[]
  /** Whether the AI is currently streaming a response */
  isStreaming?: boolean
  /** ID of the message currently being streamed */
  streamingMessageId?: string
  /** Show avatars on messages */
  showAvatars?: boolean
  /** Chat bubble variant */
  variant?: ChatBubbleProps["variant"]
  /** Empty state content */
  emptyState?: React.ReactNode
  /** Auto-scroll to bottom on new messages */
  autoScroll?: boolean
}

export function MessageList({
  messages,
  isStreaming = false,
  streamingMessageId,
  showAvatars = true,
  variant = "default",
  emptyState,
  autoScroll = true,
  className,
  ...props
}: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, autoScroll])

  if (messages.length === 0) {
    return (
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center p-4",
          className
        )}
        {...props}
      >
        {emptyState || (
          <p className="text-sm text-muted-foreground">
            Start a conversation...
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className={cn("flex flex-col gap-4 overflow-y-auto p-4", className)}
      {...props}
    >
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message.content}
          role={message.role}
          avatar={message.avatar}
          timestamp={message.timestamp}
          isStreaming={
            isStreaming && message.id === streamingMessageId
          }
          showAvatar={showAvatars}
          variant={variant}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
