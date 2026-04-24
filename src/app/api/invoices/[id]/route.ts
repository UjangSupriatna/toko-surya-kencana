import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readData()
    const invoice = data.invoices.find(i => i.id === id)

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice tidak ditemukan' },
        { status: 404 }
      )
    }

    const order = data.orders.find(o => o.id === invoice.orderId)
    const enrichedOrder = order ? (() => {
      const customer = data.customers.find(c => c.id === order.customerId)
      const enrichedItems = order.items.map(item => {
        const product = data.products.find(p => p.id === item.productId)
        return { ...item, product: product || null }
      })
      const payments = data.payments
        .filter(p => p.orderId === order.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      return {
        ...order,
        customer: customer || null,
        items: enrichedItems,
        payments,
      }
    })() : null

    return NextResponse.json({
      data: {
        ...invoice,
        order: enrichedOrder,
      },
    })
  } catch (error) {
    console.error('Error getting invoice:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data invoice' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readData()
    const idx = data.invoices.findIndex(i => i.id === id)

    if (idx === -1) {
      return NextResponse.json(
        { error: 'Invoice tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status, dueDate } = body

    if (status) {
      const validStatuses = ['UNPAID', 'PAID', 'OVERDUE']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Status harus UNPAID, PAID, atau OVERDUE' },
          { status: 400 }
        )
      }
    }

    const invoice = data.invoices[idx]

    if (status) {
      invoice.status = status
      if (status === 'PAID') {
        invoice.paidAt = new Date().toISOString()
      }
    }
    if (dueDate) {
      invoice.dueDate = new Date(dueDate).toISOString()
    }

    data.invoices[idx] = invoice
    await writeData(data)

    // Enrich with order info
    const order = data.orders.find(o => o.id === invoice.orderId)
    const enrichedOrder = order ? (() => {
      const customer = data.customers.find(c => c.id === order.customerId)
      return {
        ...order,
        customer: customer || null,
      }
    })() : null

    return NextResponse.json({
      data: {
        ...invoice,
        order: enrichedOrder,
      },
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate invoice' },
      { status: 500 }
    )
  }
}
