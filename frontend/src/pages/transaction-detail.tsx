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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'captured':
        return 'bg-green-500'
      case 'pending':
      case 'authorized':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      case 'refunded':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  if (error || !transaction) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || 'Transaction not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/transactions')}>
        &larr; Back to Transactions
      </Button>

      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Transaction #{transaction.id} &bull; {format(new Date(transaction.created_at), 'PPP')}
              </CardDescription>
            </div>
            <Badge variant={transaction.status === 'completed' ? 'default' : 'destructive'}>
              {transaction.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <p className="text-2xl font-bold">
                  {transaction.amount.toFixed(2)} {transaction.currency}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Authorization Code</label>
                <p className="font-mono text-sm">
                  {transaction.authorization_code || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text font-medium">Payment Method</label>
                <p className="capitalize">{transaction.payment_method}</p>
              </div>
              <div>
                <label className="text font-medium">Card Type</label>
                <p className="capitalize">{transaction.card_type || 'N/A'}</p>
              </div>
              <div>
                <label className="text font-medium">Last 4 Digits</label>
                <p className="font-mono">&bull;&bull;&bull;&bull;{transaction.card_number_last4 || 'N/A'}</p>
              </div>
            </div>

            <Separator />

            {/* Transaction Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(transaction.status)}`} />
                <span className="text-sm font-medium capitalize">{transaction.status}</span>
              </div>

              {transaction.error_code && (
                <Alert variant="destructive">
                  <AlertTitle>{transaction.error_code}</AlertTitle>
                  <AlertDescription>{transaction.error_message}</AlertDescription>
                </Alert>
              )}

              {transaction.three_ds_required && !transaction.three_ds_authenticated && (
                <Alert>
                  <AlertTitle>3D Secure Required</AlertTitle>
                  <AlertDescription>
                    This transaction requires 3D Secure authentication.
                    <div className="mt-2">
                      <Link to="/3ds">
                        <Button variant="outline" size="sm">
                          Go to 3D Secure
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Financial Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Financial Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Amount Captured</label>
                  <p className="text-xl font-semibold">
                    {transaction.amount_captured ? `${transaction.amount_captured.toFixed(2)} ${transaction.currency}` : '0.00'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount Refunded</label>
                  <p className="text-xl font-semibold">
                    {transaction.amount_refunded ? `${transaction.amount_refunded.toFixed(2)} ${transaction.currency}` : '0.00'}
                  </p>
                </div>
              </div>

              {transaction.expires_at && (
                <div>
                  <label className="text-sm font-medium">Hold Expires At</label>
                  <p>{format(new Date(transaction.expires_at), 'PPP')}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(transaction.created_at), 'PPP')}</span>
                </div>
                {transaction.updated_at && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{format(new Date(transaction.updated_at), 'PPP')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {transaction.status === 'pending' && (
            <div className="flex gap-2">
              <Button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
                {confirmMutation.isPending ? 'Confirming...' : 'Confirm Transaction'}
              </Button>
              <Button variant="destructive" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Transaction'}
              </Button>
            </div>
          )}

          {transaction.status === 'authorized' && (
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Transaction'}
              </Button>
              <Button onClick={() => captureMutation.mutate()} disabled={captureMutation.isPending}>
                {captureMutation.isPending ? 'Capturing...' : 'Capture Amount'}
              </Button>
            </div>
          )}

          {(transaction.status === 'completed' || transaction.status === 'captured') && (
            <Button variant="outline" onClick={() => refundMutation.mutate()} disabled={refundMutation.isPending}>
              {refundMutation.isPending ? 'Refunding...' : 'Issue Refund'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
