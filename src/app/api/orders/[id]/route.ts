import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'
import type { Invoice, StockHistory } from '@/lib/types'

function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const seq = now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0')
  return `INV-${year}${month}-${seq}`
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readData()
    const order = data.orders.find(o => o.id === id)

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    const customer = data.customers.find(c => c.id === order.customerId)
    const invoice = data.invoices.find(i => i.orderId === id) || null
    const payments = data.payments
      .filter(p => p.orderId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const enrichedItems = order.items.map(item => {
      const product = data.products.find(p => p.id === item.productId)
      return { ...item, product: product || null }
    })

    return NextResponse.json({
      data: {
        ...order,
        customer: customer || null,
        items: enrichedItems,
        invoice,
        payments,
      },
    })
  } catch (error) {
    console.error('Error getting order:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
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
    const orderIdx = data.orders.findIndex(o => o.id === id)

    if (orderIdx === -1) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status, notes } = body

    if (status) {
      const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 }
        )
      }
    }

    const existing = data.orders[orderIdx]
    const now = new Date().toISOString()

    if (status) existing.status = status
    if (notes !== undefined) existing.notes = notes || null
    existing.updatedAt = now

    // Auto-create invoice when status changes to COMPLETED
    let invoice: Invoice | null = null
    if (status === 'COMPLETED') {
      const existingInvoice = data.invoices.find(i => i.orderId === id)
      if (!existingInvoice) {
        const totalAmount = existing.totalAmount
        const ppnRate = 11
        const ppnAmount = Math.round(totalAmount * ppnRate / 100)
        const totalWithPpn = totalAmount + ppnAmount

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)

        invoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber: generateInvoiceNumber(),
          orderId: id,
          status: 'UNPAID',
          ppnRate,
          ppnAmount,
          totalAmount: totalWithPpn,
          dueDate: dueDate.toISOString(),
          paidAt: null,
          createdAt: now,
        }

        data.invoices.push(invoice)
      } else {
        invoice = existingInvoice
      }
    }

    // If order is CANCELLED, restore stock
    if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      const newStockHistory: StockHistory[] = []
      for (const item of existing.items) {
        const product = data.products.find(p => p.id === item.productId)
        if (product) {
          product.stock += item.quantity
        }

        newStockHistory.push({
          id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: item.productId,
          type: 'IN',
          quantity: item.quantity,
          note: `Pesanan ${existing.orderNumber} dibatalkan`,
          createdAt: now,
        })
      }
      data.stockHistory.unshift(...newStockHistory)
    }

    data.orders[orderIdx] = existing
    await writeData(data)

    // Build response
    const customer = data.customers.find(c => c.id === existing.customerId)
    const orderInvoice = invoice || data.invoices.find(i => i.orderId === id) || null
    const payments = data.payments
      .filter(p => p.orderId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const enrichedItems = existing.items.map(item => {
      const product = data.products.find(p => p.id === item.productId)
      return { ...item, product: product || null }
    })

    return NextResponse.json({
      data: {
        ...existing,
        customer: customer || null,
        items: enrichedItems,
        invoice: orderInvoice,
        payments,
      },
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pesanan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readData()
    const orderIdx = data.orders.findIndex(o => o.id === id)

    if (orderIdx === -1) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    const order = data.orders[orderIdx]

    // Restore stock before deleting
    for (const item of order.items) {
      const product = data.products.find(p => p.id === item.productId)
      if (product) {
        product.stock += item.quantity
      }
    }

    // Remove related invoices, payments
    data.invoices = data.invoices.filter(i => i.orderId !== id)
    data.payments = data.payments.filter(p => p.orderId !== id)

    // Remove order
    data.orders.splice(orderIdx, 1)
    await writeData(data)

    return NextResponse.json({ message: 'Pesanan berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pesanan' },
      { status: 500 }
    )
  }
}
