import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')

  // Get the latest order to determine sequence
  const prefix = `ORD-${year}${month}`
  // We'll use a timestamp-based approach for uniqueness
  const seq = now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')

  return `${prefix}-${seq}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (from || to) {
      where.createdAt = {}
      if (from) {
        (where.createdAt as Record<string, unknown>).gte = new Date(from)
      }
      if (to) {
        // Include the entire end date
        const endDate = new Date(to)
        endDate.setHours(23, 59, 59, 999)
        ;(where.createdAt as Record<string, unknown>).lte = endDate
      }
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json({ data: orders })
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

    // Validate customer exists
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 400 }
      )
    }

    // Validate all products and calculate totals
    let totalAmount = 0
    const orderItemsData = []

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Setiap item harus memiliki productId dan quantity yang valid' },
          { status: 400 }
        )
      }

      const product = await db.product.findUnique({
        where: { id: item.productId },
      })

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
        productId: item.productId,
        quantity: item.quantity,
        price: Math.round(price),
        subtotal: Math.round(subtotal),
      })
    }

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId,
          status: 'PENDING',
          notes: notes || null,
          totalAmount: Math.round(totalAmount),
          items: {
            create: orderItemsData,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // Deduct stock and create stock history entries
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })

        await tx.stockHistory.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            note: `Pesanan ${newOrder.orderNumber}`,
          },
        })
      }

      return newOrder
    })

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    )
  }
}
