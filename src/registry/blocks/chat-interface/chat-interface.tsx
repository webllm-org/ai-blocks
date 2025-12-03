"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AIInput } from "@/registry/ui/ai-input"
import { MessageList, type Message } from "@/registry/ui/message-list"

export interface ChatInterfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial messages to display */
  initialMessages?: Message[]
  /** Callback when user sends a message */
  onSendMessage?: (message: string) => void | Promise<void>
  /** Whether the AI is currently generating a response */
  isLoading?: boolean
  /** Callback to stop generation */
  onStop?: () => void
  /** Placeholder for the input */
  placeholder?: string
  /** Show file attachments button */
  showAttachments?: boolean
  /** Callback when files are attached */
  onAttach?: (files: FileList) => void
  /** Show avatars on messages */
  showAvatars?: boolean
  /** Empty state content */
  emptyState?: React.ReactNode
  /** System prompt to display */
  systemPrompt?: string
}

export function ChatInterface({
  initialMessages = [],
  onSendMessage,
  isLoading = false,
  onStop,
  placeholder = "Type a message...",
  showAttachments = false,
  onAttach,
  showAvatars = true,
  emptyState,
  systemPrompt,
  className,
  ...props
}: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [streamingMessageId, setStreamingMessageId] = React.useState<string>()

  // Sync with initialMessages changes
  React.useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    onSendMessage?.(content)
  }

  // Allow external control of messages via ref or callbacks
  const addMessage = React.useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const updateMessage = React.useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    )
  }, [])

  const setStreaming = React.useCallback((messageId: string | undefined) => {
    setStreamingMessageId(messageId)
  }, [])

  // Expose methods via data attributes for external access
  React.useEffect(() => {
    const el = document.querySelector('[data-chat-interface]') as HTMLElement | null
    if (el) {
      ;(el as any).__chatMethods = { addMessage, updateMessage, setStreaming }
    }
  }, [addMessage, updateMessage, setStreaming])

  return (
    <div
      data-chat-interface
      className={cn("flex h-full flex-col", className)}
      {...props}
    >
      {systemPrompt && (
        <div className="border-b bg-muted/50 px-4 py-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">System:</span> {systemPrompt}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isStreaming={isLoading}
          streamingMessageId={streamingMessageId}
          showAvatars={showAvatars}
          emptyState={emptyState}
          className="h-full"
        />
      </div>

      <div className="border-t p-4">
        <AIInput
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          onStop={onStop}
          placeholder={placeholder}
          showAttachments={showAttachments}
          onAttach={onAttach}
        />
      </div>
    </div>
  )
}
