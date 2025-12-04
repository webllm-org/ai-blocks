"use client"

import { useWebLLMStatus, type Capability } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare,
  Image,
  Search,
  Eye,
  Mic,
  Wrench,
  Sparkles,
  Lock
} from "lucide-react"

const CAPABILITY_INFO: Record<Capability, { icon: typeof MessageSquare; label: string; description: string }> = {
  text: {
    icon: MessageSquare,
    label: "Text Generation",
    description: "Chat, summarization, content creation"
  },
  image: {
    icon: Image,
    label: "Image Generation",
    description: "Create images from text prompts"
  },
  embedding: {
    icon: Search,
    label: "Embeddings",
    description: "Semantic search, similarity matching"
  },
  vision: {
    icon: Eye,
    label: "Vision",
    description: "Analyze and understand images"
  },
  audio: {
    icon: Mic,
    label: "Audio",
    description: "Speech-to-text, text-to-speech"
  },
  "tool-use": {
    icon: Wrench,
    label: "Tool Use",
    description: "Function calling, agent capabilities"
  }
}

/**
 * CapabilityGateDemo
 *
 * Shows feature capability gates based on available providers.
 * Use cases:
 * - Feature cards showing what's available
 * - Gating premium/advanced features
 * - Helping users understand what they can do
 */
export function CapabilityGateDemo() {
  const { loading, available, capabilities, providers } = useWebLLMStatus()

  const CapabilityCard = ({ capability }: { capability: Capability }) => {
    const info = CAPABILITY_INFO[capability]
    const Icon = info.icon
    const isAvailable = capabilities[capability]

    return (
      <Card className={`relative overflow-hidden transition-all ${
        isAvailable
          ? "border-green-500/30 bg-green-500/5"
          : "border-muted bg-muted/30 opacity-60"
      }`}>
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[1px]">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Icon className={`h-5 w-5 ${isAvailable ? "text-green-500" : "text-muted-foreground"}`} />
            {isAvailable ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <h3 className="font-medium text-sm">{info.label}</h3>
          <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Detecting capabilities...</span>
        </div>
      </div>
    )
  }

  if (!available) {
    return (
      <div className="space-y-4 w-full max-w-2xl mx-auto">
        <Card className="bg-muted/30">
          <CardContent className="py-8 text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Install WebLLM extension to see available capabilities
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const availableCount = Object.values(capabilities).filter(Boolean).length
  const totalCount = Object.keys(capabilities).length

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      {/* Summary Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Capabilities
              </CardTitle>
              <CardDescription className="text-xs">
                {availableCount} of {totalCount} features available
              </CardDescription>
            </div>
            <Badge variant={availableCount === totalCount ? "default" : "secondary"}>
              {availableCount}/{totalCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex flex-wrap gap-1">
            {providers.slice(0, 5).map(p => (
              <Badge key={p} variant="outline" className="text-xs">
                {p}
              </Badge>
            ))}
            {providers.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{providers.length - 5} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Capability Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(Object.keys(CAPABILITY_INFO) as Capability[]).map(cap => (
          <CapabilityCard key={cap} capability={cap} />
        ))}
      </div>

      {/* Upgrade prompt if not all capabilities */}
      {availableCount < totalCount && (
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Add more providers to unlock additional capabilities
            </p>
            <Button size="sm" variant="outline">
              Configure Providers
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Capabilities depend on which AI providers you have configured
      </p>
    </div>
  )
}
