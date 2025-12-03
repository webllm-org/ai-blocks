"use client"

import * as React from "react"

// Types based on WebLLM client API
export interface GenerateTextOptions {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface GenerateTextResult {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface UseWebLLMOptions {
  /** Callback on generation error */
  onError?: (error: Error) => void
}

export interface UseWebLLMReturn {
  /** Whether WebLLM client is ready */
  isReady: boolean
  /** Whether currently generating */
  isLoading: boolean
  /** The WebLLM client instance */
  client: WebLLMClientInterface | null
  /** Generate text from a prompt */
  generateText: (options: GenerateTextOptions) => Promise<GenerateTextResult>
  /** Check if WebLLM extension is available */
  checkAvailability: () => Promise<boolean>
  /** Any error that occurred */
  error: Error | null
}

// Interface for WebLLM client to avoid direct import dependency
interface WebLLMClientInterface {
  generateText: (options: GenerateTextOptions) => Promise<GenerateTextResult>
}

export function useWebLLM(options: UseWebLLMOptions = {}): UseWebLLMReturn {
  const { onError } = options

  const [isReady, setIsReady] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const clientRef = React.useRef<WebLLMClientInterface | null>(null)

  // Initialize WebLLM client
  React.useEffect(() => {
    const initClient = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { WebLLMClient } = await import("@webllm/client")
        clientRef.current = new WebLLMClient()
        setIsReady(true)
      } catch (err) {
        const error = new Error("Failed to initialize WebLLM client")
        setError(error)
        onError?.(error)
      }
    }

    initClient()
  }, [onError])

  const checkAvailability = React.useCallback(async (): Promise<boolean> => {
    try {
      // Check if the extension bridge is available
      return !!(window as any).__webllm || !!(navigator as any).llm
    } catch {
      return false
    }
  }, [])

  const generateText = React.useCallback(
    async (genOptions: GenerateTextOptions): Promise<GenerateTextResult> => {
      if (!clientRef.current) {
        throw new Error("WebLLM client not initialized")
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await clientRef.current.generateText(genOptions)
        setIsLoading(false)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Generation failed")
        setError(error)
        setIsLoading(false)
        onError?.(error)
        throw error
      }
    },
    [onError]
  )

  return {
    isReady,
    isLoading,
    client: clientRef.current,
    generateText,
    checkAvailability,
    error,
  }
}
