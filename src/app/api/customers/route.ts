import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'
import type { Customer } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || ''

    const data = await readData()
    let customers = [...data.customers]

    if (q) {
      const lower = q.toLowerCase()
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.phone.toLowerCase().includes(lower) ||
        (c.address && c.address.toLowerCase().includes(lower))
      )
    }
    if (type) {
      customers = customers.filter(c => c.type === type)
    }

    // Sort by createdAt desc
    customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Include order count
    const customersWithCount = customers.map(c => ({
      ...c,
      _count: {
        orders: data.orders.filter(o => o.customerId === c.id).length,
      },
    }))

    return NextResponse.json({ data: customersWithCount })
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

    const data = await readData()
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      address: address || null,
      type: type || 'DAPUR',
      createdAt: new Date().toISOString(),
    }

    data.customers.push(newCustomer)
    await writeData(data)

    return NextResponse.json({ data: newCustomer }, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pelanggan' },
      { status: 500 }
    )
  }
}
