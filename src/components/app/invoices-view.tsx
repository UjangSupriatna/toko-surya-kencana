'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Receipt, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { formatRupiah, formatDate, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/format'

interface Invoice {
  id: string; invoiceNumber: string; orderId: string; status: string
  ppnRate: number; ppnAmount: number; totalAmount: number
  dueDate: string; paidAt: string | null; createdAt: string
  order?: {
    id: string; orderNumber: string; totalAmount: number; notes: string | null; createdAt: string
    customer?: { name: string; phone: string; address: string | null; type: string }
    items?: { id: string; quantity: number; price: number; subtotal: number; product?: { name: string; unit: string } }[]
  }
}

export default function InvoicesView() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState<Invoice | null>(null)

  const fetchInvoices = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    fetch(`/api/invoices?${params}`)
      .then(r => r.json())
      .then(r => { setInvoices(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const markAsPaid = async (id: string) => {
    try {
      await fetch(`/api/invoices/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PAID' }) })
      toast.success('Invoice ditandai lunas')
      fetchInvoices()
      if (selected?.id === id) {
        const res = await fetch(`/api/invoices/${id}`)
        const data = await res.json()
        setSelected(data.data)
      }
    } catch { toast.error('Gagal memperbarui invoice') }
  }

  const printInvoice = () => {
    if (!selected) return
    const w = window.open('', '_blank')
    if (!w) return
    const order = selected.order
    const items = order?.items || []
    w.document.write(`
      <html><head><title>Invoice ${selected.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 3px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { color: #059669; margin: 0 0 4px 0; font-size: 24px; }
        .header p { margin: 2px 0; color: #666; font-size: 13px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .info-box { background: #f9fafb; padding: 12px; border-radius: 8px; }
        .info-box h3 { margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; }
        .info-box p { margin: 2px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f3f4f6; text-align: left; padding: 10px; font-size: 12px; color: #666; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        .total-section { margin-top: 24px; text-align: right; }
        .total-section .row { display: flex; justify-content: flex-end; gap: 32px; padding: 6px 0; font-size: 14px; }
        .total-section .grand { border-top: 2px solid #333; font-size: 18px; font-weight: bold; padding-top: 10px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-unpaid { background: #fef3c7; color: #92400e; }
        @media print { body { margin: 20px; } }
      </style></head><body>
      <div class="header">
        <h1>FAKTUR</h1>
        <p style="font-size:18px;font-weight:bold;margin-top:4px;">${selected.invoiceNumber}</p>
        <p>Toko Surya Kencana · Kab. Pati, Jawa Tengah</p>
        <p>Tanggal: ${formatDate(selected.createdAt)}</p>
      </div>
      <div class="info-grid">
        <div class="info-box">
          <h3>Ditagihkan Kepada</h3>
          <p><strong>${order?.customer?.name || '-'}</strong></p>
          <p>${order?.customer?.phone || ''}</p>
          <p>${order?.customer?.address || ''}</p>
        </div>
        <div class="info-box">
          <h3>Detail Invoice</h3>
          <p>Pesanan: ${order?.orderNumber || '-'}</p>
          <p>Jatuh Tempo: ${formatDate(selected.dueDate)}</p>
          <p>Status: <span class="status ${selected.status === 'PAID' ? 'status-paid' : 'status-unpaid'}">${getStatusLabel(selected.status)}</span></p>
          ${selected.paidAt ? `<p>Dibayar: ${formatDate(selected.paidAt)}</p>` : ''}
        </div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Produk</th><th style="text-align:center">Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Subtotal</th></tr></thead>
        <tbody>
          ${items.map((item, i) => `<tr><td>${i + 1}</td><td>${item.product?.name || '-'}</td><td style="text-align:center">${item.quantity} ${item.product?.unit || ''}</td><td style="text-align:right">${formatRupiah(item.price)}</td><td style="text-align:right">${formatRupiah(item.subtotal)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="total-section">
        <div class="row"><span>Subtotal</span><span>${formatRupiah(order?.totalAmount || 0)}</span></div>
        <div class="row"><span>PPN (${selected.ppnRate}%)</span><span>${formatRupiah(selected.ppnAmount)}</span></div>
        <div class="row grand"><span>Total</span><span>${formatRupiah(selected.totalAmount)}</span></div>
      </div>
      <div style="margin-top:40px;font-size:12px;color:#999;text-align:center;">
        Faktur ini dibuat secara otomatis oleh sistem Toko Surya Kencana
      </div>
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <div className="space-y-6">
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="ALL">Semua</TabsTrigger>
          <TabsTrigger value="UNPAID">Belum Bayar</TabsTrigger>
          <TabsTrigger value="PAID">Lunas</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Invoice</TableHead>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">PPN 11%</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 9 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>)}</TableRow>
                )) : invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Tidak ada invoice</TableCell></TableRow>
                ) : invoices.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{inv.order?.orderNumber}</TableCell>
                    <TableCell className="text-sm">{inv.order?.customer?.name}</TableCell>
                    <TableCell className="text-right">{formatRupiah(inv.order?.totalAmount || 0)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatRupiah(inv.ppnAmount)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatRupiah(inv.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(inv.status)}`}>{getStatusLabel(inv.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(inv)}><Eye className="h-3.5 w-3.5" /></Button>
                        {inv.status === 'UNPAID' && (
                          <Button variant="outline" size="sm" className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100" onClick={() => markAsPaid(inv.id)}>Lunasi</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> {selected?.invoiceNumber}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={printInvoice}><Printer className="h-4 w-4 mr-1" />Cetak</Button>
              {selected?.status === 'UNPAID' && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => selected && markAsPaid(selected.id)}>Tandai Lunas</Button>
              )}
            </div>
          </DialogHeader>
          {selected && (
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-emerald-700">FAKTUR</h2>
                  <p className="text-lg font-semibold mt-1">{selected.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">Toko Surya Kencana · Kab. Pati, Jawa Tengah</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground font-medium mb-1">DITAGIHKAN KEPADA</p>
                    <p className="font-semibold">{selected.order?.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{selected.order?.customer?.phone}</p>
                    <p className="text-sm text-muted-foreground">{selected.order?.customer?.address}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-right">
                    <p className="text-xs text-muted-foreground font-medium mb-1">DETAIL</p>
                    <p className="text-sm">Pesanan: {selected.order?.orderNumber}</p>
                    <p className="text-sm">Tanggal: {formatDate(selected.createdAt)}</p>
                    <p className="text-sm">Jatuh Tempo: {formatDate(selected.dueDate)}</p>
                    <Badge variant="outline" className={getStatusColor(selected.status)}>{getStatusLabel(selected.status)}</Badge>
                    {selected.paidAt && <p className="text-sm text-emerald-600 mt-1">Dibayar: {formatDate(selected.paidAt)}</p>}
                  </div>
                </div>

                {/* Items Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead><TableHead>Produk</TableHead><TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Harga</TableHead><TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.order?.items?.map((item, i) => (
                      <TableRow key={item.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell className="text-center">{item.quantity} {item.product?.unit}</TableCell>
                        <TableCell className="text-right">{formatRupiah(item.price)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRupiah(selected.order?.totalAmount || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">PPN ({selected.ppnRate}%)</span><span>{formatRupiah(selected.ppnAmount)}</span></div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2"><span>TOTAL</span><span className="text-emerald-700">{formatRupiah(selected.totalAmount)}</span></div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
