"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Code, Copy, Check, Sparkles } from "lucide-react"

interface ApiResponse {
  statusCode: number
  headers: Record<string, string>
  body: object
  notes?: string[]
}

export interface ApiResponseDesignerDemoProps {
  /** Default endpoint description */
  defaultEndpoint?: string
}

export function ApiResponseDesignerDemo({
  defaultEndpoint = "GET /api/users/:id - Get user profile",
}: ApiResponseDesignerDemoProps = {}) {
  const [endpoint, setEndpoint] = useState(defaultEndpoint)
  const [scenario, setScenario] = useState("success")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const SCENARIOS = [
    { id: "success", label: "Success Response", status: "2xx" },
    { id: "error-validation", label: "Validation Error", status: "400" },
    { id: "error-auth", label: "Authentication Error", status: "401" },
    { id: "error-forbidden", label: "Forbidden", status: "403" },
    { id: "error-notfound", label: "Not Found", status: "404" },
    { id: "error-server", label: "Server Error", status: "500" },
  ]

  const handleGenerate = async () => {
    if (!endpoint.trim()) return
    setIsLoading(true)
    setResponse(null)

    const scenarioInfo = SCENARIOS.find(s => s.id === scenario)

    try {
      const result = await generateText({
        prompt: `Design a realistic API response for this endpoint:

Endpoint: ${endpoint}
Scenario: ${scenarioInfo?.label} (${scenarioInfo?.status})

Generate a well-structured REST API response following best practices.

Return as JSON:
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "X-Request-Id": "example-uuid"
  },
  "body": {
    // Realistic response body with proper structure
    // Include pagination for lists
    // Include timestamps, IDs, and nested objects where appropriate
  },
  "notes": ["Best practice notes about this response design"]
}

Make the response realistic and useful for API documentation or testing.`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(result.text)
      setResponse(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!response) return
    await navigator.clipboard.writeText(JSON.stringify(response.body, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (code >= 400 && code < 500) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-2 block">API Endpoint</Label>
          <Input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="GET /api/users - List all users"
            className="font-mono text-sm"
          />
        </div>

        <div>
          <Label className="text-sm mb-2 block">Response Scenario</Label>
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCENARIOS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {s.status}
                    </Badge>
                    {s.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !endpoint.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Designing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Response
          </>
        )}
      </Button>

      {response && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(response.statusCode)}>
                  {response.statusCode}
                </Badge>
                <span className="text-sm font-medium">
                  {response.statusCode >= 200 && response.statusCode < 300
                    ? "OK"
                    : response.statusCode === 400
                    ? "Bad Request"
                    : response.statusCode === 401
                    ? "Unauthorized"
                    : response.statusCode === 403
                    ? "Forbidden"
                    : response.statusCode === 404
                    ? "Not Found"
                    : "Error"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Headers</Label>
              <div className="space-y-1">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="text-xs font-mono">
                    <span className="text-muted-foreground">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm">Response Body</Label>
              </div>
              <pre className="p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto max-h-[300px] overflow-y-auto">
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </div>

            {response.notes && response.notes.length > 0 && (
              <div className="pt-2 border-t space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Design notes:</p>
                {response.notes.map((note, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    • {note}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
