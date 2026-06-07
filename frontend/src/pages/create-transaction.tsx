import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createInvoice } from '@/lib/api'

export default function CreateTransactionPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('100.00')
  const [currency, setCurrency] = useState('USD')
  const [description, setDescription] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [createdInvoice, setCreatedInvoice] = useState<{ transaction: any; payment_url: string } | null>(null)

  const invoiceMutation = useMutation({
    mutationFn: async () => {
      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Please enter a valid amount')
      }
      return createInvoice(parsedAmount, currency.toUpperCase(), description || undefined)
    },
    onSuccess: (data: any) => {
      setCreatedInvoice(data)
      setNotification({ type: 'success', message: 'Invoice created successfully' })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
    onError: (err: any) => {
      setNotification({ type: 'error', message: err.message || 'Failed to create invoice' })
      setTimeout(() => setNotification(null), 5000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    invoiceMutation.mutate()
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">Create Invoice</h1>
        <p className="text-lg text-muted-foreground">Generate a payment invoice for your customer</p>
      </div>

      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="rounded-2xl">
          <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl border-border/60 shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold tracking-tight">Invoice Details</CardTitle>
          <CardDescription>Enter the payment amount and currency</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="USD"
                  maxLength={3}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Subscription payment"
                className="rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={invoiceMutation.isPending} className="rounded-full px-6">
                {invoiceMutation.isPending ? 'Creating…' : 'Create Invoice'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/transactions')} className="rounded-full px-6">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {createdInvoice && (
        <Card className="rounded-2xl border-border/60 shadow-xs">
          <CardHeader className="gap-2">
            <CardTitle className="text-xl font-semibold tracking-tight">Invoice Created</CardTitle>
            <CardDescription>Share this payment link with your customer</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Invoice ID</span>
                <span className="font-medium">#{createdInvoice.transaction.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{createdInvoice.transaction.amount} {createdInvoice.transaction.currency}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-muted/60 rounded-2xl">
              <Label className="text-xs text-muted-foreground font-medium">Payment Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}${createdInvoice.payment_url}`}
                  className="rounded-xl text-sm bg-background"
                />
                <Button
                  variant="secondary"
                  className="rounded-full shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${createdInvoice.payment_url}`)
                    setNotification({ type: 'success', message: 'Link copied to clipboard' })
                    setTimeout(() => setNotification(null), 3000)
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => navigate(createdInvoice.payment_url)} className="rounded-full px-6">
                Open Payment Page
              </Button>
              <Button
                variant="ghost"
                className="rounded-full px-6"
                onClick={() => {
                  setCreatedInvoice(null)
                  setAmount('100.00')
                  setCurrency('USD')
                  setDescription('')
                }}
              >
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
