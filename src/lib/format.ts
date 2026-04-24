export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateInput(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toISOString().split('T')[0]
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
    SHIPPED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    UNPAID: 'bg-amber-100 text-amber-800 border-amber-200',
    PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    OVERDUE: 'bg-red-100 text-red-800 border-red-200',
  }
  return map[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Menunggu',
    CONFIRMED: 'Dikonfirmasi',
    PROCESSING: 'Diproses',
    SHIPPED: 'Dikirim',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    UNPAID: 'Belum Bayar',
    PAID: 'Lunas',
    OVERDUE: 'Jatuh Tempo',
  }
  return map[status] || status
}

export function getCustomerTypeColor(type: string): string {
  const map: Record<string, string> = {
    DAPUR: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ECERAN: 'bg-blue-100 text-blue-800 border-blue-200',
    GROSIR: 'bg-amber-100 text-amber-800 border-amber-200',
  }
  return map[type] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getCustomerTypeLabel(type: string): string {
  const map: Record<string, string> = {
    DAPUR: 'Dapur SPPG',
    ECERAN: 'Eceran',
    GROSIR: 'Grosir',
  }
  return map[type] || type
}

export function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
