import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateInvoiceNumber(orderId: string): string {
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
    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        invoice: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: order })
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
    const existing = await db.order.findUnique({
      where: { id },
      include: { invoice: true, payments: true },
    })

    if (!existing) {
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

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes || null

    const order = await db.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          items: { include: { product: true } },
          invoice: true,
          payments: true,
        },
      })

      // Auto-create invoice when status changes to COMPLETED
      if (status === 'COMPLETED' && !existing.invoice) {
        const totalAmount = updatedOrder.totalAmount
        const ppnRate = 11
        const ppnAmount = Math.round(totalAmount * ppnRate / 100)
        const totalWithPpn = totalAmount + ppnAmount

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber: generateInvoiceNumber(id),
            orderId: id,
            status: 'UNPAID',
            ppnRate,
            ppnAmount,
            totalAmount: totalWithPpn,
            dueDate,
          },
        })

        updatedOrder.invoice = invoice
      }

      // If order is CANCELLED, restore stock
      if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
        for (const item of existing.items || []) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })

          await tx.stockHistory.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              note: `Pesanan ${existing.orderNumber} dibatalkan`,
            },
          })
        }
      }

      return updatedOrder
    })

    return NextResponse.json({ data: order })
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
    const existing = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Restore stock before deleting
    await db.$transaction(async (tx) => {
      for (const item of existing.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }

      // Delete order (cascade will delete items and payments)
      await tx.order.delete({ where: { id } })
    })

    return NextResponse.json({ message: 'Pesanan berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pesanan' },
      { status: 500 }
    )
  }
}
