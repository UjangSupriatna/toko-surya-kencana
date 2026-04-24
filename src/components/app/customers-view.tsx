'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Search, Eye, Pencil, Trash2, ShoppingCart, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { formatRupiah, formatDate, formatDateTime, getStatusColor, getStatusLabel, getCustomerTypeColor, getCustomerTypeLabel } from '@/lib/format'

interface Customer {
  id: string; name: string; phone: string; address: string | null; type: string;
  _count?: { orders: number }; _sum?: { totalAmount: number }
}

export default function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '', type: 'DAPUR' })

  const fetchCustomers = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (typeFilter !== 'ALL') params.set('type', typeFilter)
    fetch(`/api/customers?${params}`)
      .then(r => r.json())
      .then(r => { setCustomers(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, typeFilter])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { toast.error('Nama dan nomor telepon wajib diisi'); return }
    try {
      if (editing) {
        await fetch(`/api/customers/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        toast.success('Pelanggan berhasil diperbarui')
      } else {
        await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        toast.success('Pelanggan berhasil ditambahkan')
      }
      setDialogOpen(false); setEditing(null)
      setForm({ name: '', phone: '', address: '', type: 'DAPUR' })
      fetchCustomers()
    } catch { toast.error('Gagal menyimpan pelanggan') }
  }

  const handleEdit = (c: Customer) => {
    setEditing(c)
    setForm({ name: c.name, phone: c.phone, address: c.address || '', type: c.type })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      toast.success('Pelanggan berhasil dihapus')
      fetchCustomers(); setDeleteDialog(null)
    } catch { toast.error('Gagal menghapus pelanggan. Mungkin masih memiliki pesanan.') }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari pelanggan..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Semua Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tipe</SelectItem>
              <SelectItem value="DAPUR">Dapur SPPG</SelectItem>
              <SelectItem value="ECERAN">Eceran</SelectItem>
              <SelectItem value="GROSIR">Grosir</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', phone: '', address: '', type: 'DAPUR' }); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Tambah Pelanggan
        </Button>
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : customers.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground">Tidak ada pelanggan ditemukan</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <Badge variant="outline" className={`mt-1 text-xs ${getCustomerTypeColor(c.type)}`}>
                      {getCustomerTypeLabel(c.type)}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteDialog(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{c.phone}</span></div>
                  {c.address && <div className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 mt-0.5" /><span className="line-clamp-2">{c.address}</span></div>}
                </div>
                {c._count && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs text-muted-foreground">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>{c._count.orders} pesanan</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nama *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama toko atau pemesan" /></div>
            <div className="space-y-2"><Label>Telepon *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" /></div>
            <div className="space-y-2"><Label>Alamat</Label><Textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" /></div>
            <div className="space-y-2">
              <Label>Tipe Pelanggan</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAPUR">Dapur SPPG</SelectItem>
                  <SelectItem value="ECERAN">Eceran</SelectItem>
                  <SelectItem value="GROSIR">Grosir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{editing ? 'Simpan' : 'Tambah'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Hapus Pelanggan?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Pelanggan yang masih memiliki pesanan tidak dapat dihapus.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Batal</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteDialog && handleDelete(deleteDialog)}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
