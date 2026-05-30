import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

export default function ThreeDSPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const transactionId = searchParams.get('transaction_id') || '12345'
  const amount = searchParams.get('amount') || '100.00'

  const handleAuthenticate = () => {
    setIsLoading(true)
    // Simulate 3D Secure authentication
    setTimeout(() => {
      setIsAuthenticated(true)
      setIsLoading(false)
    }, 1500)
  }

  const handleContinue = () => {
    // Navigate back to transaction or to a success page
    navigate(`/transactions/${transactionId}`)
  }

  const handleCancel = () => {
    navigate('/transactions')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🔒</span>
          </div>
          <div>
            <CardTitle className="text-2xl">3D Secure Authentication</CardTitle>
            <CardDescription className="mt-2">
              Please authenticate this transaction to proceed
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Transaction Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono text-sm">{transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold">${amount} USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Merchant:</span>
              <span>Test Merchant</span>
            </div>
          </div>

          {/* Authentication Status */}
          {!isAuthenticated ? (
            <>
              <Alert>
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  Your bank requires additional verification for this transaction.
                </AlertDescription>
              </Alert>

              {/* Authentication Button */}
              <div className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAuthenticate}
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Authenticate Now'}
                  <span className="ml-2">→</span>
                </Button>

                <div className="text-center">
                  <Button variant="ghost" onClick={handleCancel} className="text-muted-foreground">
                    Cancel Transaction
                  </Button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-xs text-center text-muted-foreground space-y-2">
                <p>🔒 Your information is protected with bank-level security</p>
                <p>📱 Check your mobile device for verification code</p>
                <p>⏱️ Authentication expires in 10 minutes</p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800">
                <AlertTitle className="text-green-800 dark:text-green-200">
                  Authentication Successful!
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Your transaction has been verified and can now proceed.
                </AlertDescription>
              </Alert>

              <Badge variant="default" className="w-full justify-center py-2">
                ✓ Verified
              </Badge>

              <Button
                className="w-full"
                size="lg"
                onClick={handleContinue}
              >
                Continue to Payment
                <span className="ml-2">→</span>
              </Button>

              <div className="text-center">
                <Button variant="ghost" onClick={handleCancel}>
                  Cancel Transaction
                </Button>
              </div>
            </>
          )}
        </CardContent>

        <CardContent className="pt-0">
          <div className="text-xs text-center text-muted-foreground border-t pt-4">
            <p>Powered by Mock Payment Provider</p>
            <p className="mt-1">This is a test environment - no real money is processed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}