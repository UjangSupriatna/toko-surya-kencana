import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const seq = now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0')
  return `INV-${year}${month}-${seq}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const invoices = await db.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    })

    return NextResponse.json({ data: invoices })
  } catch (error) {
    console.error('Error listing invoices:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data invoice' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, ppnRate, dueDateDays } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Pesanan wajib diisi' },
        { status: 400 }
      )
    }

    // Check if invoice already exists for this order
    const existingInvoice = await db.invoice.findUnique({
      where: { orderId },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice sudah ada untuk pesanan ini' },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    const taxRate = typeof ppnRate === 'number' ? ppnRate : 11
    const ppnAmount = Math.round(order.totalAmount * taxRate / 100)
    const totalAmount = order.totalAmount + ppnAmount

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (typeof dueDateDays === 'number' ? dueDateDays : 30))

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        orderId,
        status: 'UNPAID',
        ppnRate: taxRate,
        ppnAmount,
        totalAmount,
        dueDate,
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    })

    return NextResponse.json({ data: invoice }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Gagal membuat invoice' },
      { status: 500 }
    )
  }
}
