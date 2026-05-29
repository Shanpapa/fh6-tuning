import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MobileNav from './MobileNav'

export default function PageLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}
