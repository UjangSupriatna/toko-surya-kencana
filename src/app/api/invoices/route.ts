import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'
import type { Invoice } from '@/lib/types'

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

    const data = await readData()
    let invoices = [...data.invoices]

    if (status) {
      invoices = invoices.filter(i => i.status === status)
    }

    // Sort by createdAt desc
    invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Enrich with order info (customer, totalAmount)
    const enrichedInvoices = invoices.map(invoice => {
      const order = data.orders.find(o => o.id === invoice.orderId)
      const customer = order ? data.customers.find(c => c.id === order.customerId) : null
      return {
        ...invoice,
        order: order ? {
          ...order,
          customer: customer || null,
        } : null,
      }
    })

    return NextResponse.json({ data: enrichedInvoices })
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

    const data = await readData()

    // Check if invoice already exists for this order
    const existingInvoice = data.invoices.find(i => i.orderId === orderId)
    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice sudah ada untuk pesanan ini' },
        { status: 400 }
      )
    }

    const order = data.orders.find(o => o.id === orderId)
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

    const now = new Date().toISOString()

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      orderId,
      status: 'UNPAID',
      ppnRate: taxRate,
      ppnAmount,
      totalAmount,
      dueDate: dueDate.toISOString(),
      paidAt: null,
      createdAt: now,
    }

    data.invoices.push(newInvoice)
    await writeData(data)

    // Enrich with order info
    const customer = data.customers.find(c => c.id === order.customerId)

    return NextResponse.json({
      data: {
        ...newInvoice,
        order: {
          ...order,
          customer: customer || null,
        },
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Gagal membuat invoice' },
      { status: 500 }
    )
  }
}
