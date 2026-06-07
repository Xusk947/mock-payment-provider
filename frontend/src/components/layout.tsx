import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Transactions', to: '/' },
  { label: 'Create', to: '/create' },
  { label: 'Webhooks', to: '/webhooks' },
  { label: 'Admin', to: '/admin' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Payment Provider
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.to ||
                (item.to !== '/' && location.pathname.startsWith(item.to + '/'))
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-secondary rounded-full" />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {children}
      </main>
    </div>
  )
}
