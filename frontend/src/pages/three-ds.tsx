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
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md rounded-2xl border-border/60 shadow-xs">
        <CardHeader className="text-center gap-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">3D Secure Authentication</CardTitle>
          <CardDescription>Please authenticate this transaction to proceed</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          {transaction && (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction</span>
                <span className="font-mono">#{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  {transaction.amount?.toFixed(2)} {transaction.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merchant</span>
                <span>Test Merchant</span>
              </div>
              <Separator className="bg-border/40" />
            </div>
          )}

          <Alert className="rounded-2xl bg-muted/40 border-0">
            <AlertTitle className="font-medium">Authentication Required</AlertTitle>
            <AlertDescription>Your bank requires additional verification for this transaction.</AlertDescription>
          </Alert>

          {authError && (
            <Alert variant="destructive" className="rounded-2xl">
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-full"
              size="lg"
              onClick={() => authenticateMutation.mutate()}
              disabled={authenticateMutation.isPending || txId <= 0}
            >
              {authenticateMutation.isPending ? 'Authenticating…' : 'Authenticate Now'}
            </Button>

            <Button variant="ghost" className="w-full rounded-full" onClick={handleCancel}>
              Cancel Transaction
            </Button>
          </div>

          <div className="flex flex-col gap-1 text-center text-xs text-muted-foreground">
            <p>Your information is protected with bank-level security</p>
            <p>Authentication expires in 10 minutes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
