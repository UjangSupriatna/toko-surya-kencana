import { NextResponse } from 'next/server'
import { readData } from '@/lib/json-db'

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const month = MONTH_NAMES[d.getMonth()]
  const year = d.getFullYear().toString().slice(-2)
  return `${month} ${year}`
}

export async function GET() {
  try {
    const data = await readData()

    // --- Total Revenue (completed orders) ---
    const completedOrders = data.orders.filter(o => o.status === 'COMPLETED')
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    // --- Total Expense ---
    const totalExpense = data.expenses.reduce((sum, e) => sum + e.amount, 0)

    // --- Total Profit ---
    const totalProfit = totalRevenue - totalExpense

    // --- Order counts ---
    const nonCancelledOrders = data.orders.filter(o => o.status !== 'CANCELLED')
    const totalOrders = nonCancelledOrders.length
    const pendingOrders = data.orders.filter(o => o.status === 'PENDING').length

    // --- Unpaid invoices ---
    const unpaidInvoices = data.invoices.filter(i => i.status === 'UNPAID')
    const unpaidInvoiceCount = unpaidInvoices.length
    const unpaidInvoiceTotal = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0)

    // --- Low stock products ---
    const lowStockProducts = data.products.filter(p => p.stock <= p.minStock).length

    // --- Top 5 selling products ---
    const productSoldMap: Record<string, { productId: string; totalSold: number }> = {}
    for (const order of data.orders) {
      if (order.status === 'CANCELLED') continue
      for (const item of order.items) {
        if (!productSoldMap[item.productId]) {
          productSoldMap[item.productId] = { productId: item.productId, totalSold: 0 }
        }
        productSoldMap[item.productId].totalSold += item.quantity
      }
    }

    const topSellingProducts = Object.values(productSoldMap)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
      .map(item => {
        const product = data.products.find(p => p.id === item.productId)
        return {
          product: product ? { id: product.id, name: product.name, category: product.category } : null,
          totalSold: item.totalSold,
        }
      })

    // --- Monthly Revenue (last 6 months) ---
    const now = new Date()
    const monthlyRevenueMap: Record<string, number> = {}

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = getMonthLabel(d.toISOString())
      monthlyRevenueMap[key] = 0
    }

    for (const order of completedOrders) {
      const label = getMonthLabel(order.createdAt)
      if (label in monthlyRevenueMap) {
        monthlyRevenueMap[label] += order.totalAmount
      }
    }

    const monthlyRevenue = Object.entries(monthlyRevenueMap)
      .map(([month, revenue]) => ({ month, revenue }))

    // --- Monthly Expenses (last 6 months) ---
    const monthlyExpensesMap: Record<string, number> = {}

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = getMonthLabel(d.toISOString())
      monthlyExpensesMap[key] = 0
    }

    for (const expense of data.expenses) {
      const label = getMonthLabel(expense.date)
      if (label in monthlyExpensesMap) {
        monthlyExpensesMap[label] += expense.amount
      }
    }

    const monthlyExpenses = Object.entries(monthlyExpensesMap)
      .map(([month, expense]) => ({ month, expense }))

    // --- Expense by category ---
    const expenseByCategoryMap: Record<string, number> = {}
    for (const expense of data.expenses) {
      expenseByCategoryMap[expense.category] = (expenseByCategoryMap[expense.category] || 0) + expense.amount
    }
    const expenseByCategory = Object.entries(expenseByCategoryMap)
      .map(([category, total]) => ({ category, total }))

    // --- Recent orders (last 5 with customer) ---
    const recentOrders = [...data.orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => {
        const customer = data.customers.find(c => c.id === order.customerId)
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          customer: customer ? { id: customer.id, name: customer.name, type: customer.type, phone: customer.phone } : null,
        }
      })

    // --- Customer stats by type ---
    const customerStats = { DAPUR: 0, ECERAN: 0, GROSIR: 0 }
    for (const customer of data.customers) {
      customerStats[customer.type] = (customerStats[customer.type] || 0) + 1
    }

    // --- Total customers ---
    const totalCustomers = data.customers.length

    // --- Average order value (completed orders) ---
    const avgOrderValue = completedOrders.length > 0
      ? Math.round(totalRevenue / completedOrders.length)
      : 0

    return NextResponse.json({
      data: {
        totalRevenue,
        totalExpense,
        totalProfit,
        totalOrders,
        pendingOrders,
        unpaidInvoices: {
          count: unpaidInvoiceCount,
          total: unpaidInvoiceTotal,
        },
        lowStockProducts,
        topSellingProducts,
        monthlyRevenue,
        monthlyExpenses,
        expenseByCategory,
        recentOrders,
        customerStats,
        totalCustomers,
        avgOrderValue,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    )
  }
}
