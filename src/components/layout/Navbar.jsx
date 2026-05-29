import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',       label: 'Garage' },
  { to: '/builds', label: 'Builds' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()

  return (
    <header className="bg-surf border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        <Link to="/" className="font-barlow text-2xl font-bold tracking-tight flex-shrink-0">
          FH6 <span className="text-accent">TUNING</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 flex-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-base font-medium transition-colors ${
                pathname === to ? 'text-accent' : 'text-mid hover:text-text'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:block text-dim text-sm truncate max-w-[180px]">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-dim hover:text-text transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
