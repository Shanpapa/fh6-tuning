import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import PageLayout from './components/layout/PageLayout'
import Login       from './pages/Login'
import Garage      from './pages/Garage'
import CarDetail   from './pages/CarDetail'
import Builder     from './pages/Builder'
import Advisor     from './pages/Advisor'
import PublicBuilds from './pages/PublicBuilds'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="text-dim text-base">Loading…</span>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PageLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Garage />} />
            <Route path="car/:id" element={<CarDetail />} />
            <Route path="builder/:id" element={<Builder />} />
            <Route path="advisor/:id" element={<Advisor />} />
            <Route path="builds" element={<PublicBuilds />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
