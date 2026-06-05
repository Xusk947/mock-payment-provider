import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createInvoice } from '@/lib/api'

export default function CreateTransactionPage() {
  const navigate = useNavigate()
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
      setNotification({ type: 'success', message: 'Invoice created successfully!' })
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
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-muted-foreground">Generate a payment invoice for your customer</p>
      </div>

      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Enter the payment amount and currency</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="USD"
                  maxLength={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Subscription payment"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={invoiceMutation.isPending}>
                {invoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Invoice Created Result */}
      {createdInvoice && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Created</CardTitle>
            <CardDescription>Share this payment link with your customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice ID</span>
                <span className="font-medium">#{createdInvoice.transaction.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{createdInvoice.transaction.amount} {createdInvoice.transaction.currency}</span>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-md space-y-2">
              <Label className="text-xs text-muted-foreground">Payment Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}${createdInvoice.payment_url}`}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${createdInvoice.payment_url}`)
                    setNotification({ type: 'success', message: 'Link copied to clipboard!' })
                    setTimeout(() => setNotification(null), 3000)
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => navigate(createdInvoice.payment_url)}>
                Open Payment Page
              </Button>
              <Button variant="outline" onClick={() => {
                setCreatedInvoice(null)
                setAmount('100.00')
                setCurrency('USD')
                setDescription('')
              }}>
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
