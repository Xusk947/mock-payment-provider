import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Routes, Route } from 'react-router-dom'
import { queryClient } from '@/lib/query-client'
import { Layout } from '@/components/layout'

import TransactionsPage from './pages/transactions'
import TransactionDetailPage from './pages/transaction-detail'
import TransactionConfirmationPage from './pages/transaction-confirmation'
import ThreeDSPage from './pages/three-ds'
import AdminDashboard from './pages/admin'
import WebhookManagement from './pages/webhooks'
import CreateTransactionPage from './pages/create-transaction'
import PayInvoicePage from './pages/pay-invoice'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Layout>
        <Routes>
          <Route path="/" element={<TransactionsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/:id" element={<TransactionDetailPage />} />
          <Route path="/confirm/:id" element={<TransactionConfirmationPage />} />
          <Route path="/create" element={<CreateTransactionPage />} />
          <Route path="/pay/:id" element={<PayInvoicePage />} />
          <Route path="/3ds" element={<ThreeDSPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/webhooks" element={<WebhookManagement />} />
        </Routes>
      </Layout>
    </QueryClientProvider>
  )
}

export default App