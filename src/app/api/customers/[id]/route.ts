import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('Error getting customer:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pelanggan' },
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
    const existing = await db.customer.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, phone, address, type } = body

    if (name !== undefined && !name) {
      return NextResponse.json(
        { error: 'Nama pelanggan tidak boleh kosong' },
        { status: 400 }
      )
    }

    if (phone !== undefined && !phone) {
      return NextResponse.json(
        { error: 'Nomor telepon tidak boleh kosong' },
        { status: 400 }
      )
    }

    if (type !== undefined) {
      const validTypes = ['DAPUR', 'ECERAN', 'GROSIR']
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: 'Tipe pelanggan harus DAPUR, ECERAN, atau GROSIR' },
          { status: 400 }
        )
      }
    }

    const customer = await db.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address: address || null }),
        ...(type !== undefined && { type }),
      },
    })

    return NextResponse.json({ data: customer })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pelanggan' },
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
    const existing = await db.customer.findUnique({
      where: { id },
      include: { orders: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 404 }
      )
    }

    if (existing.orders.length > 0) {
      return NextResponse.json(
        { error: 'Pelanggan tidak dapat dihapus karena memiliki pesanan' },
        { status: 400 }
      )
    }

    await db.customer.delete({ where: { id } })

    return NextResponse.json({ message: 'Pelanggan berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pelanggan' },
      { status: 500 }
    )
  }
}
