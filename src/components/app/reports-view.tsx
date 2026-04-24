'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react'
import { formatRupiah, formatNumber, getCustomerTypeLabel } from '@/lib/format'

interface ReportData {
  totalRevenue: number
  totalExpense: number
  totalProfit: number
  totalOrders: number
  totalCustomers: number
  avgOrderValue: number
  topSellingProducts: { product: { id: string; name: string; category: string } | null; totalSold: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
  monthlyExpenses: { month: string; expense: number }[]
  expenseByCategory: { category: string; total: number }[]
  customerStats: Record<string, number>
  lowStockProducts: number
}

const CHART_COLORS = ['#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed', '#db2777', '#65a30d', '#ea580c']

export default function ReportsView() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('6months')

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-6">
      <Skeleton className="h-10 w-60 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  }

  if (!data) return <Card><CardContent className="text-center py-12 text-muted-foreground">Gagal memuat data laporan</CardContent></Card>

  const mergedMonthly = data.monthlyRevenue.map((r, i) => ({
    month: r.month,
    Pendapatan: r.revenue,
    Pengeluaran: data.monthlyExpenses[i]?.expense || 0,
    Laba: r.revenue - (data.monthlyExpenses[i]?.expense || 0),
  }))

  const topProductsForChart = data.topSellingProducts.slice(0, 7).map(p => ({
    productName: p.product?.name || 'Produk',
    totalSold: p.totalSold,
  }))

  const customerStatsArray = Object.entries(data.customerStats).map(([type, count]) => ({ type, count }))

  const cogs = data.totalRevenue * 0.65
  const grossProfit = data.totalRevenue - cogs
  const netProfit = grossProfit - data.totalExpense
  const profitMargin = data.totalRevenue > 0 ? Math.round(netProfit / data.totalRevenue * 100) : 0

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Periode:</span>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Bulan Ini</SelectItem>
            <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
            <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
            <SelectItem value="all">Semua Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Income Statement */}
      <Card className="border-2 border-emerald-200">
        <CardHeader className="pb-2 bg-emerald-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />Laporan Laba Rugi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm text-muted-foreground">Pendapatan Penjualan</p>
              </div>
              <p className="text-xl font-bold text-emerald-600">{formatRupiah(data.totalRevenue)}</p>
            </div>
            <div className="flex justify-between items-center py-2 pl-4 border-l-2 border-muted">
              <div>
                <p className="text-sm text-muted-foreground">Harga Pokok Penjualan (est.)</p>
              </div>
              <p className="text-lg font-medium text-red-500">({formatRupiah(cogs)})</p>
            </div>
            <div className="flex justify-between items-center py-2 border-t-2 border-dashed">
              <div>
                <p className="font-semibold">Laba Kotor</p>
              </div>
              <p className="text-lg font-bold">{formatRupiah(grossProfit)}</p>
            </div>
            <div className="flex justify-between items-center py-2 pl-4 border-l-2 border-muted">
              <div>
                <p className="text-sm text-muted-foreground">Beban Operasional</p>
              </div>
              <p className="text-lg font-medium text-red-500">({formatRupiah(data.totalExpense)})</p>
            </div>
            <div className="flex justify-between items-center py-3 bg-emerald-50 px-4 rounded-lg mt-2">
              <div>
                <p className="font-bold text-lg">Laba Bersih</p>
                <p className="text-xs text-muted-foreground">Margin: {profitMargin}%</p>
              </div>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatRupiah(netProfit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-xl font-bold">{data.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Total Pesanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-xl font-bold">{formatRupiah(data.avgOrderValue)}</p>
            <p className="text-xs text-muted-foreground">Rata-rata Pesanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-xl font-bold">{data.totalCustomers}</p>
            <p className="text-xs text-muted-foreground">Total Pelanggan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-5 w-5 mx-auto text-amber-500 mb-2" />
            <p className="text-xl font-bold text-amber-600">{data.lowStockProducts}</p>
            <p className="text-xs text-muted-foreground">Produk Stok Rendah</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expense */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pendapatan vs Pengeluaran Bulanan</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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

        {/* Profit Trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Tren Laba Bersih</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mergedMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}jt`} />
                <RechartsTooltip formatter={(v: number) => formatRupiah(v)} />
                <Area type="monotone" dataKey="Laba" stroke="#059669" fill="url(#profitGradient)" strokeWidth={2} />
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Komposisi Pengeluaran</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.expenseByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {data.expenseByCategory.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(v: number) => formatRupiah(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Produk Terlaris</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsForChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="productName" type="category" width={140} tick={{ fontSize: 11 }} />
                <RechartsTooltip formatter={(v: number, name: string) => name === 'totalSold' ? [`${v} unit`, 'Terjual'] : [formatRupiah(v), 'Pendapatan']} />
                <Bar dataKey="totalSold" fill="#059669" radius={[0, 4, 4, 0]} name="Terjual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Distribusi Pelanggan</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {customerStatsArray.map((cs) => (
              <div key={cs.type} className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{cs.count}</p>
                <p className="text-sm text-muted-foreground">{getCustomerTypeLabel(cs.type)}</p>
                <p className="text-xs text-muted-foreground">{data.totalCustomers > 0 ? Math.round(cs.count / data.totalCustomers * 100) : 0}% dari total</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
