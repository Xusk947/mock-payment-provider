import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { paymentsApi } from '@/lib/api'

export default function ThreeDSPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)

  const transactionId = searchParams.get('transaction_id') || ''
  const txId = Number(transactionId)

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', txId],
    queryFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdGet(txId)
      return res as any
    },
    enabled: txId > 0,
  })

  const authenticateMutation = useMutation({
    mutationFn: async () => {
      const res = await paymentsApi.apiV1TransactionsId3dsCompletePost(txId)
      return res as any
    },
    onSuccess: (data: any) => {
      if (data.success) {
        // Redirect back to payment page after successful 3DS
        navigate(`/pay/${transactionId}`)
      }
    },
    onError: (err: any) => {
      setAuthError(err.message || 'Authentication failed')
    },
  })

  const handleCancel = () => {
    navigate('/transactions')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>3D Secure Authentication</CardTitle>
          <CardDescription>
            Please authenticate this transaction to proceed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Transaction Details */}
          {transaction && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction</span>
                <span className="font-mono">#{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold">
                  {transaction.amount?.toFixed(2)} {transaction.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merchant</span>
                <span>Test Merchant</span>
              </div>
              <Separator />
            </div>
          )}

          <Alert>
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Your bank requires additional verification for this transaction.
            </AlertDescription>
          </Alert>

          {authError && (
            <Alert variant="destructive">
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => authenticateMutation.mutate()}
              disabled={authenticateMutation.isPending || txId <= 0}
            >
              {authenticateMutation.isPending ? 'Authenticating...' : 'Authenticate Now'}
            </Button>

            <Button variant="ghost" className="w-full" onClick={handleCancel}>
              Cancel Transaction
            </Button>
          </div>

          <div className="space-y-1 text-center text-xs text-muted-foreground">
            <p>Your information is protected with bank-level security</p>
            <p>Authentication expires in 10 minutes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
