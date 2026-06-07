import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { useTransactions, type Transaction } from '@/hooks/use-transactions'
import { getStatusVariant } from '@/utils/status'

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={8}>
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: transactions, isLoading, error } = useTransactions()

  const initialIds = useRef<Set<number>>(new Set())
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set())

  // Mark initially loaded IDs as "seen" after first load
  useEffect(() => {
    if (!isLoading && transactions && initialIds.current.size === 0) {
      const ids = new Set(transactions.map((t) => t.id).filter((id): id is number => id != null))
      initialIds.current = ids
      setSeenIds(new Set(ids))
    }
  }, [isLoading, transactions])

  // Track new IDs that appear after refetch
  useEffect(() => {
    if (!isLoading && transactions && initialIds.current.size > 0) {
      const currentIds = new Set(transactions.map((t) => t.id).filter((id): id is number => id != null))
      setSeenIds((prev) => {
        const next = new Set(prev)
        currentIds.forEach((id) => next.add(id))
        return next
      })
    }
  }, [isLoading, transactions])

  const handleMarkSeen = (id: number | undefined) => {
    if (id == null) return
    setSeenIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const isNew = (id: number | undefined) => {
    if (id == null) return false
    return initialIds.current.size > 0 && !initialIds.current.has(id) && !seenIds.has(id)
  }

  const filteredTransactions =
    transactions?.filter(
      (tx: Transaction) =>
        tx.card_number_last4?.includes(searchTerm) ||
        tx.authorization_code?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Error loading transactions</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-lg text-muted-foreground">View and manage all payment transactions</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-3">
          <Input
            placeholder="Search by last 4 digits or auth code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md rounded-xl"
          />
        </div>

        {filteredTransactions.length === 0 && !isLoading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="text-muted-foreground text-lg">No transactions found</p>
              <Link to="/create">
                <Button>Create your first invoice</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="text-muted-foreground font-medium w-[80px]">ID</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Amount</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Card</TableHead>
                  <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Auth Code</TableHead>
                  <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <SkeletonRows />
                ) : (
                  filteredTransactions.map((tx: Transaction) => {
                    const txNew = isNew(tx.id)
                    return (
                      <TableRow
                        key={tx.id}
                        className={`group border-border/30 hover:bg-muted/30 transition-colors ${txNew ? 'bg-primary/[0.03]' : ''}`}
                        onMouseEnter={() => handleMarkSeen(tx.id)}
                      >
                        <TableCell className="font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            #{tx.id}
                            {txNew && (
                              <Badge variant="default" className="rounded-full text-[10px] px-1.5 py-0">
                                New
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {(tx.amount ?? 0).toFixed(2)} {tx.currency || 'USD'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(tx.status)} className="rounded-full font-medium">
                            {tx.status || 'unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell capitalize text-muted-foreground">
                          {tx.card_type || 'N/A'} •••• {tx.card_number_last4 || 'N/A'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground">
                          {tx.authorization_code || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {tx.created_at ? format(new Date(tx.created_at), 'MMM dd, yyyy') : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/transactions/${tx.id}`}>
                              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary">
                                View
                              </Button>
                            </Link>
                            {tx.status === 'pending' && (
                              <Link to={`/confirm/${tx.id}`}>
                                <Button size="sm" className="rounded-full">
                                  Confirm
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
