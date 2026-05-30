import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import TransactionsPage from './pages/transactions'
import TransactionDetailPage from './pages/transaction-detail'
import TransactionConfirmationPage from './pages/transaction-confirmation'
import ThreeDSPage from './pages/three-ds'
import AdminDashboard from './pages/admin'
import WebhookManagement from './pages/webhooks'

const queryClient = new QueryClient()

function App() {
  const location = useLocation()

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Router>
        <div className="min-h-screen bg-background">
          {/* Header/Navigation */}
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">MP</AvatarFallback>
                </Avatar>
                <h1 className="text-xl font-bold">Mock Payment Provider</h1>
              </div>
              <nav className="flex gap-2">
                <Link to="/transactions">
                  <Button variant={location.pathname === '/transactions' ? 'default' : 'ghost'}>
                    Transactions
                  </Button>
                </Link>
                <Link to="/webhooks">
                  <Button variant={location.pathname === '/webhooks' ? 'default' : 'ghost'}>
                    Webhooks
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button variant={location.pathname === '/admin' ? 'default' : 'ghost'}>
                    Admin
                  </Button>
                </Link>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<TransactionsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/:id" element={<TransactionDetailPage />} />
              <Route path="/confirm/:id" element={<TransactionConfirmationPage />} />
              <Route path="/3ds" element={<ThreeDSPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/webhooks" element={<WebhookManagement />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App