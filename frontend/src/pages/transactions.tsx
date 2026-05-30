import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

interface Transaction {
  id: number
  amount: number
  currency: string
  status: string
  payment_method: string
  card_type: string
  card_number_last4: string
  authorization_code: string
  error_code?: string
  error_message?: string
  created_at: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/transactions`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    },
  })

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'captured':
      case 'authorized':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
      case 'declined':
        return 'destructive'
      case 'refunded':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const filteredTransactions = transactions?.filter((tx: Transaction) =>
    tx.card_number_last4?.includes(searchTerm) ||
    tx.authorization_code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  if (error) return <div className="flex items-center justify-center h-screen">Error loading transactions</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by last 4 digits or auth code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button>Filter</Button>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Card Type</TableHead>
                  <TableHead>Last 4</TableHead>
                  <TableHead>Auth Code</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx: Transaction) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>
                      {tx.amount.toFixed(2)} {tx.currency}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(tx.status)}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{tx.card_type}</TableCell>
                    <TableCell>••••{tx.card_number_last4 || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.authorization_code || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link to={`/transactions/${tx.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        {tx.status === 'pending' && (
                          <Link to={`/confirm/${tx.id}`}>
                            <Button size="sm">
                              Confirm
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}