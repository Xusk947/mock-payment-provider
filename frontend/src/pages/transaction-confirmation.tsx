import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { paymentsApi } from '@/lib/api'

const ERROR_SCENARIOS = [
  { id: 1, name: 'Success', error_code: '', error_message: '', probability: 0 },
  { id: 2, name: 'Decline', error_code: 'DECLINED', error_message: 'Card was declined', probability: 100 },
  { id: 3, name: 'Insufficient Funds', error_code: 'INSUFFICIENT_FUNDS', error_message: 'Insufficient funds on card', probability: 100 },
  { id: 4, name: 'Invalid CVV', error_code: 'INVALID_CVV', error_message: 'Invalid CVV', probability: 50 },
  { id: 5, name: 'Processing Error', error_code: 'PROCESSING_ERROR', error_message: 'Temporary error, please retry', probability: 25 },
  { id: 6, name: '3DS Required', error_code: '3DS_REQUIRED', error_message: '3D Secure authentication required', probability: 100 },
]

export default function TransactionConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [selectedScenario, setSelectedScenario] = useState('Success')
  const txId = Number(id)

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdConfirmPost(txId)
      return res as any
    },
    onSuccess: () => navigate(`/transactions/${id}`),
  })

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await paymentsApi.apiV1TransactionsIdRejectPost(txId)
      return res as any
    },
    onSuccess: () => navigate('/transactions'),
  })

  const handleConfirm = () => {
    if (selectedScenario === 'Success') {
      confirmMutation.mutate()
    } else {
      rejectMutation.mutate()
    }
  }

  const handleReject = () => {
    if (confirm('Are you sure you want to reject this transaction?')) {
      rejectMutation.mutate()
    }
  }

  const handleCancel = () => {
    navigate(`/transactions/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <Button variant="ghost" className="self-start rounded-full px-4" onClick={handleCancel}>
        Cancel
      </Button>

      <Card className="rounded-2xl border-border/60 shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">Confirm Transaction</CardTitle>
          <CardDescription>Review and confirm transaction #{id} with error simulation</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <Alert className="rounded-2xl bg-muted/40 border-0">
            <AlertTitle className="font-medium">Transaction Summary</AlertTitle>
            <AlertDescription>
              Amount: $100.00 USD · Card: ••••1111 (Visa)
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium">Error Scenario</label>
            <Tabs defaultValue="success" value={selectedScenario} onValueChange={setSelectedScenario}>
              <TabsList className="grid grid-cols-2 lg:grid-cols-3 gap-1 rounded-2xl p-1 bg-muted/60 h-auto">
                {ERROR_SCENARIOS.map((scenario) => (
                  <TabsTrigger
                    key={scenario.id}
                    value={scenario.name}
                    className="rounded-xl py-2.5 text-sm data-[state=active]:shadow-xs"
                  >
                    {scenario.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedScenario} className="mt-4">
                {ERROR_SCENARIOS.map((scenario) => {
                  if (scenario.name !== selectedScenario) return null
                  return (
                    <div key={scenario.id} className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/40 text-sm">
                      <span className="font-medium">{scenario.name}</span>
                      <div className="flex flex-col gap-1 text-muted-foreground">
                        <p>Error Code: <span className="font-mono text-foreground">{scenario.error_code || 'None'}</span></p>
                        <p>{scenario.error_message || 'Transaction will succeed'}</p>
                        <p>Probability: {scenario.probability}%</p>
                      </div>
                    </div>
                  )
                })}
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-muted/40 text-sm">
            <span className="font-medium">Error Examples</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
              <div className="flex justify-between">
                <span className="font-mono text-xs text-foreground">DECLINED</span>
                <span>Generic card decline</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-xs text-foreground">INSUFFICIENT_FUNDS</span>
                <span>Not enough balance</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-xs text-foreground">INVALID_CVV</span>
                <span>CVV validation failed</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-xs text-foreground">3DS_REQUIRED</span>
                <span>3D Secure needed</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || rejectMutation.isPending}
              className="rounded-full px-6"
            >
              {confirmMutation.isPending || rejectMutation.isPending ? 'Processing…' : 'Confirm Transaction'}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending} className="rounded-full px-6">
              Reject Transaction
            </Button>
            <Button variant="ghost" onClick={handleCancel} className="rounded-full px-6">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
