import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'
import type { Order, OrderItem, StockHistory } from '@/lib/types'

function generateOrderNumber(data: Order[]): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')

  const seq = now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')

  return `ORD-${seq}-${month}${year}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    const data = await readData()
    let orders = [...data.orders]

    if (status) {
      orders = orders.filter(o => o.status === status)
    }

    if (from) {
      const fromDate = new Date(from)
      orders = orders.filter(o => new Date(o.createdAt) >= fromDate)
    }
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      orders = orders.filter(o => new Date(o.createdAt) <= toDate)
    }

    // Sort by createdAt desc
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Enrich with customer info and product info in items
    const enrichedOrders = orders.map(order => {
      const customer = data.customers.find(c => c.id === order.customerId)
      const enrichedItems = order.items.map(item => {
        const product = data.products.find(p => p.id === item.productId)
        return { ...item, product: product || null }
      })
      const paymentsCount = data.payments.filter(p => p.orderId === order.id).length
      return {
        ...order,
        customer: customer || null,
        items: enrichedItems,
        _count: { payments: paymentsCount },
      }
    })

    return NextResponse.json({ data: enrichedOrders })
  } catch (error) {
    console.error('Error listing orders:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, items, notes } = body

    if (!customerId) {
      return NextResponse.json(
        { error: 'Pelanggan wajib diisi' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Item pesanan wajib diisi' },
        { status: 400 }
      )
    }

    const data = await readData()

    // Validate customer exists
    const customer = data.customers.find(c => c.id === customerId)
    if (!customer) {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validate all products and calculate totals
    let totalAmount = 0
    const orderItemsData: OrderItem[] = []
    const now = new Date().toISOString()

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Setiap item harus memiliki productId dan quantity yang valid' },
          { status: 400 }
        )
      }

      const product = data.products.find(p => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produk dengan ID ${item.productId} tidak ditemukan` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok ${product.name} tidak mencukupi (tersedia: ${product.stock})` },
          { status: 400 }
        )
      }

      const price = item.price || product.sellPrice
      const subtotal = price * item.quantity
      totalAmount += subtotal

      orderItemsData.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: item.productId,
        quantity: item.quantity,
        price: Math.round(price),
        subtotal: Math.round(subtotal),
      })
    }

    const orderNumber = generateOrderNumber(data.orders)

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId,
      status: 'PENDING',
      notes: notes || null,
      totalAmount: Math.round(totalAmount),
      createdAt: now,
      updatedAt: now,
      items: orderItemsData,
    }

    // Deduct stock and create stock history entries
    const newStockHistory: StockHistory[] = []
    for (const item of orderItemsData) {
      const product = data.products.find(p => p.id === item.productId)!
      product.stock -= item.quantity

      newStockHistory.push({
        id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: item.productId,
        type: 'OUT',
        quantity: item.quantity,
        note: `Pesanan ${orderNumber}`,
        createdAt: now,
      })
    }

    data.orders.unshift(newOrder)
    data.stockHistory.unshift(...newStockHistory)
    await writeData(data)

    // Return enriched order
    const enrichedOrder = {
      ...newOrder,
      customer,
      items: newOrder.items.map(item => ({
        ...item,
        product: data.products.find(p => p.id === item.productId) || null,
      })),
    }

    return NextResponse.json({ data: enrichedOrder }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    )
  }
}
