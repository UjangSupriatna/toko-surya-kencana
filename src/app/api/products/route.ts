import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (q) {
      where.name = { contains: q }
    }
    if (category) {
      where.category = category
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
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

    const product = await db.product.create({
      data: {
        name,
        category,
        unit,
        buyPrice: Math.round(buyPrice),
        sellPrice: Math.round(sellPrice),
        stock: typeof stock === 'number' ? stock : 0,
        minStock: typeof minStock === 'number' ? minStock : 10,
      },
    })

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Gagal membuat produk' },
      { status: 500 }
    )
  }
}
