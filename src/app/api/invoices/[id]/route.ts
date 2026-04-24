import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
            payments: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error getting invoice:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data invoice' },
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
    const existing = await db.invoice.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { error: 'Invoice tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status, dueDate } = body

    if (status) {
      const validStatuses = ['UNPAID', 'PAID', 'OVERDUE']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Status harus UNPAID, PAID, atau OVERDUE' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (status) {
      updateData.status = status
      if (status === 'PAID') {
        updateData.paidAt = new Date()
      }
    }
    if (dueDate) {
      updateData.dueDate = new Date(dueDate)
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    })

    return NextResponse.json({ data: invoice })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate invoice' },
      { status: 500 }
    )
  }
}
