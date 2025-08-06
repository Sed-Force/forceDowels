"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, User, History, Truck, CreditCard } from "lucide-react"
import Link from "next/link"
import { GuestCheckoutValidation, getAuthRequiredMessage, getAuthCallToAction } from "@/lib/guest-checkout-validation"

interface AuthRequiredNoticeProps {
  validation: GuestCheckoutValidation
  onClose?: () => void
}

export function AuthRequiredNotice({ validation, onClose }: AuthRequiredNoticeProps) {
  const message = getAuthRequiredMessage(validation)
  const actions = getAuthCallToAction(validation)

  if (validation.isAllowed) {
    return null
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <ShieldCheck className="h-5 w-5 mr-2" />
          Account Required for This Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-200 bg-amber-100">
          <AlertDescription className="text-amber-800">
            {validation.reason}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm text-gray-700 font-medium">
            Creating an account provides you with:
          </p>
          
          <div className="grid gap-2 text-sm text-gray-600">
            <div className="flex items-center">
              <History className="h-4 w-4 mr-2 text-amber-600" />
              Order tracking and history
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-amber-600" />
              Business verification and dedicated support
            </div>
            <div className="flex items-center">
              <Truck className="h-4 w-4 mr-2 text-amber-600" />
              Streamlined reordering process
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-amber-600" />
              Access to volume pricing and payment terms
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button asChild className="flex-1">
            <Link href={actions.primaryUrl}>
              {actions.primaryAction}
            </Link>
          </Button>
          
          {actions.secondaryAction && actions.secondaryUrl && (
            <Button variant="outline" asChild className="flex-1">
              <Link href={actions.secondaryUrl}>
                {actions.secondaryAction}
              </Link>
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t border-amber-200">
          <strong>Note:</strong> Orders of 5,000 dowels or less, and all kit purchases, 
          can be completed as a guest without creating an account.
        </div>
      </CardContent>
    </Card>
  )
}
