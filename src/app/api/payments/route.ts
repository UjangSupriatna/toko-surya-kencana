import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const where: Record<string, unknown> = {}

    if (from || to) {
      where.date = {}
      if (from) {
        (where.date as Record<string, unknown>).gte = new Date(from)
      }
      if (to) {
        const endDate = new Date(to)
        endDate.setHours(23, 59, 59, 999)
        ;(where.date as Record<string, unknown>).lte = endDate
      }
    }

    const payments = await db.payment.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    })

    return NextResponse.json({ data: payments })
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

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { invoice: true, payments: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    const payment = await db.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          paymentNumber: generatePaymentNumber(),
          orderId,
          amount: Math.round(amount),
          method: method || 'TRANSFER',
          date: date ? new Date(date) : new Date(),
          notes: notes || null,
        },
        include: {
          order: {
            include: {
              customer: true,
            },
          },
        },
      })

      // Calculate total payments for this order
      const allPayments = await tx.payment.findMany({
        where: { orderId },
      })

      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0)
      const orderTotal = order.totalAmount

      // If total payments >= order total, auto-update invoice to PAID
      if (totalPaid >= orderTotal && order.invoice) {
        await tx.invoice.update({
          where: { id: order.invoice.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        })
      }

      return newPayment
    })

    return NextResponse.json({ data: payment }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pembayaran' },
      { status: 500 }
    )
  }
}
