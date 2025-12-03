"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AIInput } from "@/registry/ui/ai-input"

export interface PromptFormProps extends React.HTMLAttributes<HTMLFormElement> {
  /** Callback when form is submitted */
  onSubmit?: (prompt: string, options: PromptOptions) => void | Promise<void>
  /** Whether the form is in loading state */
  isLoading?: boolean
  /** Callback to stop generation */
  onStop?: () => void
  /** Placeholder text */
  placeholder?: string
  /** Show model selector */
  showModelSelector?: boolean
  /** Available models */
  models?: Array<{ id: string; name: string }>
  /** Selected model ID */
  selectedModel?: string
  /** Callback when model changes */
  onModelChange?: (modelId: string) => void
  /** Show temperature slider */
  showTemperature?: boolean
  /** Current temperature value */
  temperature?: number
  /** Callback when temperature changes */
  onTemperatureChange?: (value: number) => void
  /** Show token limit input */
  showMaxTokens?: boolean
  /** Current max tokens value */
  maxTokens?: number
  /** Callback when max tokens changes */
  onMaxTokensChange?: (value: number) => void
}

export interface PromptOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export function PromptForm({
  onSubmit,
  isLoading = false,
  onStop,
  placeholder = "Enter your prompt...",
  showModelSelector = false,
  models = [],
  selectedModel,
  onModelChange,
  showTemperature = false,
  temperature = 0.7,
  onTemperatureChange,
  showMaxTokens = false,
  maxTokens = 2048,
  onMaxTokensChange,
  className,
  ...props
}: PromptFormProps) {
  const handleSubmit = (prompt: string) => {
    const options: PromptOptions = {}
    if (showModelSelector) options.model = selectedModel
    if (showTemperature) options.temperature = temperature
    if (showMaxTokens) options.maxTokens = maxTokens

    onSubmit?.(prompt, options)
  }

  const hasOptions = showModelSelector || showTemperature || showMaxTokens

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(e) => e.preventDefault()}
      {...props}
    >
      {hasOptions && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {showModelSelector && models.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground">Model:</label>
              <select
                value={selectedModel}
                onChange={(e) => onModelChange?.(e.target.value)}
                disabled={isLoading}
                className={cn(
                  "rounded-md border bg-background px-2 py-1 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showTemperature && (
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground">Temperature:</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => onTemperatureChange?.(parseFloat(e.target.value))}
                disabled={isLoading}
                className="w-20"
              />
              <span className="w-8 text-muted-foreground">{temperature}</span>
            </div>
          )}

          {showMaxTokens && (
            <div className="flex items-center gap-2">
              <label className="text-muted-foreground">Max tokens:</label>
              <input
                type="number"
                min="1"
                max="32768"
                value={maxTokens}
                onChange={(e) => onMaxTokensChange?.(parseInt(e.target.value) || 2048)}
                disabled={isLoading}
                className={cn(
                  "w-20 rounded-md border bg-background px-2 py-1 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              />
            </div>
          )}
        </div>
      )}

      <AIInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={onStop}
        placeholder={placeholder}
        maxRows={6}
      />
    </form>
  )
}
