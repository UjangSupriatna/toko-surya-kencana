import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.expense.findUnique({ where: { id } })

    if (!existing) {
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

    const expense = await db.expense.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: Math.round(amount) }),
        ...(date !== undefined && { date: new Date(date) }),
      },
    })

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
    const existing = await db.expense.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { error: 'Pengeluaran tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.expense.delete({ where: { id } })

    return NextResponse.json({ message: 'Pengeluaran berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pengeluaran' },
      { status: 500 }
    )
  }
}
