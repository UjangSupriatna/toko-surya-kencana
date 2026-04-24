import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    if (from || to) {
      where.date = {}
      if (from) {
        (where.date as Record<string, unknown>).gte = new Date(from)
      }
      if (to) {
        const endDate = new Date(to)
        endDate.setHours(23, 59, 59, 999)
        ;(where.date as Record<string, unknown>).lte = endDate
      }
    }

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ data: expenses })
  } catch (error) {
    console.error('Error listing expenses:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pengeluaran' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, description, amount, date } = body

    if (!category || !description || !amount || !date) {
      return NextResponse.json(
        { error: 'Kategori, deskripsi, jumlah, dan tanggal wajib diisi' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Jumlah harus berupa angka positif' },
        { status: 400 }
      )
    }

    const expense = await db.expense.create({
      data: {
        category,
        description,
        amount: Math.round(amount),
        date: new Date(date),
      },
    })

    return NextResponse.json({ data: expense }, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pengeluaran' },
      { status: 500 }
    )
  }
}
