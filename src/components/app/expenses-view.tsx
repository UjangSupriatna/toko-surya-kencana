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
import { Plus, Search, Pencil, Trash2, TrendingDown, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { formatRupiah, formatDate } from '@/lib/format'

interface Expense {
  id: string; category: string; description: string; amount: number; date: string; createdAt: string
}

const CATEGORIES = ['Operasional', 'Transportasi', 'Gaji', 'Sewa', 'Listrik & Air', 'Perlengkapan', 'Beli Stok', 'Lainnya']

export default function ExpensesView() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState({ category: 'Operasional', description: '', amount: 0, date: new Date().toISOString().split('T')[0] })

  const fetchExpenses = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categoryFilter !== 'ALL') params.set('category', categoryFilter)
    fetch(`/api/expenses?${params}`)
      .then(r => r.json())
      .then(r => {
        let data = r.data || []
        if (search) {
          data = data.filter((e: Expense) => e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
        }
        setExpenses(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search, categoryFilter])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const today = new Date()
  const thisMonth = expenses.filter(e => { const d = new Date(e.date); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() })
  const totalThisMonth = thisMonth.reduce((a, e) => a + e.amount, 0)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const thisWeek = expenses.filter(e => new Date(e.date) >= weekStart)
  const totalThisWeek = thisWeek.reduce((a, e) => a + e.amount, 0)

  const handleSubmit = async () => {
    if (!form.description || !form.amount) { toast.error('Deskripsi dan jumlah wajib diisi'); return }
    try {
      if (editing) {
        await fetch(`/api/expenses/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        toast.success('Pengeluaran berhasil diperbarui')
      } else {
        await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        toast.success('Pengeluaran berhasil ditambahkan')
      }
      setDialogOpen(false); setEditing(null)
      setForm({ category: 'Operasional', description: '', amount: 0, date: new Date().toISOString().split('T')[0] })
      fetchExpenses()
    } catch { toast.error('Gagal menyimpan pengeluaran') }
  }

  const handleEdit = (e: Expense) => {
    setEditing(e)
    setForm({ category: e.category, description: e.description, amount: e.amount, date: e.date.split('T')[0] })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      toast.success('Pengeluaran berhasil dihapus')
      fetchExpenses(); setDeleteDialog(null)
    } catch { toast.error('Gagal menghapus') }
  }

  const totalAll = expenses.reduce((a, e) => a + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pengeluaran Bulan Ini</p>
            <p className="text-2xl font-bold text-red-600">{formatRupiah(totalThisMonth)}</p>
            <p className="text-xs text-muted-foreground">{thisMonth.length} transaksi</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pengeluaran Minggu Ini</p>
            <p className="text-2xl font-bold text-orange-600">{formatRupiah(totalThisWeek)}</p>
            <p className="text-xs text-muted-foreground">{thisWeek.length} transaksi</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Seluruhnya</p>
            <p className="text-2xl font-bold">{formatRupiah(totalAll)}</p>
            <p className="text-xs text-muted-foreground">{expenses.length} transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari pengeluaran..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ category: 'Operasional', description: '', amount: 0, date: new Date().toISOString().split('T')[0] }); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Tambah Pengeluaran
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>)}</TableRow>
                )) : expenses.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada pengeluaran</TableCell></TableRow>
                ) : expenses.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">{formatDate(e.date)}</TableCell>
                    <TableCell><Badge variant="secondary">{e.category}</Badge></TableCell>
                    <TableCell className="text-sm">{e.description}</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">{formatRupiah(e.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteDialog(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Deskripsi *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Keterangan pengeluaran" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Jumlah (Rp) *</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Tanggal</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
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
          <DialogHeader><DialogTitle>Hapus Pengeluaran?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Pengeluaran yang sudah dihapus tidak dapat dikembalikan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Batal</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteDialog && handleDelete(deleteDialog)}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
