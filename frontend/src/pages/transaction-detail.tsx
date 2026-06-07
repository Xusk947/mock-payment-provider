import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { paymentsApi } from '@/lib/api'

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const txId = Number(id)

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdGet(txId)
      return res as any
    },
  })

  const handleError = (err: any) => {
    setNotification({ type: 'error', message: err?.message || 'Something went wrong' })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['transaction', id] })
    setNotification({ type: 'success', message: 'Operation completed successfully' })
    setTimeout(() => setNotification(null), 3000)
  }

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdConfirmPost(txId)
      return res as any
    },
    onSuccess: handleSuccess,
    onError: handleError,
  })

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdRejectPost(txId)
      return res as any
    },
    onSuccess: handleSuccess,
    onError: handleError,
  })

  const captureMutation = useMutation({
    mutationFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdCapturePost(txId, { amount: transaction.amount } as any)
      return res as any
    },
    onSuccess: handleSuccess,
    onError: handleError,
  })

  const refundMutation = useMutation({
    mutationFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdRefundPost(txId, { amount: transaction.amount } as any)
      return res as any
    },
    onSuccess: handleSuccess,
    onError: handleError,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col gap-4 w-full max-w-lg">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Alert variant="destructive" className="max-w-md rounded-2xl">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error?.message || 'Transaction not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Button variant="ghost" className="self-start rounded-full px-4" onClick={() => navigate('/transactions')}>
        ← Back to Transactions
      </Button>

      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="rounded-2xl">
          <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl border-border/60 shadow-xs">
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl font-semibold tracking-tight">Transaction Details</CardTitle>
              <CardDescription>
                Transaction #{transaction.id} · {format(new Date(transaction.created_at), 'PPP')}
              </CardDescription>
            </div>
            <Badge variant={transaction.status === 'completed' ? 'default' : 'destructive'} className="rounded-full capitalize">
              {transaction.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Amount</span>
              <p className="text-3xl font-semibold tracking-tight">
                {transaction.amount.toFixed(2)} {transaction.currency}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Authorization Code</span>
              <p className="font-mono text-sm">{transaction.authorization_code || '—'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <p className="capitalize font-medium">{transaction.payment_method}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Card Type</span>
              <p className="capitalize font-medium">{transaction.card_type || 'N/A'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Last 4 Digits</span>
              <p className="font-mono">••••{transaction.card_number_last4 || 'N/A'}</p>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Alerts */}
          <div className="flex flex-col gap-4">
            {transaction.error_code && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertTitle>{transaction.error_code}</AlertTitle>
                <AlertDescription>{transaction.error_message}</AlertDescription>
              </Alert>
            )}

            {transaction.three_ds_required && !transaction.three_ds_authenticated && (
              <Alert className="rounded-2xl">
                <AlertTitle>3D Secure Required</AlertTitle>
                <AlertDescription className="flex flex-col gap-3">
                  <span>This transaction requires 3D Secure authentication.</span>
                  <Link to="/3ds">
                    <Button variant="outline" size="sm" className="rounded-full self-start">
                      Go to 3D Secure
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator className="bg-border/40" />

          {/* Financial Details */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold tracking-tight">Financial Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Amount Captured</span>
                <p className="text-xl font-semibold">
                  {transaction.amount_captured ? `${transaction.amount_captured.toFixed(2)} ${transaction.currency}` : '0.00'}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Amount Refunded</span>
                <p className="text-xl font-semibold">
                  {transaction.amount_refunded ? `${transaction.amount_refunded.toFixed(2)} ${transaction.currency}` : '0.00'}
                </p>
              </div>
            </div>
            {transaction.expires_at && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Hold Expires At</span>
                <p className="font-medium">{format(new Date(transaction.expires_at), 'PPP')}</p>
              </div>
            )}
          </div>

          <Separator className="bg-border/40" />

          {/* Timeline */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold tracking-tight">Timeline</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-28 shrink-0">Created</span>
                <span className="font-medium">{format(new Date(transaction.created_at), 'PPP')}</span>
              </div>
              {transaction.updated_at && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-28 shrink-0">Last Updated</span>
                  <span className="font-medium">{format(new Date(transaction.updated_at), 'PPP')}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Actions */}
          {transaction.status === 'pending' && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending} className="rounded-full px-6">
                {confirmMutation.isPending ? 'Confirming…' : 'Confirm Transaction'}
              </Button>
              <Button variant="destructive" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending} className="rounded-full px-6">
                {rejectMutation.isPending ? 'Rejecting…' : 'Reject Transaction'}
              </Button>
            </div>
          )}

          {transaction.status === 'authorized' && (
            <div className="flex flex-wrap gap-3">
              <Button variant="destructive" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending} className="rounded-full px-6">
                {rejectMutation.isPending ? 'Rejecting…' : 'Reject Transaction'}
              </Button>
              <Button onClick={() => captureMutation.mutate()} disabled={captureMutation.isPending} className="rounded-full px-6">
                {captureMutation.isPending ? 'Capturing…' : 'Capture Amount'}
              </Button>
            </div>
          )}

          {(transaction.status === 'completed' || transaction.status === 'captured') && (
            <Button variant="outline" onClick={() => refundMutation.mutate()} disabled={refundMutation.isPending} className="rounded-full px-6 self-start">
              {refundMutation.isPending ? 'Refunding…' : 'Issue Refund'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
