import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import odwLogo from '../assets/Optimum logo.jpg'

function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-odw-bg text-odw-text flex flex-col lg:flex-row antialiased">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b border-odw-border bg-white px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-odw-border bg-white text-odw-text-muted hover:bg-slate-50 hover:text-odw-text transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <div className="flex items-center justify-center h-9 w-32 overflow-hidden">
            <img
              src={odwLogo}
              alt="Optimum Digital Works"
              className="w-[130px] max-w-none h-auto object-contain shrink-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-odw-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="font-medium text-odw-text">ODW System</span>
        </div>
      </header>

      {/* Sidebar Shell */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
