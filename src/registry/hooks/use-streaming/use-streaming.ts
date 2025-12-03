"use client"

import * as React from "react"

export interface UseStreamingOptions {
  /** Callback when streaming starts */
  onStart?: () => void
  /** Callback when streaming completes */
  onComplete?: (text: string) => void
  /** Callback on streaming error */
  onError?: (error: Error) => void
  /** Callback on each chunk received */
  onChunk?: (chunk: string) => void
}

export interface UseStreamingReturn {
  /** The accumulated text from streaming */
  text: string
  /** Whether currently streaming */
  isStreaming: boolean
  /** Any error that occurred */
  error: Error | null
  /** Start streaming from a ReadableStream */
  streamFrom: (stream: ReadableStream<Uint8Array>) => Promise<string>
  /** Start streaming from a Response */
  streamResponse: (response: Response) => Promise<string>
  /** Append text directly (for manual streaming) */
  appendText: (chunk: string) => void
  /** Reset the streaming state */
  reset: () => void
  /** Abort the current stream */
  abort: () => void
}

export function useStreaming(options: UseStreamingOptions = {}): UseStreamingReturn {
  const { onStart, onComplete, onError, onChunk } = options

  const [text, setText] = React.useState("")
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const reset = React.useCallback(() => {
    setText("")
    setError(null)
    setIsStreaming(false)
  }, [])

  const abort = React.useCallback(() => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const appendText = React.useCallback(
    (chunk: string) => {
      setText((prev) => prev + chunk)
      onChunk?.(chunk)
    },
    [onChunk]
  )

  const streamFrom = React.useCallback(
    async (stream: ReadableStream<Uint8Array>): Promise<string> => {
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setIsStreaming(true)
      setError(null)
      setText("")
      onStart?.()

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      try {
        while (true) {
          if (signal.aborted) {
            reader.cancel()
            break
          }

          const { done, value } = await reader.read()

          if (done) {
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setText(accumulated)
          onChunk?.(chunk)
        }

        setIsStreaming(false)
        onComplete?.(accumulated)
        return accumulated
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Streaming failed")
        setError(error)
        setIsStreaming(false)
        onError?.(error)
        throw error
      }
    },
    [onStart, onComplete, onError, onChunk]
  )

  const streamResponse = React.useCallback(
    async (response: Response): Promise<string> => {
      if (!response.body) {
        throw new Error("Response has no body")
      }
      return streamFrom(response.body)
    },
    [streamFrom]
  )

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    text,
    isStreaming,
    error,
    streamFrom,
    streamResponse,
    appendText,
    reset,
    abort,
  }
}
