import { NextRequest, NextResponse } from 'next/server'
import { readData } from '@/lib/json-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''

    const data = await readData()
    let history = [...data.stockHistory]

    if (productId) {
      history = history.filter(h => h.productId === productId)
    }

    if (from) {
      const fromDate = new Date(from)
      history = history.filter(h => new Date(h.createdAt) >= fromDate)
    }
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      history = history.filter(h => new Date(h.createdAt) <= toDate)
    }

    // Sort by createdAt desc
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Enrich with product name
    const enrichedHistory = history.map(h => {
      const product = data.products.find(p => p.id === h.productId)
      return {
        ...h,
        product: product ? {
          id: product.id,
          name: product.name,
          category: product.category,
          unit: product.unit,
        } : null,
      }
    })

    return NextResponse.json({ data: enrichedHistory })
  } catch (error) {
    console.error('Error listing stock history:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat stok' },
      { status: 500 }
    )
  }
}
