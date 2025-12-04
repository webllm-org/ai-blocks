"use client"

import { useState } from "react"
import { useWebLLMStatus } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Sparkles,
  EyeOff,
  ArrowLeftRight,
  MessageSquare,
  Loader2,
  Star,
  Zap
} from "lucide-react"

type Behavior = "show" | "hide" | "fallback"

/**
 * AvailabilityBehaviorDemo
 *
 * Interactive demo showing different UI behaviors based on availability:
 * - Show: Always show, indicate when AI unavailable
 * - Hide: Completely hide when AI unavailable
 * - Fallback: Show alternative content when unavailable
 *
 * Use cases:
 * - Progressive enhancement patterns
 * - Graceful degradation
 * - Feature visibility decisions
 */
export function AvailabilityBehaviorDemo() {
  const { loading, available, status } = useWebLLMStatus()
  const [behavior, setBehavior] = useState<Behavior>("show")
  const [simulateUnavailable, setSimulateUnavailable] = useState(false)

  // For demo purposes, allow simulating unavailable state
  const isAvailable = simulateUnavailable ? false : available

  const AIFeatureCard = () => (
    <Card className="border-primary/50 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">AI-Powered Suggestions</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Get intelligent recommendations based on your content
        </p>
        <Button size="sm" className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Generate Suggestions
        </Button>
      </CardContent>
    </Card>
  )

  const UnavailableCard = () => (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/30">
      <CardContent className="p-4 text-center">
        <EyeOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          AI features require WebLLM extension
        </p>
        <Button size="sm" variant="outline" className="mt-2">
          Learn More
        </Button>
      </CardContent>
    </Card>
  )

  const FallbackCard = () => (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">Popular Suggestions</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Here are some commonly used options
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Professional tone</Badge>
          <Badge variant="secondary">Make it shorter</Badge>
          <Badge variant="secondary">Fix grammar</Badge>
        </div>
      </CardContent>
    </Card>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Checking availability...</span>
          </CardContent>
        </Card>
      )
    }

    switch (behavior) {
      case "show":
        return isAvailable ? <AIFeatureCard /> : <UnavailableCard />
      case "hide":
        return isAvailable ? <AIFeatureCard /> : null
      case "fallback":
        return isAvailable ? <AIFeatureCard /> : <FallbackCard />
    }
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {/* Behavior Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Availability Behavior
          </CardTitle>
          <CardDescription className="text-xs">
            Choose how your UI responds when AI is unavailable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={behavior} onValueChange={(v) => setBehavior(v as Behavior)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="show" className="text-xs">Show</TabsTrigger>
              <TabsTrigger value="hide" className="text-xs">Hide</TabsTrigger>
              <TabsTrigger value="fallback" className="text-xs">Fallback</TabsTrigger>
            </TabsList>
            <TabsContent value="show" className="mt-3">
              <p className="text-xs text-muted-foreground">
                Always show the feature area, but indicate when AI is unavailable with a helpful message.
              </p>
            </TabsContent>
            <TabsContent value="hide" className="mt-3">
              <p className="text-xs text-muted-foreground">
                Completely hide AI features when unavailable. Best for optional enhancements.
              </p>
            </TabsContent>
            <TabsContent value="fallback" className="mt-3">
              <p className="text-xs text-muted-foreground">
                Show alternative non-AI content when unavailable. Best for graceful degradation.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Demo Toggle */}
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="simulate" className="text-sm">Simulate Unavailable</Label>
            </div>
            <Switch
              id="simulate"
              checked={simulateUnavailable}
              onCheckedChange={setSimulateUnavailable}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Toggle to see how the UI behaves when AI is unavailable
          </p>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Current State:</span>
        <Badge variant={isAvailable ? "default" : "secondary"}>
          {loading ? "Loading..." : isAvailable ? "AI Available" : "AI Unavailable"}
        </Badge>
      </div>

      {/* Preview */}
      <div className="min-h-[140px]">
        {renderContent()}
        {behavior === "hide" && !isAvailable && !loading && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              (Feature hidden when unavailable)
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Use the toggle above to preview different availability states
      </p>
    </div>
  )
}
