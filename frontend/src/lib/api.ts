import { createConfiguration, ServerConfiguration } from '@/api'
import { AdminApi, PaymentsApi, WebhooksApi } from '@/api'
import type { PromiseMiddleware } from '@/api/middleware'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const apiKeyMiddleware: PromiseMiddleware = {
  pre: async (context) => {
    context.setHeaderParam('X-API-Key', 'test_api_key_12345')
    return context
  },
  post: async (context) => context,
}

const baseConfig = createConfiguration({
  baseServer: new ServerConfiguration(API_BASE_URL, {}),
})

const adminConfig = createConfiguration({
  baseServer: new ServerConfiguration(API_BASE_URL, {}),
  promiseMiddleware: [apiKeyMiddleware],
})

export const paymentsApi = new PaymentsApi(baseConfig)
export const adminApi = new AdminApi(adminConfig)
export const webhooksApi = new WebhooksApi(adminConfig)

// Invoice helpers (not in generated SDK yet)
export async function createInvoice(amount: number, currency: string, metadata?: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'test_api_key_12345',
    },
    body: JSON.stringify({ amount, currency, metadata }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function payInvoice(id: number, payload: {
  card_number: string
  cardholder_name: string
  cvv: string
  expiry_month: number
  expiry_year: number
  card_type: string
  three_ds_authenticated: boolean
  scenario?: string
}) {
  const res = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'test_api_key_12345',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (res.status === 402 && body.error?.includes('3D Secure')) {
      const err = new Error(body.error || '3D Secure required')
      ;(err as any).transaction = body.transaction
      throw err
    }
    throw new Error(body.error || `Payment failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchScenarios() {
  const res = await fetch(`${API_BASE_URL}/api/v1/scenarios`)
  if (!res.ok) throw new Error('Failed to fetch scenarios')
  return res.json() as Promise<{ id: number; name: string; error_type: string; error_code: string; error_message: string }[]>
}
