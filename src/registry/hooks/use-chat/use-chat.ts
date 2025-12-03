"use client"

import * as React from "react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: Date
}

export interface UseChatOptions {
  /** Initial messages */
  initialMessages?: ChatMessage[]
  /** System prompt */
  systemPrompt?: string
  /** Callback to generate AI response */
  onGenerate?: (messages: ChatMessage[]) => Promise<string | AsyncIterable<string>>
  /** Callback when a message is added */
  onMessage?: (message: ChatMessage) => void
  /** Callback on error */
  onError?: (error: Error) => void
  /** Generate a unique message ID */
  generateId?: () => string
}

export interface UseChatReturn {
  /** All messages in the conversation */
  messages: ChatMessage[]
  /** Current input value */
  input: string
  /** Set the input value */
  setInput: (input: string) => void
  /** Whether AI is generating a response */
  isLoading: boolean
  /** Any error that occurred */
  error: Error | null
  /** Send a message */
  sendMessage: (content?: string) => Promise<void>
  /** Append a message without triggering generation */
  appendMessage: (message: Omit<ChatMessage, "id">) => void
  /** Clear all messages */
  clearMessages: () => void
  /** Stop the current generation */
  stop: () => void
  /** Reload the last assistant response */
  reload: () => Promise<void>
}

function defaultGenerateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    initialMessages = [],
    systemPrompt,
    onGenerate,
    onMessage,
    onError,
    generateId = defaultGenerateId,
  } = options

  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    const msgs = [...initialMessages]
    if (systemPrompt && !msgs.some((m) => m.role === "system")) {
      msgs.unshift({
        id: generateId(),
        role: "system",
        content: systemPrompt,
        createdAt: new Date(),
      })
    }
    return msgs
  })

  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const appendMessage = React.useCallback(
    (message: Omit<ChatMessage, "id">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: generateId(),
        createdAt: message.createdAt || new Date(),
      }
      setMessages((prev) => [...prev, newMessage])
      onMessage?.(newMessage)
      return newMessage
    },
    [generateId, onMessage]
  )

  const stop = React.useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  const sendMessage = React.useCallback(
    async (content?: string) => {
      const messageContent = content || input.trim()
      if (!messageContent || isLoading) return

      setInput("")
      setError(null)

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: messageContent,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      onMessage?.(userMessage)

      if (!onGenerate) return

      // Create assistant message placeholder
      const assistantId = generateId()
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      abortControllerRef.current = new AbortController()
      setIsLoading(true)

      try {
        const allMessages = [...messages, userMessage]
        const response = await onGenerate(allMessages)

        if (typeof response === "string") {
          // Non-streaming response
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: response } : m
            )
          )
        } else {
          // Streaming response
          let accumulated = ""
          for await (const chunk of response) {
            if (abortControllerRef.current?.signal.aborted) break
            accumulated += chunk
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: accumulated } : m
              )
            )
          }
        }

        setIsLoading(false)
        onMessage?.(assistantMessage)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Generation failed")
        setError(error)
        setIsLoading(false)
        onError?.(error)

        // Remove empty assistant message on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      }
    },
    [input, isLoading, messages, onGenerate, onMessage, onError, generateId]
  )

  const clearMessages = React.useCallback(() => {
    setMessages((prev) => {
      // Keep system message if present
      const systemMessage = prev.find((m) => m.role === "system")
      return systemMessage ? [systemMessage] : []
    })
    setError(null)
  }, [])

  const reload = React.useCallback(async () => {
    // Find the last user message and regenerate from there
    const lastUserIndex = messages.findLastIndex((m) => m.role === "user")
    if (lastUserIndex === -1 || !onGenerate) return

    // Remove messages after the last user message
    const messagesBeforeReload = messages.slice(0, lastUserIndex + 1)
    setMessages(messagesBeforeReload)

    // Regenerate
    const lastUserMessage = messages[lastUserIndex]
    await sendMessage(lastUserMessage.content)
  }, [messages, onGenerate, sendMessage])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    appendMessage,
    clearMessages,
    stop,
    reload,
  }
}
