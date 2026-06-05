import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { useTransactions, type Transaction } from '@/hooks/use-transactions'
import { getStatusVariant } from '@/utils/status'

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: transactions, isLoading, error } = useTransactions()

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
                      {(tx.amount ?? 0).toFixed(2)} {tx.currency || 'USD'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(tx.status)}>
                        {tx.status || 'unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{tx.card_type || 'N/A'}</TableCell>
                    <TableCell>••••{tx.card_number_last4 || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {tx.authorization_code || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {tx.created_at ? format(new Date(tx.created_at), 'MMM dd, yyyy') : 'N/A'}
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