import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true, stockHistory: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Error getting product:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
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
    const existing = await db.product.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, category, unit, buyPrice, sellPrice, stock, minStock } = body

    if (name !== undefined && !name) {
      return NextResponse.json(
        { error: 'Nama produk tidak boleh kosong' },
        { status: 400 }
      )
    }

    // Check if stock changed, create StockHistory entry
    if (stock !== undefined && stock !== existing.stock) {
      const diff = stock - existing.stock
      await db.stockHistory.create({
        data: {
          productId: id,
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          note: 'Stok diperbarui secara manual',
        },
      })
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(unit !== undefined && { unit }),
        ...(buyPrice !== undefined && { buyPrice: Math.round(buyPrice) }),
        ...(sellPrice !== undefined && { sellPrice: Math.round(sellPrice) }),
        ...(stock !== undefined && { stock }),
        ...(minStock !== undefined && { minStock }),
      },
    })

    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate produk' },
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
    const existing = await db.product.findUnique({
      where: { id },
      include: { orderItems: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existing.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Produk tidak dapat dihapus karena sudah digunakan dalam pesanan' },
        { status: 400 }
      )
    }

    await db.product.delete({ where: { id } })

    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
}
