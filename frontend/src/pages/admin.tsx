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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your payment provider</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Transactions"
          value={stats?.total_transactions ?? 0}
          subtitle="All time transactions"
        />
        <StatCard
          title="Success Rate"
          value={<span className="text-green-600">{successRate}%</span>}
          subtitle={`${stats?.successful_transactions ?? 0} successful`}
        />
        <StatCard
          title="Total Amount"
          value={`$${stats?.total_amount?.toFixed(2) ?? '0.00'}`}
          subtitle="Total processed"
        />
        <StatCard
          title="Failed Transactions"
          value={<span className="text-red-600">{stats?.failed_transactions ?? 0}</span>}
          subtitle={`${failureRate}% failure rate`}
        />
      </div>

      <Tabs defaultValue="merchants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="merchants">Merchants ({stats?.active_merchants ?? 0})</TabsTrigger>
          <TabsTrigger value="cards">Cards ({stats?.active_cards ?? 0})</TabsTrigger>
          <TabsTrigger value="scenarios">Error Scenarios ({stats?.active_scenarios ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="merchants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Merchants</CardTitle>
              <CardDescription>Manage merchant accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {merchantsLoading ? (
                <div>Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Webhook URL</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {merchants?.map((merchant: Merchant) => (
                      <TableRow key={merchant.id}>
                        <TableCell>{merchant.id}</TableCell>
                        <TableCell className="font-medium">{merchant.name}</TableCell>
                        <TableCell>{merchant.email}</TableCell>
                        <TableCell>
                          <Badge variant={merchant.active ? 'default' : 'secondary'}>
                            {merchant.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[200px] truncate">
                          {merchant.webhook_url || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {merchant.created_at ? format(new Date(merchant.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Cards</CardTitle>
              <CardDescription>Manage test payment cards</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div>Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Card Number</TableHead>
                      <TableHead>Cardholder</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scenario</TableHead>
                      <TableHead>3DS</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards?.map((card: AdminCard) => (
                      <TableRow key={card.id}>
                        <TableCell>{card.id}</TableCell>
                        <TableCell className="font-mono">{card.card_number}</TableCell>
                        <TableCell>{card.cardholder_name}</TableCell>
                        <TableCell className="capitalize">{card.card_type}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{card.response_scenario}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={card.require_3ds ? 'default' : 'secondary'}>
                            {card.require_3ds ? 'Required' : 'Not Required'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {card.created_at ? format(new Date(card.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Scenarios</CardTitle>
              <CardDescription>Configure error response scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              {scenariosLoading ? (
                <div>Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Error Code</TableHead>
                      <TableHead>Error Message</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorScenarios?.map((scenario: ErrorScenario) => (
                      <TableRow key={scenario.id}>
                        <TableCell>{scenario.id}</TableCell>
                        <TableCell className="font-medium">{scenario.name}</TableCell>
                        <TableCell className="font-mono">{scenario.error_code}</TableCell>
                        <TableCell>{scenario.error_message}</TableCell>
                        <TableCell>{scenario.probability}%</TableCell>
                        <TableCell>
                          <Badge variant={scenario.active ? 'default' : 'secondary'}>
                            {scenario.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Toggle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}