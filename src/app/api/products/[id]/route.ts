import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'
import type { StockHistory } from '@/lib/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readData()
    const product = data.products.find(p => p.id === id)

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    const stockHistory = data.stockHistory.filter(sh => sh.productId === id)
    const usedInOrders = data.orders.some(o =>
      o.items.some(item => item.productId === id)
    )

    return NextResponse.json({
      data: {
        ...product,
        stockHistory,
        _count: {
          orderItems: data.orders.reduce((sum, o) =>
            sum + o.items.filter(i => i.productId === id).length, 0),
          stockHistory: stockHistory.length,
        },
      },
    })
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
    const data = await readData()
    const idx = data.products.findIndex(p => p.id === id)

    if (idx === -1) {
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

    const existing = data.products[idx]

    // Check if stock changed, create StockHistory entry
    if (stock !== undefined && stock !== existing.stock) {
      const diff = stock - existing.stock
      const entry: StockHistory = {
        id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: id,
        type: diff > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(diff),
        note: 'Stok diperbarui secara manual',
        createdAt: new Date().toISOString(),
      }
      data.stockHistory.unshift(entry)
    }

    if (name !== undefined) existing.name = name
    if (category !== undefined) existing.category = category
    if (unit !== undefined) existing.unit = unit
    if (buyPrice !== undefined) existing.buyPrice = Math.round(buyPrice)
    if (sellPrice !== undefined) existing.sellPrice = Math.round(sellPrice)
    if (stock !== undefined) existing.stock = stock
    if (minStock !== undefined) existing.minStock = minStock

    data.products[idx] = existing
    await writeData(data)

    return NextResponse.json({ data: existing })
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
    const data = await readData()
    const idx = data.products.findIndex(p => p.id === id)

    if (idx === -1) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      )
    }

    const usedInOrders = data.orders.some(o =>
      o.items.some(item => item.productId === id)
    )

    if (usedInOrders) {
      return NextResponse.json(
        { error: 'Produk tidak dapat dihapus karena sudah digunakan dalam pesanan' },
        { status: 400 }
      )
    }

    data.products.splice(idx, 1)
    await writeData(data)

    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    )
  }
}
