import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // --- Total Revenue (completed orders) ---
    const completedOrders = await db.order.findMany({
      where: { status: 'COMPLETED' },
      select: { totalAmount: true },
    })
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    // --- Total Expense ---
    const allExpenses = await db.expense.findMany({
      select: { amount: true },
    })
    const totalExpense = allExpenses.reduce((sum, e) => sum + e.amount, 0)

    // --- Total Profit ---
    const totalProfit = totalRevenue - totalExpense

    // --- Order counts ---
    const totalOrders = await db.order.count()
    const pendingOrders = await db.order.count({ where: { status: 'PENDING' } })

    // --- Unpaid invoices ---
    const unpaidInvoices = await db.invoice.findMany({
      where: { status: 'UNPAID' },
      select: { totalAmount: true },
    })
    const unpaidInvoiceCount = unpaidInvoices.length
    const unpaidInvoiceTotal = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0)

    // --- Low stock products ---
    const lowStockProducts = await db.product.count({
      where: {
        stock: { lte: db.product.fields.minStock },
      },
    })

    // --- Top 5 selling products ---
    const topSellingRaw = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    const topSellingProducts = await Promise.all(
      topSellingRaw.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, category: true },
        })
        return {
          product,
          totalSold: item._sum.quantity || 0,
        }
      })
    )

    // --- Monthly Revenue (last 6 months) ---
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const recentCompletedOrders = await db.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo },
      },
      select: { totalAmount: true, createdAt: true },
    })

    const monthlyRevenue: Record<string, number> = {}
    for (const order of recentCompletedOrders) {
      const key = `${order.createdAt.getFullYear()}-${(order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + order.totalAmount
    }

    // Ensure all 6 months are present
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
      if (!monthlyRevenue[key]) monthlyRevenue[key] = 0
    }

    const monthlyRevenueSorted = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }))

    // --- Monthly Expenses (last 6 months) ---
    const recentExpenses = await db.expense.findMany({
      where: {
        date: { gte: sixMonthsAgo },
      },
      select: { amount: true, date: true },
    })

    const monthlyExpenses: Record<string, number> = {}
    for (const expense of recentExpenses) {
      const key = `${expense.date.getFullYear()}-${(expense.date.getMonth() + 1).toString().padStart(2, '0')}`
      monthlyExpenses[key] = (monthlyExpenses[key] || 0) + expense.amount
    }

    // Ensure all 6 months are present
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
      if (!monthlyExpenses[key]) monthlyExpenses[key] = 0
    }

    const monthlyExpensesSorted = Object.entries(monthlyExpenses)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, expense]) => ({ month, expense }))

    // --- Expense by category ---
    const expenseByCategoryRaw = await db.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
    })

    const expenseByCategory = expenseByCategoryRaw.map((item) => ({
      category: item.category,
      total: item._sum.amount || 0,
    }))

    // --- Recent orders (last 5 with customer) ---
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, type: true },
        },
      },
    })

    // --- Customer stats by type ---
    const customerStatsRaw = await db.customer.groupBy({
      by: ['type'],
      _count: true,
    })

    const customerStats: Record<string, number> = {
      DAPUR: 0,
      ECERAN: 0,
      GROSIR: 0,
    }
    for (const stat of customerStatsRaw) {
      customerStats[stat.type] = stat._count
    }

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
        monthlyRevenue: monthlyRevenueSorted,
        monthlyExpenses: monthlyExpensesSorted,
        expenseByCategory,
        recentOrders,
        customerStats,
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
