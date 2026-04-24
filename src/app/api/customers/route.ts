import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || ''

    const where: Record<string, unknown> = {}
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { address: { contains: q } },
      ]
    }
    if (type) {
      where.type = type
    }

    const customers = await db.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    return NextResponse.json({ data: customers })
  } catch (error) {
    console.error('Error listing customers:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pelanggan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address, type } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Nama dan nomor telepon wajib diisi' },
        { status: 400 }
      )
    }

    const validTypes = ['DAPUR', 'ECERAN', 'GROSIR']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipe pelanggan harus DAPUR, ECERAN, atau GROSIR' },
        { status: 400 }
      )
    }

    const customer = await db.customer.create({
      data: {
        name,
        phone,
        address: address || null,
        type: type || 'DAPUR',
      },
    })

    return NextResponse.json({ data: customer }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pelanggan' },
      { status: 500 }
    )
  }
}
