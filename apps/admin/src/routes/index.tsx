import { createFileRoute } from '@tanstack/react-router'
import { Outlet, Link, Navigate } from '@tanstack/react-router'
import { Layout, Menu, LogOut, Home, Tag, QrCode, Settings, Users, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: DashboardLayout,
  beforeLoad: async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Navigate({ to: '/login' })
    }
  },
})

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/tags', label: 'Tags', icon: Tag },
    { path: '/items', label: 'Items', icon: QrCode },
    { path: '/users', label: 'Users', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const token = localStorage.getItem('admin_token')

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${mobileMenuOpen ? 'translate-x-0' : ''}`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center h-20 px-4 border-b border-neutral-200 relative">
            <Link to="/" className="flex items-center gap-2 text-violet-600" aria-label="ME PERDÍ Admin Home">
              <img
                src="/icons/logo_iamlost_transparente.png"
                alt="ME PERDÍ"
                className="h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.src = '/icons/logo_iamlost.png'
                }}
              />
              <span className="font-bold text-xl text-neutral-900">ME PERDÍ</span>
            </Link>
            <button
              className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <button
              onClick={() => {
                localStorage.removeItem('admin_token')
                window.location.href = '/login'
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition-colors"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main content */}
      <main className={`lg:ml-64 min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-neutral-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex lg:justify-end lg:items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Shield className="w-4 h-4 text-violet-600" />
                <span>Admin Panel</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}