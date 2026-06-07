import { useQuery } from '@tanstack/react-query'
import { paymentsApi } from '@/lib/api'
import type { ModelsTransaction } from '@/api'

export type Transaction = ModelsTransaction

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => paymentsApi.apiV1TransactionsGet() as Promise<Transaction[]>,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })
}

export function useTransaction(id: string | number | undefined) {
  return useQuery<Transaction>({
    queryKey: ['transaction', id],
    queryFn: async () => paymentsApi.apiV1TransactionsIdGet(Number(id)) as Promise<Transaction>,
    enabled: !!id,
  })
}
