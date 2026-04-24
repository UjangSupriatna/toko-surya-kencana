'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Store, Package, ShoppingCart, Receipt, Users, Wallet,
  BarChart3, Phone, MapPin, Clock, ChevronRight, CheckCircle2,
  ArrowRight, Truck, FileText, Calculator, Shield, Zap,
  Star, Menu, X, Send
} from 'lucide-react'

export default function Home() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [demoDialog, setDemoDialog] = useState(false)

  const scrollTo = (id: string) => {
    setMobileMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    {
      icon: Package,
      title: 'Manajemen Inventaris',
      desc: 'Lacak stok barang secara real-time dengan alert stok rendah otomatis. Kelola ratusan item sembako dengan mudah.',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: ShoppingCart,
      title: 'Pesanan via Telepon',
      desc: 'Catat pesanan yang masuk via telepon dengan cepat. Tracking status dari pesan hingga selesai dikirim.',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: Receipt,
      title: 'Faktur & Pajak',
      desc: 'Generate faktur otomatis dengan PPN 11%. Cetak langsung atau kirim digital ke pelanggan.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: BarChart3,
      title: 'Laporan Keuangan',
      desc: 'Laba rugi, tren penjualan, pengeluaran per kategori — semua data keuangan dalam satu dashboard.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Users,
      title: 'Manajemen Pelanggan',
      desc: 'Kelola database pelanggan dengan kategori: Dapur SPPG, Eceran, dan Grosir.',
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      icon: Truck,
      title: 'Supply Chain',
      desc: 'Kelola alur distribusi dari penerimaan pesanan hingga pengiriman barang ke pelanggan.',
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  const flowSteps = [
    { step: 1, icon: Phone, title: 'Pesanan Masuk', desc: 'Pelanggan memesan via telepon', color: 'bg-amber-100 text-amber-600 border-amber-200' },
    { step: 2, icon: ShoppingCart, title: 'Proses Pesanan', desc: 'Catat item & konfirmasi ke pelanggan', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { step: 3, icon: Package, title: 'Siapkan Barang', desc: 'Kurangi stok & packing pesanan', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    { step: 4, icon: Truck, title: 'Kirim Barang', desc: 'Pengiriman ke lokasi pelanggan', color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
    { step: 5, icon: Receipt, title: 'Buat Faktur', desc: 'Generate faktur & tagihan otomatis', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    { step: 6, icon: Wallet, title: 'Terima Pembayaran', desc: 'Catat pembayaran & update status', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  ]

  const stats = [
    { value: '41+', label: 'Produk Terdaftar' },
    { value: '8', label: 'Pelanggan Aktif' },
    { value: '100+', label: 'Pesanan/Bulan' },
    { value: '99%', label: 'Akurasi Stok' },
  ]

  const pricing = [
    { name: 'Starter', price: '2.500.000', period: '/tahun', desc: 'Cocok untuk toko kecil', features: ['Dashboard Utama', 'Manajemen Produk (max 100)', 'Pesanan & Faktur', '1 Pengguna', 'Support via WhatsApp'] },
    { name: 'Professional', price: '3.500.000', period: '/tahun', desc: 'Untuk supplier seperti Toko Surya Kencana', popular: true, features: ['Semua fitur Starter', 'Produk Unlimited', 'Laporan Keuangan Lengkap', 'Supply Chain Management', 'Multi Pengguna', 'Custom Domain', 'Gratis Maintenance'] },
    { name: 'Enterprise', price: 'Hubungi Kami', period: '', desc: 'Untuk bisnis besar & franchise', features: ['Semua fitur Professional', 'Multi Lokasi/Gudang', 'API Integration', 'Priority Support', 'Training Tim', 'Custom Development'] },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm leading-tight">Toko Surya Kencana</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">Sistem Manajemen Supplier</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollTo('fitur')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fitur</button>
              <button onClick={() => scrollTo('alur')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Alur Bisnis</button>
              <button onClick={() => scrollTo('harga')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Harga</button>
              <button onClick={() => scrollTo('kontak')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kontak</button>
              <Button onClick={() => setDemoDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
                Minta Demo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenu && (
            <div className="md:hidden py-3 border-t space-y-2">
              <button onClick={() => scrollTo('fitur')} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted">Fitur</button>
              <button onClick={() => scrollTo('alur')} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted">Alur Bisnis</button>
              <button onClick={() => scrollTo('harga')} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted">Harga</button>
              <button onClick={() => scrollTo('kontak')} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted">Kontak</button>
              <Button onClick={() => { setDemoDialog(true); setMobileMenu(false) }} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2">
                Minta Demo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm bg-emerald-100 text-emerald-700 border-emerald-200">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Sistem Manajemen Modern untuk Supplier Sembako
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Kelola Toko Sembako
              <span className="block text-emerald-600 mt-1">Lebih Mudah & Efisien</span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Aplikasi web lengkap untuk mengelola inventaris, pesanan, faktur, dan keuangan toko sembako Anda. Dirancang khusus untuk supplier yang melayani <strong>Dapur SPPG</strong>, toko eceran, dan grosir.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-base px-8 h-12" onClick={() => setDemoDialog(true)}>
                <Send className="h-5 w-5 mr-2" />
                Minta Demo Gratis
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => scrollTo('fitur')}>
                Lihat Fitur <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tanpa instalasi</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Custom domain</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Mobile friendly</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border bg-gray-950 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-gray-800 rounded-md text-xs text-gray-400">toko-surya-kencana.app/dashboard</div>
                </div>
              </div>
              <div className="bg-gray-950 p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total Pendapatan', value: 'Rp 12.450.000', color: 'text-emerald-400' },
                    { label: 'Total Pengeluaran', value: 'Rp 4.230.000', color: 'text-red-400' },
                    { label: 'Laba Bersih', value: 'Rp 8.220.000', color: 'text-emerald-400' },
                    { label: 'Pesanan Aktif', value: '25', color: 'text-amber-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-900 rounded-xl p-3 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-gray-500">{s.label}</p>
                      <p className={`text-sm sm:text-lg font-bold ${s.color} mt-1`}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-900 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-2">Pendapatan vs Pengeluaran</p>
                    <div className="flex items-end gap-1.5 h-24">
                      {[65, 80, 55, 90, 75, 85, 70].map((h, i) => (
                        <div key={i} className="flex-1 flex gap-0.5 items-end">
                          <div className="flex-1 bg-emerald-500/80 rounded-t-sm" style={{ height: `${h}%` }} />
                          <div className="flex-1 bg-red-500/60 rounded-t-sm" style={{ height: `${h * 0.5}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-2">Pesanan Terbaru</p>
                    <div className="space-y-2">
                      {[
                        { num: 'ORD-0025', name: 'Dapur SPPG Pati', total: 'Rp 850.000', status: 'Selesai', statusColor: 'bg-emerald-500/20 text-emerald-400' },
                        { num: 'ORD-0024', name: 'Toko Maju Jaya', total: 'Rp 1.250.000', status: 'Dikirim', statusColor: 'bg-cyan-500/20 text-cyan-400' },
                        { num: 'ORD-0023', name: 'Warung Bu Siti', total: 'Rp 320.000', status: 'Menunggu', statusColor: 'bg-amber-500/20 text-amber-400' },
                      ].map((o, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-300 truncate">{o.name}</p>
                            <p className="text-[10px] text-gray-600">{o.num}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xs font-medium text-gray-300">{o.total}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${o.statusColor}`}>{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs bg-emerald-100 text-emerald-700">FITUR LENGKAP</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">Semua yang Anda Butuhkan</h3>
            <p className="mt-4 text-lg text-gray-600">Fitur-fitur yang dirancang khusus untuk kebutuhan supplier sembako di Indonesia</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-emerald-200">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{f.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Business Flow Section */}
      <section id="alur" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs bg-amber-100 text-amber-700">ALUR BISNIS</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">Bagaimana Sistemnya Bekerja?</h3>
            <p className="mt-4 text-lg text-gray-600">Alur bisnis yang sederhana dan mudah dipahami, dirancang untuk transaksi via telepon</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowSteps.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="relative">
                  <Card className={`${s.color} border hover:shadow-md transition-shadow h-full`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl font-extrabold opacity-30">0{s.step}</span>
                        <div className="h-10 w-10 rounded-lg bg-white/60 flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{s.title}</h4>
                      <p className="text-sm opacity-70">{s.desc}</p>
                    </CardContent>
                  </Card>
                  {i < flowSteps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits for Dapur SPPG */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs bg-emerald-100 text-emerald-700">KENAPA SISTEM INI?</Badge>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Dibangun Khusus untuk<br />
                <span className="text-emerald-600">Supplier Sembako Indonesia</span>
              </h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Berbeda dengan aplikasi umum, sistem ini dirancang sesuai kebutuhan nyata supplier sembako yang melayani Dapur SPPG, warung, dan toko grosir di Indonesia.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: Phone, title: 'Transaksi via Telepon', desc: 'Catat pesanan dengan cepat tanpa perlu pelanggan datang ke toko' },
                  { icon: Calculator, title: 'HPP & Laba Otomatis', desc: 'Hitung harga pokok penjualan dan margin keuntungan setiap produk' },
                  { icon: FileText, title: 'Faktur & PPN Sesuai Regulasi', desc: 'Generate faktur dengan PPN 11% sesuai standar perpajakan Indonesia' },
                  { icon: Shield, title: 'Data Aman & Privat', desc: 'Custom domain sendiri, data Anda bukan milik platform lain' },
                ].map((b, i) => {
                  const Icon = b.icon
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm">{b.title}</h5>
                        <p className="text-sm text-gray-600">{b.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Visual: Product categories */}
            <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl p-6 sm:p-8">
              <h4 className="font-semibold mb-4 text-center text-gray-700">Kategori Produk yang Dikelola</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Beras', count: '5 varian', emoji: '🌾' },
                  { name: 'Minyak Goreng', count: '3 varian', emoji: '🫗' },
                  { name: 'Gula', count: '2 varian', emoji: '🍬' },
                  { name: 'Tepung', count: '2 varian', emoji: '🏭' },
                  { name: 'Telur', count: '1 varian', emoji: '🥚' },
                  { name: 'Mie Instan', count: '3 varian', emoji: '🍜' },
                  { name: 'Kecap & Saus', count: '4 varian', emoji: '🫙' },
                  { name: 'Bumbu & Rempah', count: '9 varian', emoji: '🧄' },
                  { name: 'Susu', count: '3 varian', emoji: '🥛' },
                  { name: 'Kebutuhan RT', count: '3 varian', emoji: '🧹' },
                  { name: 'Makanan Kaleng', count: '2 varian', emoji: '🥫' },
                  { name: 'Air Mineral', count: '2 varian', emoji: '💧' },
                  { name: 'Kopi & Minuman', count: '3 varian', emoji: '☕' },
                ].map((p, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                    <span className="text-xl">{p.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.count}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">+ 41 produk siap dikelola dalam sistem</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs bg-emerald-100 text-emerald-700">HARGA</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">Pilih Paket yang Tepat</h3>
            <p className="mt-4 text-lg text-gray-600">Investasi sekali bayar, gunakan sepuasnya. Gratis maintenance!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((p, i) => (
              <Card key={i} className={`relative overflow-hidden ${p.popular ? 'border-emerald-500 border-2 shadow-lg scale-[1.02]' : 'border-gray-200'}`}>
                {p.popular && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    RECOMMENDED
                  </div>
                )}
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold">{p.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                  <div className="mt-4">
                    {p.price !== 'Hubungi Kami' ? (
                      <p className="text-3xl font-extrabold">Rp {p.price}<span className="text-sm font-normal text-muted-foreground">{p.period}</span></p>
                    ) : (
                      <p className="text-2xl font-extrabold">{p.price}</p>
                    )}
                  </div>
                  <Separator className="my-4" />
                  <ul className="space-y-3">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${p.popular ? 'text-emerald-500' : 'text-gray-400'}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${p.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    variant={p.popular ? 'default' : 'outline'}
                    onClick={() => setDemoDialog(true)}
                  >
                    {p.price === 'Hubungi Kami' ? 'Hubungi Kami' : 'Pilih Paket'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs bg-amber-100 text-amber-700">DIPERCAYA</Badge>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">Siap Transformasi Digital</h3>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-8 sm:p-10 text-center">
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
                </div>
                <blockquote className="text-lg sm:text-xl text-gray-700 leading-relaxed italic">
                  &ldquo;Dengan sistem ini, saya bisa mengelola stok, pesanan, dan keuangan toko dari HP saja. Tidak perlu catat manual di buku lagi. Semua data terpusat dan rapi.&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">FK</div>
                  <div className="text-left">
                    <p className="font-semibold">Fikri</p>
                    <p className="text-sm text-muted-foreground">Pemilik, Toko Surya Kencana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section id="kontak" className="py-16 sm:py-24 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold">Siap Memulai?</h3>
            <p className="mt-4 text-lg text-gray-400">Hubungi kami untuk konsultasi gratis dan demo aplikasi</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            {[
              { icon: Phone, label: 'Telepon / WhatsApp', value: '0812-3456-7890' },
              { icon: MapPin, label: 'Lokasi', value: 'Kab. Pati, Jawa Tengah' },
              { icon: Clock, label: 'Jam Operasional', value: 'Sen-Sab, 08:00 - 17:00' },
            ].map((c, i) => {
              const Icon = c.icon
              return (
                <Card key={i} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-5 text-center">
                    <Icon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">{c.label}</p>
                    <p className="text-sm font-medium mt-1">{c.value}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className="text-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-base px-10 h-12" onClick={() => setDemoDialog(true)}>
              <Send className="h-5 w-5 mr-2" />
              Minta Demo Sekarang
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">Toko Surya Kencana</p>
                <p className="text-xs text-gray-500">Sistem Manajemen Supplier Sembako</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Toko Surya Kencana. Dikembangkan oleh PT ITS Academic Technology.</p>
          </div>
        </div>
      </footer>

      {/* Demo Request Dialog */}
      <Dialog open={demoDialog} onOpenChange={setDemoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-emerald-600" /> Minta Demo Gratis</DialogTitle>
            <DialogDescription>
              Isi form di bawah ini untuk mendapatkan demo aplikasi dan konsultasi gratis dari tim kami.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap *</label>
              <Input placeholder="Nama Anda" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor WhatsApp *</label>
              <Input placeholder="08xxxxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Toko</label>
              <Input placeholder="Nama toko Anda" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesan (opsional)</label>
              <Textarea placeholder="Ceritakan kebutuhan Anda..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDemoDialog(false)}>Batal</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setDemoDialog(false) }}>
              Kirim Permintaan <Send className="h-4 w-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
