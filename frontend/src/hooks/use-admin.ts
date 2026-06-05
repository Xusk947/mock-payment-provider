import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import type { ModelsMerchant, ModelsCard, ModelsErrorScenario } from '@/api'

export type Merchant = ModelsMerchant
export type Card = ModelsCard
export type ErrorScenario = ModelsErrorScenario

export interface DashboardStats {
  total_transactions: number
  successful_transactions: number
  total_amount: number
  failed_transactions: number
  active_merchants: number
  active_cards: number
  active_scenarios: number
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => adminApi.adminDashboardGet() as Promise<DashboardStats>,
  })
}

export function useMerchants() {
  return useQuery<Merchant[]>({
    queryKey: ['merchants'],
    queryFn: async () => adminApi.adminMerchantsGet() as Promise<Merchant[]>,
  })
}

export function useCards() {
  return useQuery<Card[]>({
    queryKey: ['cards'],
    queryFn: async () => adminApi.adminCardsGet() as Promise<Card[]>,
  })
}

export function useErrorScenarios() {
  return useQuery<ErrorScenario[]>({
    queryKey: ['error-scenarios'],
    queryFn: async () => adminApi.adminErrorScenariosGet() as Promise<ErrorScenario[]>,
  })
}
