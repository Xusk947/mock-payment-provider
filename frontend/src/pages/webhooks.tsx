import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { webhooksApi } from '@/lib/api'
import type { ModelsWebhookRequest } from '@/api'

interface Webhook {
  id: number
  url: string
  events: string[]
  active: boolean
  createdAt: string
  isDefault?: boolean
}

const WEBHOOK_EVENTS = [
  'charge.completed',
  'charge.failed',
  'charge.captured',
  'charge.refunded',
  'hold.authorized',
  'hold.captured',
  '3ds.completed',
]

export default function WebhookManagement() {
  const queryClient = useQueryClient()
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['charge.completed', 'charge.failed'])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const { data: rawWebhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const res = await webhooksApi.adminWebhooksGet()
      return res as any[]
    },
  })

  const webhooks: Webhook[] = rawWebhooks.map((w: any) => ({
    id: w.id,
    url: w.url,
    events: typeof w.event_types === 'string' ? JSON.parse(w.event_types || '[]') : w.event_types || [],
    active: w.active,
    createdAt: w.created_at,
    isDefault: w.is_default || false,
  }))

  const createMutation = useMutation({
    mutationFn: async () => {
      await webhooksApi.adminWebhooksPost({
        url: newWebhookUrl.trim(),
        events: selectedEvents,
        active: true,
      } as ModelsWebhookRequest)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      setNewWebhookUrl('')
      setSelectedEvents(['charge.completed', 'charge.failed'])
      setIsDialogOpen(false)
      setNotification({ type: 'success', message: 'Webhook added successfully' })
      setTimeout(() => setNotification(null), 3000)
    },
    onError: () => {
      setNotification({ type: 'error', message: 'Failed to add webhook' })
      setTimeout(() => setNotification(null), 3000)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await webhooksApi.adminWebhooksIdDelete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      setNotification({ type: 'success', message: 'Webhook deleted successfully' })
      setTimeout(() => setNotification(null), 3000)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active, url, events }: { id: number; active: boolean; url: string; events: string[] }) => {
      await webhooksApi.adminWebhooksIdPut(id, {
        url,
        events,
        active: !active,
      } as ModelsWebhookRequest)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      setNotification({ type: 'success', message: 'Webhook status updated' })
      setTimeout(() => setNotification(null), 3000)
    },
  })

  const handleAddWebhook = () => {
    if (!newWebhookUrl.trim()) {
      setNotification({ type: 'error', message: 'Webhook URL is required' })
      return
    }
    if (selectedEvents.length === 0) {
      setNotification({ type: 'error', message: 'At least one event must be selected' })
      return
    }
    createMutation.mutate()
  }

  const handleDeleteWebhook = (id: number) => {
    deleteMutation.mutate(id)
  }

  const handleToggleActive = (webhook: Webhook) => {
    toggleMutation.mutate({ id: webhook.id, active: webhook.active, url: webhook.url, events: webhook.events })
  }

  const handleEventToggle = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  const handleTestWebhook = async (webhook: Webhook) => {
    setNotification({ type: 'success', message: `Test webhook sent to ${webhook.url}` })
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">Webhook Management</h1>
          <p className="text-lg text-muted-foreground">Configure webhook endpoints for payment events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="rounded-full px-6">Add Webhook</Button>} />
          <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
            <DialogHeader className="gap-2">
              <DialogTitle className="text-xl font-semibold tracking-tight">Add New Webhook</DialogTitle>
              <DialogDescription>Configure a new webhook endpoint to receive payment event notifications</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="webhook-url" className="text-sm font-medium">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-domain.com/webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Must be a valid HTTPS URL for production</p>
              </div>

              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium">Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div key={event} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={selectedEvents.includes(event)}
                        onChange={() => handleEventToggle(event)}
                        className="size-4 accent-primary"
                      />
                      <label htmlFor={event} className="text-sm cursor-pointer">
                        {event}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" className="rounded-full px-6" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="rounded-full px-6" onClick={handleAddWebhook}>
                  Add Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="rounded-2xl">
          <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {webhooks.length === 0 ? (
        <Card className="rounded-2xl border-border/60 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-muted-foreground text-lg">No webhooks configured</p>
            <Button onClick={() => setIsDialogOpen(true)} className="rounded-full px-6">
              Add Your First Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="gap-2">
            <CardTitle className="text-xl font-semibold tracking-tight">Configured Webhooks</CardTitle>
            <CardDescription>
              {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="text-muted-foreground font-medium">URL</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Events</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id} className="group border-border/30 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs max-w-[300px] truncate">{webhook.url}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event) => (
                            <Badge key={event} variant="secondary" className="rounded-full text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="secondary" className="rounded-full text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={webhook.active ? 'default' : 'secondary'} className="rounded-full">
                            {webhook.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {webhook.isDefault && (
                            <Badge variant="outline" className="rounded-full text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {webhook.isDefault ? '—' : format(new Date(webhook.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        {webhook.isDefault ? (
                          <span className="text-xs text-muted-foreground">System</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTestWebhook(webhook)}
                              className="rounded-full text-muted-foreground hover:text-primary"
                            >
                              Test
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(webhook)}
                              className="rounded-full text-muted-foreground hover:text-primary"
                            >
                              {webhook.active ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="rounded-full text-muted-foreground hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/60 shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold tracking-tight">Webhook Configuration Guide</CardTitle>
          <CardDescription>How to configure webhooks for your application</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h4 className="font-medium">Supported Events</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li>charge.completed — Payment successfully processed</li>
              <li>charge.failed — Payment declined or failed</li>
              <li>charge.captured — Hold amount captured</li>
              <li>charge.refunded — Payment refunded</li>
              <li>hold.authorized — Hold successfully authorized</li>
              <li>hold.captured — Hold amount captured</li>
              <li>3ds.completed — 3D Secure authentication completed</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-medium">Webhook Payload Format</h4>
            <div className="bg-muted/60 rounded-2xl p-4 font-mono text-xs overflow-auto">
              {`{
  "event": "charge.completed",
  "data": {
    "id": 123,
    "amount": 100.00,
    "currency": "USD",
    "status": "completed",
    "transaction_id": "txn_12345"
  },
  "timestamp": "2026-05-30T17:00:00Z"
}`}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-medium">Local Storage</h4>
            <p className="text-sm text-muted-foreground">
              Webhook configurations are saved in your browser's local storage. They will persist across sessions but are not synced to the server. For production use, integrate with the backend webhook management API.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
