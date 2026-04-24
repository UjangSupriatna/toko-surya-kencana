'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, ShoppingCart, AlertTriangle, Package, Users, Wallet } from 'lucide-react'
import { formatRupiah, formatNumber, formatDate, getStatusColor, getStatusLabel, getCustomerTypeColor, getCustomerTypeLabel } from '@/lib/format'

interface ReportData {
  totalRevenue: number
  totalExpense: number
  totalProfit: number
  totalOrders: number
  pendingOrders: number
  unpaidInvoices: { count: number; total: number }
  lowStockProducts: number
  topSellingProducts: { product: { id: string; name: string; category: string } | null; totalSold: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
  monthlyExpenses: { month: string; expense: number }[]
  expenseByCategory: { category: string; total: number }[]
  recentOrders: { id: string; orderNumber: string; status: string; totalAmount: number; createdAt: string; customer: { id: string; name: string; type: string; phone: string } | null }[]
  customerStats: Record<string, number>
  totalCustomers: number
  avgOrderValue: number
}

const CHART_COLORS = ['#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed', '#db2777']

export default function DashboardView() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!data) return <div className="text-center py-12 text-muted-foreground">Gagal memuat data dashboard</div>

  const mergedMonthly = data.monthlyRevenue.map((r, i) => ({
    month: r.month,
    Pendapatan: r.revenue,
    Pengeluaran: data.monthlyExpenses[i]?.expense || 0,
    Laba: r.revenue - (data.monthlyExpenses[i]?.expense || 0),
  }))

  const topProducts = data.topSellingProducts.slice(0, 5).reverse()
  const customerStatsArray = Object.entries(data.customerStats).map(([type, count]) => ({ type, count }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold text-emerald-600">{formatRupiah(data.totalRevenue)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs">
              {data.totalProfit > 0 ? <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" /> : <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
              <span className={data.totalProfit > 0 ? 'text-emerald-600' : 'text-red-600'}>
                {formatRupiah(Math.abs(data.totalProfit))} laba bersih
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600">{formatRupiah(data.totalExpense)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pesanan Aktif</p>
                <p className="text-2xl font-bold">{formatNumber(data.totalOrders)}</p>
                {data.pendingOrders > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs bg-amber-100 text-amber-800">{data.pendingOrders} menunggu</Badge>
                )}
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pelanggan</p>
                <p className="text-2xl font-bold">{formatNumber(data.totalCustomers)}</p>
                {data.unpaidInvoices.count > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs bg-red-100 text-red-800">{data.unpaidInvoices.count} invoice belum bayar</Badge>
                )}
              </div>
              <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold">{formatNumber(data.lowStockProducts)}</p>
            <p className="text-xs text-muted-foreground">Stok Rendah</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wallet className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold">{formatRupiah(data.avgOrderValue)}</p>
            <p className="text-xs text-muted-foreground">Rata-rata Pesanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-lg font-bold text-emerald-600">{formatRupiah(data.totalRevenue - data.totalExpense)}</p>
            <p className="text-xs text-muted-foreground">Laba Bersih</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-lg font-bold text-red-600">{formatRupiah(data.unpaidInvoices.total)}</p>
            <p className="text-xs text-muted-foreground">Invoice Belum Bayar</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expense Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pendapatan vs Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mergedMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}jt`} />
                <RechartsTooltip formatter={(v: number) => formatRupiah(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Pendapatan" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.expenseByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {data.expenseByCategory.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(v: number) => formatRupiah(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Profit Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tren Laba Bersih</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mergedMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}jt`} />
              <RechartsTooltip formatter={(v: number) => formatRupiah(v)} />
              <Area type="monotone" dataKey="Laba" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.customer?.name || 'Pelanggan'} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-semibold text-sm">{formatRupiah(order.totalAmount)}</p>
                    <Badge variant="outline" className={`text-[10px] ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Statistik Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerStatsArray.map((cs) => (
                  <div key={cs.type} className="flex items-center justify-between">
                    <Badge variant="outline" className={getCustomerTypeColor(cs.type)}>
                      {getCustomerTypeLabel(cs.type)}
                    </Badge>
                    <span className="font-bold">{cs.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.product?.id || i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.product?.name || 'Produk'}</p>
                      <p className="text-[10px] text-muted-foreground">{formatNumber(p.totalSold)} terjual</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
