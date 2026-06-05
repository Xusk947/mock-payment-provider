import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { paymentsApi, payInvoice, fetchScenarios } from '@/lib/api'

const TEST_CARDS = [
  { number: '4111111111111111', name: 'Visa Success', type: 'visa', cvv: '123', month: 12, year: 2027 },
  { number: '4000000000000002', name: 'Visa Decline', type: 'visa', cvv: '123', month: 12, year: 2027 },
  { number: '5555555555554444', name: 'Mastercard 3DS', type: 'mastercard', cvv: '123', month: 12, year: 2027 },
  { number: '378282246310005', name: 'Amex', type: 'amex', cvv: '1234', month: 12, year: 2027 },
]

export default function PayInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const invoiceId = parseInt(id || '0', 10)

  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [cvv, setCvv] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('12')
  const [expiryYear, setExpiryYear] = useState('2027')
  const [cardType, setCardType] = useState('visa')
  const [scenario, setScenario] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdGet(invoiceId)
      return res as any
    },
    enabled: invoiceId > 0,
  })

  const { data: scenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
  })

  const payMutation = useMutation({
    mutationFn: async () => {
      return payInvoice(invoiceId, {
        card_number: cardNumber.replace(/\s/g, ''),
        cardholder_name: cardholderName,
        cvv,
        expiry_month: parseInt(expiryMonth, 10),
        expiry_year: parseInt(expiryYear, 10),
        card_type: cardType,
        three_ds_authenticated: false,
        scenario: scenario || undefined,
      })
    },
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => navigate(`/transactions/${invoiceId}`), 2000)
    },
    onError: (err: any) => {
      if (err.transaction && err.message?.includes('3D Secure')) {
        setError('3D Secure required. Redirecting...')
        setTimeout(() => navigate(`/3ds?transaction_id=${invoiceId}`), 1500)
        return
      }
      setError(err.message || 'Payment failed. Please check your card details.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!cardNumber || !cardholderName || !cvv) {
      setError('Please fill in all card details')
      return
    }
    payMutation.mutate()
  }

  const fillTestCard = (card: typeof TEST_CARDS[0]) => {
    setCardNumber(card.number)
    setCardholderName(card.name)
    setCvv(card.cvv)
    setExpiryMonth(String(card.month))
    setExpiryYear(String(card.year))
    setCardType(card.type)
    setError(null)
  }

  if (invoiceLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-96 w-full max-w-md animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  // Already paid
  if (invoice && invoice.status !== 'pending' && invoice.status !== 'authorized') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Invoice Already Paid</CardTitle>
            <CardDescription>
              This invoice has already been processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Badge variant={invoice.status === 'completed' ? 'default' : 'destructive'} className="text-sm">
              {invoice.status}
            </Badge>
            <p className="text-muted-foreground">
              Transaction #{invoice.id} — {invoice.amount.toFixed(2)} {invoice.currency}
            </p>
            <Button onClick={() => navigate(`/transactions/${invoice.id}`)}>
              View Transaction
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-green-600">Payment Successful</CardTitle>
            <CardDescription>Redirecting to transaction details...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Invoice Summary */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
            <p className="text-sm text-muted-foreground">Review your order before payment</p>
          </div>

          {invoice && (
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Invoice #{invoice.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{invoice.metadata || 'Payment for services'}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{invoice.amount.toFixed(2)} {invoice.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>0.00 {invoice.currency}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total due</span>
                  <span className="font-bold text-lg">{invoice.amount.toFixed(2)} {invoice.currency}</span>
                </div>
                <Badge variant="secondary" className="w-full justify-center capitalize">
                  {invoice.status}
                </Badge>
                {invoice.created_at && (
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(invoice.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Payment Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pay with card</CardTitle>
              <CardDescription>Enter your card details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Payment Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Quick-fill test cards */}
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground">Quick fill (test cards)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TEST_CARDS.map(card => (
                    <Button
                      key={card.number}
                      type="button"
                      variant={cardNumber === card.number ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => fillTestCard(card)}
                      className="h-auto justify-start py-2 text-left text-xs"
                    >
                      <span className="block font-medium">{card.name}</span>
                      <span className="block text-[10px] text-muted-foreground">•••• {card.number.slice(-4)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card number</Label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholder-name">Cardholder name</Label>
                  <Input
                    id="cardholder-name"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Full name on card"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry (MM / YY)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="expiry-month"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        placeholder="MM"
                        className="text-center"
                        maxLength={2}
                      />
                      <Input
                        id="expiry-year"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        placeholder="YYYY"
                        className="text-center"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVC</Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      className="text-center"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Card type</Label>
                  <div className="flex gap-2">
                    {(['visa', 'mastercard', 'amex'] as const).map(type => (
                      <Button
                        key={type}
                        type="button"
                        variant={cardType === type ? 'default' : 'outline'}
                        className="flex-1 capitalize"
                        onClick={() => setCardType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment scenario</Label>
                  <Select value={scenario} onValueChange={(val) => setScenario(val ?? '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Random (default)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Random (default)</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      {scenariosLoading ? (
                        <SelectItem value="" disabled>Loading scenarios...</SelectItem>
                      ) : (
                        scenarios?.map((s) => (
                          <SelectItem key={s.name} value={s.name}>
                            {s.error_message} ({s.error_code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choose the expected outcome for this test payment</p>
                </div>

                <Button
                  type="submit"
                  disabled={payMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {payMutation.isPending
                    ? 'Processing...'
                    : `Pay ${invoice?.amount?.toFixed(2) || ''} ${invoice?.currency || ''}`}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  This is a mock payment provider. No real money is charged.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
