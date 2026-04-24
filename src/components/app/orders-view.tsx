'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Eye, Trash2, ShoppingCart, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatRupiah, formatDate, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/format'

interface OrderItem {
  id: string; productId: string; quantity: number; price: number; subtotal: number;
  product?: { id: string; name: string; unit: string }
}
interface Order {
  id: string; orderNumber: string; customerId: string; status: string; notes: string | null;
  totalAmount: number; createdAt: string; updatedAt: string;
  customer?: { id: string; name: string; phone: string; address: string | null; type: string }
  items?: OrderItem[]; invoice?: any; payments?: any[]
}
interface Customer { id: string; name: string; phone: string }
interface Product { id: string; name: string; unit: string; sellPrice: number; stock: number }

const ORDER_STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState<Order | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; price: number; subtotal: number }[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [newItemProduct, setNewItemProduct] = useState('')
  const [newItemQty, setNewItemQty] = useState(1)

  const fetchOrders = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (search) params.set('q', search)
    fetch(`/api/orders?${params}`)
      .then(r => r.json())
      .then(r => { setOrders(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [statusFilter, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    fetch('/api/customers?limit=100').then(r => r.json()).then(r => setCustomers(r.data || [])).catch(() => {})
    fetch('/api/products?limit=200').then(r => r.json()).then(r => setProducts(r.data || [])).catch(() => {})
  }, [])

  const addItem = () => {
    const product = products.find(p => p.id === newItemProduct)
    if (!product || newItemQty < 1) return
    setOrderItems([...orderItems, { productId: product.id, quantity: newItemQty, price: product.sellPrice, subtotal: product.sellPrice * newItemQty }])
    setNewItemProduct(''); setNewItemQty(1)
  }

  const removeItem = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx))
  }

  const grandTotal = orderItems.reduce((a, i) => a + i.subtotal, 0)

  const handleSubmit = async () => {
    if (!selectedCustomer || orderItems.length === 0) { toast.error('Pilih pelanggan dan tambahkan minimal 1 item'); return }
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomer, notes: orderNotes || undefined, items: orderItems })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Pesanan berhasil dibuat!')
      setDialogOpen(false)
      setSelectedCustomer(''); setOrderNotes(''); setOrderItems([])
      fetchOrders()
    } catch (e: any) { toast.error(e.message || 'Gagal membuat pesanan') }
  }

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      toast.success(`Status diperbarui ke ${getStatusLabel(status)}`)
      fetchOrders()
      if (detailOpen) {
        const res = await fetch(`/api/orders/${orderId}`)
        const data = await res.json()
        setDetailOpen(data.data)
      }
    } catch { toast.error('Gagal memperbarui status') }
  }

  const deleteOrder = async (id: string) => {
    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      toast.success('Pesanan berhasil dihapus')
      fetchOrders(); setDetailOpen(null)
    } catch { toast.error('Gagal menghapus pesanan') }
  }

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="flex-wrap h-auto gap-1 bg-muted p-1">
          {ORDER_STATUSES.map(s => (
            <TabsTrigger key={s} value={s} className="text-xs px-3 py-1.5">
              {s === 'ALL' ? 'Semua' : getStatusLabel(s)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nomor pesanan..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Pesanan Baru</Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-center">Item</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>)}</TableRow>
                )) : orders.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada pesanan</TableCell></TableRow>
                ) : orders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.orderNumber}</TableCell>
                    <TableCell>
                      <div><p className="font-medium text-sm">{o.customer?.name || 'N/A'}</p><p className="text-xs text-muted-foreground">{o.customer?.phone}</p></div>
                    </TableCell>
                    <TableCell className="text-center">{o.items?.length || 0}</TableCell>
                    <TableCell className="text-right font-semibold">{formatRupiah(o.totalAmount)}</TableCell>
                    <TableCell>
                      <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                        <SelectTrigger className={`w-28 h-7 text-xs border ${getStatusColor(o.status)} font-medium`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.filter(s => s !== 'ALL').map(s => <SelectItem key={s} value={s} className="text-xs">{getStatusLabel(s)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { fetch(`/api/orders/${o.id}`).then(r => r.json()).then(r => setDetailOpen(r.data)) }}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteOrder(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Order Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Pesanan Baru</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Pelanggan *</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger><SelectValue placeholder="Pilih pelanggan" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tambah Item</Label>
              <div className="flex gap-2">
                <Select value={newItemProduct} onValueChange={setNewItemProduct}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.stock > 0).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (Stok: {p.stock}) - {formatRupiah(p.sellPrice)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={newItemQty} onChange={e => setNewItemQty(Number(e.target.value))} className="w-20" placeholder="Qty" />
                <Button onClick={addItem} disabled={!newItemProduct}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader><TableRow><TableHead>Produk</TableHead><TableHead className="text-center">Qty</TableHead><TableHead className="text-right">Harga</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {orderItems.map((item, i) => {
                      const p = products.find(pr => pr.id === item.productId)
                      return (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{p?.name || 'Produk'}</TableCell>
                          <TableCell className="text-center">{item.quantity} {p?.unit}</TableCell>
                          <TableCell className="text-right text-sm">{formatRupiah(item.price)}</TableCell>
                          <TableCell className="text-right font-medium">{formatRupiah(item.subtotal)}</TableCell>
                          <TableCell><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(i)}><X className="h-3 w-3" /></Button></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end">
              <p className="text-lg font-bold">Total: {formatRupiah(grandTotal)}</p>
            </div>

            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Pesan via telepon, kirim sore, dll." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={!selectedCustomer || orderItems.length === 0}>Buat Pesanan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOpen} onOpenChange={() => setDetailOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detail Pesanan {detailOpen?.orderNumber}</DialogTitle>
          </DialogHeader>
          {detailOpen && (
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Pelanggan</p>
                    <p className="font-semibold">{detailOpen.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{detailOpen.customer?.phone}</p>
                    {detailOpen.customer?.address && <p className="text-sm text-muted-foreground">{detailOpen.customer.address}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className={getStatusColor(detailOpen.status)}>{getStatusLabel(detailOpen.status)}</Badge>
                    <p className="text-xs text-muted-foreground mt-2">{formatDateTime(detailOpen.createdAt)}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-2">Item Pesanan</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>Produk</TableHead><TableHead className="text-center">Qty</TableHead><TableHead className="text-right">Harga</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {detailOpen.items?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || 'Produk'}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatRupiah(item.price)}</TableCell>
                          <TableCell className="text-right font-medium">{formatRupiah(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end mt-2">
                    <p className="text-lg font-bold">Total: {formatRupiah(detailOpen.totalAmount)}</p>
                  </div>
                </div>

                {detailOpen.notes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-600 font-medium">Catatan</p>
                    <p className="text-sm">{detailOpen.notes}</p>
                  </div>
                )}

                {detailOpen.payments && detailOpen.payments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Pembayaran</h4>
                    {detailOpen.payments.map((pay: any) => (
                      <div key={pay.id} className="flex justify-between p-2 bg-emerald-50 rounded mb-1 text-sm">
                        <span>{pay.method} · {formatDate(pay.date)}</span>
                        <span className="font-semibold">{formatRupiah(pay.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {detailOpen.invoice && (
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-1">Invoice {detailOpen.invoice.invoiceNumber}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>PPN (11%): {formatRupiah(detailOpen.invoice.ppnAmount)}</p>
                      <p>Total Termasuk PPN: {formatRupiah(detailOpen.invoice.totalAmount)}</p>
                      <p>Jatuh Tempo: {formatDate(detailOpen.invoice.dueDate)}</p>
                      <Badge variant="outline" className={getStatusColor(detailOpen.invoice.status)}>{getStatusLabel(detailOpen.invoice.status)}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
