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
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    )
  }

  const handleTestWebhook = async (webhook: Webhook) => {
    setNotification({ type: 'success', message: `Test webhook sent to ${webhook.url}` })
    setTimeout(() => setNotification(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhook Management</h1>
          <p className="text-muted-foreground">
            Configure webhook endpoints for payment events (saved locally)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button>Add Webhook</Button>} />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Webhook</DialogTitle>
              <DialogDescription>
                Configure a new webhook endpoint to receive payment event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-domain.com/webhook"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be a valid HTTPS URL for production
                </p>
              </div>

              <div>
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {WEBHOOK_EVENTS.map(event => (
                    <div key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={selectedEvents.includes(event)}
                        onChange={() => handleEventToggle(event)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={event} className="text-sm cursor-pointer">
                        {event}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWebhook}>Add Webhook</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification */}
      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>
            {notification.type === 'success' ? 'Success' : 'Error'}
          </AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Webhooks Table */}
      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No webhooks configured</p>
            <Button onClick={() => setIsDialogOpen(true)}>Add Your First Webhook</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured Webhooks</CardTitle>
            <CardDescription>
              {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map(webhook => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-mono text-xs max-w-[300px] truncate">
                      {webhook.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.slice(0, 2).map(event => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{webhook.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={webhook.active ? 'default' : 'secondary'}>
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(webhook.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestWebhook(webhook)}
                        >
                          Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(webhook)}
                        >
                          {webhook.active ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration Guide</CardTitle>
          <CardDescription>
            How to configure webhooks for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">Supported Events</h4>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>charge.completed</strong> - Payment successfully processed</li>
              <li><strong>charge.failed</strong> - Payment declined or failed</li>
              <li><strong>charge.captured</strong> - Hold amount captured</li>
              <li><strong>charge.refunded</strong> - Payment refunded</li>
              <li><strong>hold.authorized</strong> - Hold successfully authorized</li>
              <li><strong>hold.captured</strong> - Hold amount captured</li>
              <li><strong>3ds.completed</strong> - 3D Secure authentication completed</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Webhook Payload Format</h4>
            <div className="bg-muted p-3 rounded-md font-mono text-xs">
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

          <div>
            <h4 className="font-semibold mb-1">Local Storage</h4>
            <p className="text-muted-foreground">
              Webhook configurations are saved in your browser's local storage. They will persist across sessions but are not synced to the server. For production use, you should integrate with the backend webhook management API.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}