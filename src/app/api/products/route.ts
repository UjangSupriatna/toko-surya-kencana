import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'
import type { Product } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''

    const data = await readData()
    let products = [...data.products]

    if (q) {
      const lower = q.toLowerCase()
      products = products.filter(p => p.name.toLowerCase().includes(lower))
    }
    if (category) {
      products = products.filter(p => p.category === category)
    }

    return NextResponse.json({ data: products })
  } catch (error) {
    console.error('Error listing products:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, unit, buyPrice, sellPrice, stock, minStock } = body

    if (!name || !category || !unit || buyPrice == null || sellPrice == null) {
      return NextResponse.json(
        { error: 'Nama, kategori, satuan, harga beli, dan harga jual wajib diisi' },
        { status: 400 }
      )
    }

    if (typeof buyPrice !== 'number' || buyPrice < 0) {
      return NextResponse.json(
        { error: 'Harga beli harus berupa angka positif' },
        { status: 400 }
      )
    }

    if (typeof sellPrice !== 'number' || sellPrice < 0) {
      return NextResponse.json(
        { error: 'Harga jual harus berupa angka positif' },
        { status: 400 }
      )
    }

    const data = await readData()
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      category,
      unit,
      buyPrice: Math.round(buyPrice),
      sellPrice: Math.round(sellPrice),
      stock: typeof stock === 'number' ? stock : 0,
      minStock: typeof minStock === 'number' ? minStock : 10,
    }

    data.products.push(newProduct)
    await writeData(data)

    return NextResponse.json({ data: newProduct }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Gagal membuat produk' },
      { status: 500 }
    )
  }
}
