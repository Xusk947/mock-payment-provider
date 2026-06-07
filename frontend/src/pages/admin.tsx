import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import {
  useDashboardStats,
  useMerchants,
  useCards,
  useErrorScenarios,
  type Merchant,
  type Card as AdminCard,
  type ErrorScenario,
} from '@/hooks/use-admin'

interface StatCardProps {
  title: string
  value: React.ReactNode
  subtitle: string
}

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xs flex flex-col gap-2">
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </div>
  )
}

function SkeletonTable({ rows = 3, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-5 animate-pulse rounded-lg bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default function AdminDashboard() {
  const { data: stats } = useDashboardStats()
  const { data: merchants, isLoading: merchantsLoading } = useMerchants()
  const { data: cards, isLoading: cardsLoading } = useCards()
  const { data: errorScenarios, isLoading: scenariosLoading } = useErrorScenarios()

  const successRate = stats?.total_transactions
    ? Math.round((stats.successful_transactions / stats.total_transactions) * 100)
    : 0

  const failureRate = stats?.total_transactions
    ? Math.round((stats.failed_transactions / stats.total_transactions) * 100)
    : 0

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">Monitor and manage your payment provider</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={stats?.total_transactions ?? 0}
          subtitle="All time transactions"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          subtitle={`${stats?.successful_transactions ?? 0} successful`}
        />
        <StatCard
          title="Total Amount"
          value={`$${stats?.total_amount?.toFixed(2) ?? '0.00'}`}
          subtitle="Total processed"
        />
        <StatCard
          title="Failed Transactions"
          value={<span className="text-destructive">{stats?.failed_transactions ?? 0}</span>}
          subtitle={`${failureRate}% failure rate`}
        />
      </div>

      <Tabs defaultValue="merchants" className="flex flex-col gap-6">
        <TabsList className="w-fit rounded-full p-1 bg-muted/60 h-auto gap-1">
          <TabsTrigger value="merchants" className="rounded-full px-4 py-2 text-sm data-[state=active]:shadow-xs">
            Merchants ({stats?.active_merchants ?? 0})
          </TabsTrigger>
          <TabsTrigger value="cards" className="rounded-full px-4 py-2 text-sm data-[state=active]:shadow-xs">
            Cards ({stats?.active_cards ?? 0})
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="rounded-full px-4 py-2 text-sm data-[state=active]:shadow-xs">
            Scenarios ({stats?.active_scenarios ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="merchants" className="mt-0">
          <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Merchants</CardTitle>
              <CardDescription>Manage merchant accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="text-muted-foreground font-medium w-[60px]">ID</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Webhook URL</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Created</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchantsLoading ? (
                      <SkeletonTable />
                    ) : (
                      merchants?.map((merchant: Merchant) => (
                        <TableRow key={merchant.id} className="group border-border/30 hover:bg-muted/30 transition-colors">
                          <TableCell className="text-muted-foreground">{merchant.id}</TableCell>
                          <TableCell className="font-medium">{merchant.name}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{merchant.email}</TableCell>
                          <TableCell>
                            <Badge variant={merchant.active ? 'default' : 'secondary'} className="rounded-full">
                              {merchant.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                            {merchant.webhook_url || '—'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {merchant.created_at ? format(new Date(merchant.created_at), 'MMM dd, yyyy') : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-0">
          <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Test Cards</CardTitle>
              <CardDescription>Manage test payment cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="text-muted-foreground font-medium w-[60px]">ID</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Card Number</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Cardholder</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Scenario</TableHead>
                      <TableHead className="text-muted-foreground font-medium">3DS</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cardsLoading ? (
                      <SkeletonTable cols={7} />
                    ) : (
                      cards?.map((card: AdminCard) => (
                        <TableRow key={card.id} className="group border-border/30 hover:bg-muted/30 transition-colors">
                          <TableCell className="text-muted-foreground">{card.id}</TableCell>
                          <TableCell className="font-mono text-sm">{card.card_number}</TableCell>
                          <TableCell className="hidden md:table-cell font-medium">{card.cardholder_name}</TableCell>
                          <TableCell className="capitalize">{card.card_type}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-full">{card.response_scenario}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={card.require_3ds ? 'default' : 'secondary'} className="rounded-full">
                              {card.require_3ds ? 'Required' : 'Not Required'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {card.created_at ? format(new Date(card.created_at), 'MMM dd, yyyy') : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="mt-0">
          <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Error Scenarios</CardTitle>
              <CardDescription>Configure error response scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="text-muted-foreground font-medium w-[60px]">ID</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Error Code</TableHead>
                      <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Error Message</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Probability</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                      <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scenariosLoading ? (
                      <SkeletonTable cols={7} />
                    ) : (
                      errorScenarios?.map((scenario: ErrorScenario) => (
                        <TableRow key={scenario.id} className="group border-border/30 hover:bg-muted/30 transition-colors">
                          <TableCell className="text-muted-foreground">{scenario.id}</TableCell>
                          <TableCell className="font-medium">{scenario.name}</TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-xs">{scenario.error_code}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{scenario.error_message}</TableCell>
                          <TableCell>{scenario.probability}%</TableCell>
                          <TableCell>
                            <Badge variant={scenario.active ? 'default' : 'secondary'} className="rounded-full">
                              {scenario.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary">
                              Toggle
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
