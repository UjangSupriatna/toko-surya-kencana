'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, Package, ShoppingCart, Receipt, Users,
  Wallet, BarChart3, Menu, Store, ChevronLeft, ChevronRight
} from 'lucide-react'
import DashboardView from '@/components/app/dashboard-view'
import ProductsView from '@/components/app/products-view'
import OrdersView from '@/components/app/orders-view'
import InvoicesView from '@/components/app/invoices-view'
import CustomersView from '@/components/app/customers-view'
import ExpensesView from '@/components/app/expenses-view'
import ReportsView from '@/components/app/reports-view'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Produk & Inventaris', icon: Package },
  { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
  { id: 'invoices', label: 'Faktur', icon: Receipt },
  { id: 'customers', label: 'Pelanggan', icon: Users },
  { id: 'expenses', label: 'Pengeluaran', icon: Wallet },
  { id: 'reports', label: 'Laporan Keuangan', icon: BarChart3 },
]

const VIEW_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  products: ProductsView,
  orders: OrdersView,
  invoices: InvoicesView,
  customers: CustomersView,
  expenses: ExpensesView,
  reports: ReportsView,
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const ActiveView = VIEW_MAP[activeTab] || DashboardView

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white border-r transition-all duration-300 ${sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'}`}>
        <div className="h-16 flex items-center gap-3 px-4 border-b shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm leading-tight">Toko Surya Kencana</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">Sistem Manajemen Supplier</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center mx-auto">
              <Store className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 py-3 px-2">
          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${isActive
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-emerald-600' : ''}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-2 shrink-0">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Tutup Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white border-b shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <div className="h-16 flex items-center gap-3 px-4 border-b">
                  <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm leading-tight">Toko Surya Kencana</h1>
                    <p className="text-[10px] text-muted-foreground leading-tight">Sistem Manajemen Supplier</p>
                  </div>
                </div>
                <ScrollArea className="h-[calc(100vh-64px)] py-3 px-2">
                  <nav className="space-y-1">
                    {NAV_ITEMS.map(item => {
                      const Icon = item.icon
                      const isActive = activeTab === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id); setMobileOpen(false) }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                            ${isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                          `}
                        >
                          <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-emerald-600' : ''}`} />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">
                {NAV_ITEMS.find(i => i.id === activeTab)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Selamat datang,</p>
              <p className="text-sm font-medium">Fikri</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              FK
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6">
          <ActiveView />
        </div>

        {/* Footer */}
        <footer className="border-t bg-white px-4 lg:px-6 py-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Toko Surya Kencana. Sistem Manajemen Supplier.</p>
            <p>Kab. Pati, Jawa Tengah</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
