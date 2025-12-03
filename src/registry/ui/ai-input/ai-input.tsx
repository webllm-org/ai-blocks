"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AIInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onSubmit"> {
  /** Callback when the user submits the input */
  onSubmit?: (value: string) => void
  /** Whether the AI is currently generating a response */
  isLoading?: boolean
  /** Callback to stop generation */
  onStop?: () => void
  /** Placeholder text */
  placeholder?: string
  /** Maximum rows for auto-resize */
  maxRows?: number
  /** Show file attachment button */
  showAttachments?: boolean
  /** Callback when files are attached */
  onAttach?: (files: FileList) => void
}

export function AIInput({
  onSubmit,
  isLoading = false,
  onStop,
  placeholder = "Type a message...",
  maxRows = 4,
  showAttachments = false,
  onAttach,
  className,
  value,
  onChange,
  disabled,
  ...props
}: AIInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = React.useState("")

  const currentValue = value !== undefined ? String(value) : internalValue
  const isControlled = value !== undefined

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
    const maxHeight = lineHeight * maxRows
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${newHeight}px`
  }, [currentValue, maxRows])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    onChange?.(e)
  }

  const handleSubmit = () => {
    const trimmedValue = currentValue.trim()
    if (!trimmedValue || isLoading || disabled) return

    onSubmit?.(trimmedValue)

    if (!isControlled) {
      setInternalValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAttach?.(e.target.files)
      e.target.value = "" // Reset for next selection
    }
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-lg border bg-background p-2",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
    >
      {showAttachments && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleFileClick}
            disabled={disabled || isLoading}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              "hover:bg-muted transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Attach files"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
        </>
      )}

      <textarea
        ref={textareaRef}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        rows={1}
        className={cn(
          "flex-1 resize-none bg-transparent text-sm",
          "placeholder:text-muted-foreground",
          "focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "min-h-[36px] py-2"
        )}
        {...props}
      />

      {isLoading && onStop ? (
        <button
          type="button"
          onClick={onStop}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            "bg-destructive text-destructive-foreground",
            "hover:bg-destructive/90 transition-colors"
          )}
          aria-label="Stop generation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!currentValue.trim() || disabled || isLoading}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      )}
    </div>
  )
}
