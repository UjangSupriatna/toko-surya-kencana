import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readData()
    const customer = data.customers.find(c => c.id === id)

    if (!customer) {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 404 }
      )
    }

    const customerOrders = data.orders
      .filter(o => o.customerId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    return NextResponse.json({
      data: {
        ...customer,
        _count: {
          orders: data.orders.filter(o => o.customerId === id).length,
        },
        orders: customerOrders,
      },
    })
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
    const data = await readData()
    const idx = data.customers.findIndex(c => c.id === id)

    if (idx === -1) {
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

    const customer = data.customers[idx]
    if (name !== undefined) customer.name = name
    if (phone !== undefined) customer.phone = phone
    if (address !== undefined) customer.address = address || null
    if (type !== undefined) customer.type = type

    data.customers[idx] = customer
    await writeData(data)

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
    const data = await readData()
    const idx = data.customers.findIndex(c => c.id === id)

    if (idx === -1) {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 404 }
      )
    }

    const hasOrders = data.orders.some(o => o.customerId === id)

    if (hasOrders) {
      return NextResponse.json(
        { error: 'Pelanggan tidak dapat dihapus karena memiliki pesanan' },
        { status: 400 }
      )
    }

    data.customers.splice(idx, 1)
    await writeData(data)

    return NextResponse.json({ message: 'Pelanggan berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pelanggan' },
      { status: 500 }
    )
  }
}
