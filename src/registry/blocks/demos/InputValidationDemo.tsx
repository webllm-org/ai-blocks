"use client"

import { useState, useRef } from "react"
import { generateText } from "@webllm/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

type FieldState = {
  value: string
  status: "idle" | "validating" | "valid" | "invalid" | "warning"
  message: string
}

export function InputValidationDemo() {
  const [email, setEmail] = useState<FieldState>({ value: "", status: "idle", message: "" })
  const [phone, setPhone] = useState<FieldState>({ value: "", status: "idle", message: "" })
  const [address, setAddress] = useState<FieldState>({ value: "", status: "idle", message: "" })
  const debounceRefs = useRef<Record<string, NodeJS.Timeout>>({})

  const validateField = async (field: string, value: string, setter: React.Dispatch<React.SetStateAction<FieldState>>) => {
    if (!value.trim()) {
      setter({ value, status: "idle", message: "" })
      return
    }

    setter(prev => ({ ...prev, status: "validating" }))

    try {
      const result = await generateText({
        prompt: `Validate this ${field} input: "${value}"

Respond with JSON: {"status": "valid"|"invalid"|"warning", "message": "brief feedback"}

For email: check format, suggest fixes like missing @
For phone: check format, note if international
For address: check completeness, suggest if missing city/zip

JSON:`,
        temperature: 0.3,
        maxTokens: 80,
      })

      try {
        const jsonMatch = result.text.match(/\{[^}]+\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setter({
            value,
            status: parsed.status as "valid" | "invalid" | "warning",
            message: parsed.message || ""
          })
        }
      } catch {
        setter({ value, status: "idle", message: "" })
      }
    } catch (error) {
      console.error("Error:", error)
      setter({ value, status: "idle", message: "" })
    }
  }

  const handleChange = (field: string, value: string, setter: React.Dispatch<React.SetStateAction<FieldState>>) => {
    setter(prev => ({ ...prev, value }))

    if (debounceRefs.current[field]) {
      clearTimeout(debounceRefs.current[field])
    }

    debounceRefs.current[field] = setTimeout(() => {
      validateField(field, value, setter)
    }, 800)
  }

  const getStatusIcon = (status: FieldState["status"]) => {
    switch (status) {
      case "validating":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      case "valid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "invalid":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: FieldState["status"]) => {
    switch (status) {
      case "valid":
        return "border-green-500"
      case "invalid":
        return "border-red-500"
      case "warning":
        return "border-yellow-500"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Smart Form Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Input
                id="email"
                type="text"
                value={email.value}
                onChange={(e) => handleChange("email", e.target.value, setEmail)}
                placeholder="you@example.com"
                className={`pr-10 ${getStatusColor(email.status)}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getStatusIcon(email.status)}
              </div>
            </div>
            {email.message && (
              <p className={`text-xs ${
                email.status === "valid" ? "text-green-600" :
                email.status === "invalid" ? "text-red-600" : "text-yellow-600"
              }`}>
                {email.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                type="text"
                value={phone.value}
                onChange={(e) => handleChange("phone", e.target.value, setPhone)}
                placeholder="(555) 123-4567"
                className={`pr-10 ${getStatusColor(phone.status)}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getStatusIcon(phone.status)}
              </div>
            </div>
            {phone.message && (
              <p className={`text-xs ${
                phone.status === "valid" ? "text-green-600" :
                phone.status === "invalid" ? "text-red-600" : "text-yellow-600"
              }`}>
                {phone.message}
              </p>
            )}
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <Input
                id="address"
                type="text"
                value={address.value}
                onChange={(e) => handleChange("address", e.target.value, setAddress)}
                placeholder="123 Main St, City, State 12345"
                className={`pr-10 ${getStatusColor(address.status)}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getStatusIcon(address.status)}
              </div>
            </div>
            {address.message && (
              <p className={`text-xs ${
                address.status === "valid" ? "text-green-600" :
                address.status === "invalid" ? "text-red-600" : "text-yellow-600"
              }`}>
                {address.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-muted-foreground">Try:</span>
        <Badge variant="secondary" className="text-xs cursor-pointer"
          onClick={() => handleChange("email", "john.example", setEmail)}>
          john.example
        </Badge>
        <Badge variant="secondary" className="text-xs cursor-pointer"
          onClick={() => handleChange("phone", "5551234567", setPhone)}>
          5551234567
        </Badge>
        <Badge variant="secondary" className="text-xs cursor-pointer"
          onClick={() => handleChange("address", "123 Main St", setAddress)}>
          123 Main St
        </Badge>
      </div>
    </div>
  )
}
