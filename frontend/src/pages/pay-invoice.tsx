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
        setError('3D Secure required. Redirecting…')
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
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    )
  }

  if (invoice && invoice.status !== 'pending' && invoice.status !== 'authorized') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border-border/60 shadow-xs">
          <CardHeader className="text-center gap-2">
            <CardTitle className="text-xl font-semibold tracking-tight">Invoice Already Paid</CardTitle>
            <CardDescription>This invoice has already been processed.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Badge variant={invoice.status === 'completed' ? 'default' : 'destructive'} className="rounded-full capitalize">
              {invoice.status}
            </Badge>
            <p className="text-muted-foreground">
              Transaction #{invoice.id} — {invoice.amount.toFixed(2)} {invoice.currency}
            </p>
            <Button onClick={() => navigate(`/transactions/${invoice.id}`)} className="rounded-full px-6">
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
        <Card className="w-full max-w-md rounded-2xl border-border/60 shadow-xs">
          <CardHeader className="text-center gap-2">
            <CardTitle className="text-xl font-semibold tracking-tight text-primary">Payment Successful</CardTitle>
            <CardDescription>Redirecting to transaction details…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left: Invoice Summary */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight">Checkout</h1>
            <p className="text-lg text-muted-foreground">Review your order before payment</p>
          </div>

          {invoice && (
            <Card className="rounded-2xl border-border/60 shadow-xs">
              <CardHeader className="gap-2">
                <CardTitle className="text-xl font-semibold tracking-tight">Order Summary</CardTitle>
                <CardDescription>Invoice #{invoice.id}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium text-right">{invoice.metadata || 'Payment for services'}</span>
                </div>
                <Separator className="bg-border/40" />
                <div className="flex justify-between items-baseline">
                  <span className="font-medium">Total due</span>
                  <span className="text-2xl font-semibold tracking-tight">{invoice.amount.toFixed(2)} {invoice.currency}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="rounded-full capitalize">
                    {invoice.status}
                  </Badge>
                  {invoice.created_at && (
                    <span className="text-xs text-muted-foreground">
                      Created {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Payment Form */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Pay with card</CardTitle>
              <CardDescription>Enter your card details below</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
              {error && (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertTitle>Payment Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Quick-fill test cards */}
              <div className="flex flex-col gap-3">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick fill (test cards)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TEST_CARDS.map((card) => (
                    <Button
                      key={card.number}
                      type="button"
                      variant={cardNumber === card.number ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => fillTestCard(card)}
                      className="h-auto justify-start py-2.5 px-3 text-left text-xs rounded-xl"
                    >
                      <span className="block font-medium">{card.name}</span>
                      <span className="block text-[10px] text-muted-foreground">•••• {card.number.slice(-4)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-number" className="text-sm font-medium">Card number</Label>
                  <Input
                    id="card-number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="rounded-xl font-mono"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="cardholder-name" className="text-sm font-medium">Cardholder name</Label>
                  <Input
                    id="cardholder-name"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Full name on card"
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Expiry (MM / YY)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="expiry-month"
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                        placeholder="MM"
                        className="rounded-xl text-center"
                        maxLength={2}
                      />
                      <Input
                        id="expiry-year"
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                        placeholder="YYYY"
                        className="rounded-xl text-center"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="cvv" className="text-sm font-medium">CVC</Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      className="rounded-xl text-center"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Card type</Label>
                  <div className="flex gap-2">
                    {(['visa', 'mastercard', 'amex'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={cardType === type ? 'default' : 'outline'}
                        className="flex-1 rounded-full capitalize"
                        onClick={() => setCardType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Payment scenario</Label>
                  <Select value={scenario} onValueChange={(val) => setScenario(val ?? '')}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Random (default)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Random (default)</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      {scenariosLoading ? (
                        <SelectItem value="" disabled>Loading scenarios…</SelectItem>
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
                  className="w-full rounded-full"
                  size="lg"
                >
                  {payMutation.isPending
                    ? 'Processing…'
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
