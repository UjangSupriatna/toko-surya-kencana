'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatRupiah } from '@/lib/format'

interface Product {
  id: string
  name: string
  category: string
  unit: string
  buyPrice: number
  sellPrice: number
  stock: number
  minStock: number
}

const CATEGORIES = [
  'Beras', 'Minyak Goreng', 'Gula', 'Tepung', 'Telur', 'Mie Instan',
  'Kecap & Saus', 'Bumbu & Rempah', 'Susu', 'Kebutuhan RT',
  'Makanan Kaleng', 'Air Mineral', 'Kopi & Minuman'
]

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', category: '', unit: '', buyPrice: 0, sellPrice: 0, stock: 0, minStock: 10 })

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (categoryFilter !== 'ALL') params.set('category', categoryFilter)
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(r => { setProducts(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, categoryFilter])

  const refetchProducts = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (categoryFilter !== 'ALL') params.set('category', categoryFilter)
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(r => { setProducts(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.unit) {
      toast.error('Lengkapi semua field yang wajib diisi')
      return
    }
    try {
      if (editing) {
        await fetch(`/api/products/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        toast.success('Produk berhasil diperbarui')
      } else {
        await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        toast.success('Produk berhasil ditambahkan')
      }
      setDialogOpen(false)
      setEditing(null)
      setForm({ name: '', category: '', unit: '', buyPrice: 0, sellPrice: 0, stock: 0, minStock: 10 })
      refetchProducts()
    } catch {
      toast.error('Gagal menyimpan produk')
    }
  }

  const handleEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, category: p.category, unit: p.unit, buyPrice: p.buyPrice, sellPrice: p.sellPrice, stock: p.stock, minStock: p.minStock })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      toast.success('Produk berhasil dihapus')
      refetchProducts()
      setDeleteDialog(null)
    } catch {
      toast.error('Gagal menghapus produk')
    }
  }

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length
  const totalInventoryValue = products.reduce((a, p) => a + p.sellPrice * p.stock, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Produk</p>
              <p className="text-xl font-bold">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stok Rendah</p>
              <p className="text-xl font-bold text-amber-600">{lowStockCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nilai Inventaris</p>
              <p className="text-xl font-bold">{formatRupiah(totalInventoryValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', category: '', unit: '', buyPrice: 0, sellPrice: 0, stock: 0, minStock: 10 }); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Tambah Produk
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Harga Beli</TableHead>
                  <TableHead className="text-right">Harga Jual</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>)}
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Tidak ada produk ditemukan</TableCell></TableRow>
                ) : (
                  products.map(p => {
                    const margin = p.sellPrice > 0 ? Math.round((p.sellPrice - p.buyPrice) / p.sellPrice * 100) : 0
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{p.name}</TableCell>
                        <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                        <TableCell>{p.unit}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatRupiah(p.buyPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatRupiah(p.sellPrice)}</TableCell>
                        <TableCell className="text-right">
                          <span className={p.stock <= p.minStock ? 'text-red-600 font-bold' : ''}>{p.stock}</span>
                          {p.stock <= p.minStock && <AlertTriangle className="inline h-3 w-3 ml-1 text-red-500" />}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600">{margin}%</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteDialog(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Produk *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Beras Premium 5kg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Satuan *</Label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="kg, dus, botol" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Harga Beli (Rp)</Label>
                <Input type="number" value={form.buyPrice} onChange={e => setForm({ ...form, buyPrice: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Harga Jual (Rp)</Label>
                <Input type="number" value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Stok</Label>
                <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Min. Stok</Label>
                <Input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{editing ? 'Simpan Perubahan' : 'Tambah Produk'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>Produk yang sudah terdaftar di pesanan tidak dapat dihapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteDialog && handleDelete(deleteDialog)}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
