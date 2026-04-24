import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await readData()
    const idx = data.expenses.findIndex(e => e.id === id)

    if (idx === -1) {
      return NextResponse.json(
        { error: 'Pengeluaran tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { category, description, amount, date } = body

    if (category !== undefined && !category) {
      return NextResponse.json(
        { error: 'Kategori tidak boleh kosong' },
        { status: 400 }
      )
    }

    if (description !== undefined && !description) {
      return NextResponse.json(
        { error: 'Deskripsi tidak boleh kosong' },
        { status: 400 }
      )
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Jumlah harus berupa angka positif' },
        { status: 400 }
      )
    }

    const expense = data.expenses[idx]
    if (category !== undefined) expense.category = category
    if (description !== undefined) expense.description = description
    if (amount !== undefined) expense.amount = Math.round(amount)
    if (date !== undefined) expense.date = new Date(date).toISOString()

    data.expenses[idx] = expense
    await writeData(data)

    return NextResponse.json({ data: expense })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pengeluaran' },
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
    const idx = data.expenses.findIndex(e => e.id === id)

    if (idx === -1) {
      return NextResponse.json(
        { error: 'Pengeluaran tidak ditemukan' },
        { status: 404 }
      )
    }

    data.expenses.splice(idx, 1)
    await writeData(data)

    return NextResponse.json({ message: 'Pengeluaran berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pengeluaran' },
      { status: 500 }
    )
  }
}
