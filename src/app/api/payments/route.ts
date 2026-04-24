import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'
import type { Payment } from '@/lib/types'

function generatePaymentNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const seq = now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')
  return `PAY-${year}${month}-${seq}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    const data = await readData()
    let payments = [...data.payments]

    if (from) {
      const fromDate = new Date(from)
      payments = payments.filter(p => new Date(p.date) >= fromDate)
    }
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      payments = payments.filter(p => new Date(p.date) <= toDate)
    }

    // Sort by date desc
    payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Enrich with order info (customer)
    const enrichedPayments = payments.map(payment => {
      const order = data.orders.find(o => o.id === payment.orderId)
      const customer = order ? data.customers.find(c => c.id === order.customerId) : null
      return {
        ...payment,
        order: order ? {
          ...order,
          customer: customer || null,
        } : null,
      }
    })

    return NextResponse.json({ data: enrichedPayments })
  } catch (error) {
    console.error('Error listing payments:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pembayaran' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, method, date, notes } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Pesanan dan jumlah pembayaran wajib diisi' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Jumlah pembayaran harus berupa angka positif' },
        { status: 400 }
      )
    }

    if (method) {
      const validMethods = ['CASH', 'TRANSFER']
      if (!validMethods.includes(method)) {
        return NextResponse.json(
          { error: 'Metode pembayaran harus CASH atau TRANSFER' },
          { status: 400 }
        )
      }
    }

    const data = await readData()
    const order = data.orders.find(o => o.id === orderId)

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber: generatePaymentNumber(),
      orderId,
      amount: Math.round(amount),
      method: method || 'TRANSFER',
      date: date ? new Date(date).toISOString() : now,
      notes: notes || null,
    }

    data.payments.push(newPayment)

    // Calculate total payments for this order
    const allPayments = data.payments.filter(p => p.orderId === orderId)
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0)

    // If total payments >= order total, auto-update invoice to PAID
    if (totalPaid >= order.totalAmount) {
      const invoiceIdx = data.invoices.findIndex(i => i.orderId === orderId)
      if (invoiceIdx !== -1 && data.invoices[invoiceIdx].status !== 'PAID') {
        data.invoices[invoiceIdx].status = 'PAID'
        data.invoices[invoiceIdx].paidAt = now
      }
    }

    await writeData(data)

    // Enrich response
    const customer = data.customers.find(c => c.id === order.customerId)

    return NextResponse.json({
      data: {
        ...newPayment,
        order: {
          ...order,
          customer: customer || null,
        },
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pembayaran' },
      { status: 500 }
    )
  }
}
