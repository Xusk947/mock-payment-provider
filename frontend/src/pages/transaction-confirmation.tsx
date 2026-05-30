import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [selectedScenario, setSelectedScenario] = useState('success')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      if (selectedScenario === 'success') {
        // Simulate successful confirmation
        alert('Transaction confirmed successfully!')
        navigate(`/transactions/${id}`)
      } else {
        // Apply error scenario
        const scenario = ERROR_SCENARIOS.find(s => s.name === selectedScenario)
        if (scenario) {
          alert(`Transaction failed: ${scenario.error_code} - ${scenario.error_message}`)
          navigate(`/transactions/${id}`)
        }
      }
    } catch (error) {
      alert('Error processing transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = () => {
    if (confirm('Are you sure you want to reject this transaction?')) {
      alert('Transaction rejected')
      navigate('/transactions')
    }
  }

  const handleCancel = () => {
    navigate(`/transactions/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirm Transaction</CardTitle>
          <CardDescription>
            Review and confirm transaction #{id} with error simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Summary */}
          <Alert>
            <AlertTitle>Transaction Summary</AlertTitle>
            <AlertDescription>
              Amount: $100.00 USD • Card: ••••1111 (Visa)
            </AlertDescription>
          </Alert>

          {/* Error Scenario Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2">Error Scenario</label>
              <Tabs defaultValue="success" value={selectedScenario} onValueChange={setSelectedScenario}>
                <TabsList className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {ERROR_SCENARIOS.map((scenario) => (
                    <TabsTrigger key={scenario.id} value={scenario.name}>
                      {scenario.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={selectedScenario}>
                  {ERROR_SCENARIOS.map((scenario) => {
                    if (scenario.name !== selectedScenario) return null
                    return (
                      <div key={scenario.id} className="space-y-4">
                        <div>
                          <h4 className="font-semibold">{scenario.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Error Code: <span className="font-mono">{scenario.error_code || 'None'}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {scenario.error_message || 'Transaction will succeed'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Probability: {scenario.probability}%
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </TabsContent>
              </Tabs>
            </div>

            {/* Error Examples */}
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-semibold mb-2">Error Examples:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono">DECLINED:</span>
                  <span className="text-muted-foreground">Generic card decline</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">INSUFFICIENT_FUNDS:</span>
                  <span className="text-muted-foreground">Not enough balance</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">INVALID_CVV:</span>
                  <span className="text-muted-foreground">CVV validation failed</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">3DS_REQUIRED:</span>
                  <span className="text-muted-foreground">3D Secure needed</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Confirm Transaction'}
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Transaction
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}