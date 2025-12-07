"use client"

import { CloudLoginButton } from "./cloud-login-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * CloudLoginButtonDemo
 *
 * Demonstrates the CloudLoginButton component in various sizes.
 */
export function CloudLoginButtonDemo() {
  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Default Size</CardTitle>
          <CardDescription>Standard button for most use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <CloudLoginButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Small Size</CardTitle>
          <CardDescription>Compact button for toolbars</CardDescription>
        </CardHeader>
        <CardContent>
          <CloudLoginButton size="sm" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Icon Only</CardTitle>
          <CardDescription>Minimal footprint for dense UIs</CardDescription>
        </CardHeader>
        <CardContent>
          <CloudLoginButton size="icon" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">With Custom Client ID</CardTitle>
          <CardDescription>For registered OAuth apps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <CloudLoginButton clientId="your_app_client_id" />
          <p className="text-xs text-muted-foreground">
            Pass <code>clientId</code> to use your registered app for branding and analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
