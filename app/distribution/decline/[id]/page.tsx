"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface DeclineResponse {
  success: boolean
  message: string
  request?: {
    id: string
    businessName: string
    contactName: string
    status: string
    declinedAt: string
  }
  error?: string
  status?: string
  processedAt?: string
}

export default function DeclineDistributionPage() {
  const params = useParams()
  const id = params.id as string
  const [response, setResponse] = useState<DeclineResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (id) {
      checkRequestStatus()
    }
  }, [id])

  const checkRequestStatus = async () => {
    try {
      const res = await fetch(`/api/distribution/decline/${id}`)
      const data = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Error checking request status:', error)
      setResponse({
        success: false,
        error: 'Failed to load request information'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setProcessing(true)
    try {
      const res = await fetch(`/api/distribution/decline/${id}`, {
        method: 'POST'
      })
      const data = await res.json()
      setResponse(data)
    } catch (error) {
      console.error('Error declining request:', error)
      setResponse({
        success: false,
        error: 'Failed to process decline'
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 animate-spin" />
              <span>Loading request...</span>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {response?.success ? (
                <CheckCircle className="h-16 w-16 text-red-600" />
              ) : response?.status === 'accepted' || response?.status === 'declined' ? (
                <AlertCircle className="h-16 w-16 text-amber-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {response?.success ? 'Request Declined' : 
               response?.status === 'declined' ? 'Already Declined' :
               response?.status === 'accepted' ? 'Already Processed' :
               'Unable to Process Request'}
            </CardTitle>
            <CardDescription className="text-lg">
              {response?.message || response?.error || 'Processing distribution request...'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {response?.success && response.request && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Request Details</h3>
                <div className="space-y-1 text-sm text-red-800">
                  <p><strong>Business:</strong> {response.request.businessName}</p>
                  <p><strong>Contact:</strong> {response.request.contactName}</p>
                  <p><strong>Status:</strong> {response.request.status}</p>
                  <p><strong>Declined:</strong> {new Date(response.request.declinedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {response?.status && response.status !== 'pending' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Request Status</h3>
                <div className="space-y-1 text-sm text-amber-800">
                  <p>This request has already been processed.</p>
                  <p><strong>Current Status:</strong> {response.status}</p>
                  {response.processedAt && (
                    <p><strong>Processed:</strong> {new Date(response.processedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}

            {!response?.success && response?.status === 'pending' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Confirm Decline</h3>
                <p className="text-sm text-red-800 mb-4">
                  Are you sure you want to decline this distribution request? This action cannot be undone.
                </p>
                <Button 
                  onClick={handleDecline}
                  disabled={processing}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {processing ? 'Processing...' : 'Confirm Decline'}
                </Button>
              </div>
            )}

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => window.close()}
                className="w-full"
              >
                Close Window
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
