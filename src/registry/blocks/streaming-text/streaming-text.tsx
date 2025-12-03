"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface StreamingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The text content to display */
  text: string
  /** Whether the text is currently streaming */
  isStreaming?: boolean
  /** Show cursor while streaming */
  showCursor?: boolean
  /** Typing speed in ms (for simulated streaming) */
  typingSpeed?: number
  /** Callback when streaming animation completes */
  onComplete?: () => void
}

export function StreamingText({
  text,
  isStreaming = false,
  showCursor = true,
  typingSpeed,
  onComplete,
  className,
  ...props
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = React.useState("")
  const [isAnimating, setIsAnimating] = React.useState(false)

  // Handle simulated typing animation
  React.useEffect(() => {
    if (typingSpeed && typingSpeed > 0) {
      setIsAnimating(true)
      setDisplayedText("")

      let index = 0
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setIsAnimating(false)
          onComplete?.()
        }
      }, typingSpeed)

      return () => clearInterval(interval)
    } else {
      setDisplayedText(text)
      setIsAnimating(false)
    }
  }, [text, typingSpeed, onComplete])

  const showStreamingCursor = showCursor && (isStreaming || isAnimating)

  return (
    <div className={cn("relative", className)} {...props}>
      <p className="whitespace-pre-wrap break-words">
        {typingSpeed ? displayedText : text}
        {showStreamingCursor && (
          <span
            className={cn(
              "ml-0.5 inline-block h-[1em] w-[2px] align-middle",
              "animate-pulse bg-current"
            )}
          />
        )}
      </p>
    </div>
  )
}
