import { Link, useLocation } from 'react-router-dom'
import { Car, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',       label: 'Garage', Icon: Car },
  { to: '/builds', label: 'Builds', Icon: BookOpen },
]

export default function MobileNav() {
  const { pathname } = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surf border-t border-border z-40 safe-bottom">
      <div className="flex">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? 'text-accent' : 'text-dim'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
