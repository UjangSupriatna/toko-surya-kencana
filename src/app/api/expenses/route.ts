import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/json-db'
import type { Expense } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    const data = await readData()
    let expenses = [...data.expenses]

    if (category) {
      expenses = expenses.filter(e => e.category === category)
    }

    if (from) {
      const fromDate = new Date(from)
      expenses = expenses.filter(e => new Date(e.date) >= fromDate)
    }
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      expenses = expenses.filter(e => new Date(e.date) <= toDate)
    }

    // Sort by date desc
    expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

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

    const data = await readData()
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      category,
      description,
      amount: Math.round(amount),
      date: new Date(date).toISOString(),
    }

    data.expenses.push(newExpense)
    await writeData(data)

    return NextResponse.json({ data: newExpense }, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pengeluaran' },
      { status: 500 }
    )
  }
}
