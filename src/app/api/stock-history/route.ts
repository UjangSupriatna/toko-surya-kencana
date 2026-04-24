import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    const where: Record<string, unknown> = {}

    if (productId) {
      where.productId = productId
    }

    if (from || to) {
      where.createdAt = {}
      if (from) {
        (where.createdAt as Record<string, unknown>).gte = new Date(from)
      }
      if (to) {
        const endDate = new Date(to)
        endDate.setHours(23, 59, 59, 999)
        ;(where.createdAt as Record<string, unknown>).lte = endDate
      }
    }

    const stockHistory = await db.stockHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            unit: true,
          },
        },
      },
    })

    return NextResponse.json({ data: stockHistory })
  } catch (error) {
    console.error('Error listing stock history:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat stok' },
      { status: 500 }
    )
  }
}
