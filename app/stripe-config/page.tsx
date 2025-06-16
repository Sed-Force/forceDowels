"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"

interface ConfigData {
  config: {
    hasStripeSecretKey: boolean
    hasStripePublishableKey: boolean
    hasWebhookSecret: boolean
    hasBaseUrl: boolean
    stripeKeyType: string
    environment: string
  }
  warnings: string[]
  ready: boolean
}

export default function StripeConfigPage() {
  const [configData, setConfigData] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/stripe/config-check')
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        setConfigData(data)
      } catch (err) {
        console.error('Config check error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkConfig()
  }, [])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!configData) return null

  const { config, warnings, ready } = configData

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Stripe Configuration Status</span>
              {ready ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Issues Found
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                {config.hasStripeSecretKey ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Stripe Secret Key</span>
              </div>

              <div className="flex items-center space-x-2">
                {config.hasStripePublishableKey ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Stripe Publishable Key</span>
              </div>

              <div className="flex items-center space-x-2">
                {config.hasWebhookSecret ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm">Webhook Secret</span>
              </div>

              <div className="flex items-center space-x-2">
                {config.hasBaseUrl ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Base URL</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium">Stripe Mode:</span>
                <Badge variant={config.stripeKeyType === 'LIVE' ? 'destructive' : 'secondary'}>
                  {config.stripeKeyType}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Environment:</span>
                <Badge variant="outline">{config.environment}</Badge>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600" />
                  Warnings
                </h4>
                <ul className="space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {config.stripeKeyType === 'LIVE' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Live Mode Active</h4>
                    <p className="text-sm text-red-700 mt-1">
                      You are using live Stripe keys. All transactions will be real and will charge actual money.
                      Make sure your webhook endpoint is configured in your Stripe Dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!config.hasWebhookSecret && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Webhook Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>To complete your Stripe setup:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to your <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe Dashboard → Webhooks</a></li>
                <li>Click "Add endpoint"</li>
                <li>Enter: <code className="bg-gray-100 px-1 rounded">https://yourdomain.com/api/stripe/webhooks</code></li>
                <li>Select events: <code className="bg-gray-100 px-1 rounded">checkout.session.completed</code></li>
                <li>Copy the webhook signing secret to your .env.local file</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
