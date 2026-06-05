import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Transactions', to: '/' },
  { label: 'Create Payment', to: '/create' },
  { label: 'Invoices', to: '/invoices' },
  { label: 'Webhooks', to: '/webhooks' },
  { label: 'Admin', to: '/admin' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            Payment Provider
          </Link>
          <nav className="flex gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
              return (
                <Link key={item.to} to={item.to}>
                  <Button variant={isActive ? 'default' : 'ghost'} size="sm">
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
