import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0] + 'T' + 
    randomBetween(7, 18).toString().padStart(2, '0') + ':' +
    randomBetween(0, 59).toString().padStart(2, '0') + ':00.000Z'
}

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await db.payment.deleteMany()
  await db.invoice.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.stockHistory.deleteMany()
  await db.expense.deleteMany()
  await db.product.deleteMany()
  await db.customer.deleteMany()

  // === PRODUCTS ===
  const products = await db.product.createMany({
    data: [
      // Beras
      { name: 'Beras Premium IR 64 5kg', category: 'Beras', unit: 'karung', buyPrice: 58000, sellPrice: 65000, stock: 120, minStock: 20 },
      { name: 'Beras Medium IR 64 5kg', category: 'Beras', unit: 'karung', buyPrice: 52000, sellPrice: 58000, stock: 85, minStock: 20 },
      { name: 'Beras Pandan Wangi 5kg', category: 'Beras', unit: 'karung', buyPrice: 62000, sellPrice: 70000, stock: 45, minStock: 15 },
      { name: 'Beras Rojolele 5kg', category: 'Beras', unit: 'karung', buyPrice: 55000, sellPrice: 62000, stock: 60, minStock: 15 },
      { name: 'Beras Bulog 10kg', category: 'Beras', unit: 'karung', buyPrice: 105000, sellPrice: 115000, stock: 30, minStock: 10 },
      // Minyak Goreng
      { name: 'Minyak Goreng Bimoli 2L', category: 'Minyak Goreng', unit: 'botol', buyPrice: 28000, sellPrice: 32000, stock: 200, minStock: 50 },
      { name: 'Minyak Goreng Curah 1L', category: 'Minyak Goreng', unit: 'liter', buyPrice: 14000, sellPrice: 16000, stock: 150, minStock: 40 },
      { name: 'Minyak Goreng Sania 2L', category: 'Minyak Goreng', unit: 'botol', buyPrice: 27000, sellPrice: 31000, stock: 80, minStock: 30 },
      // Gula
      { name: 'Gula Pasir Putih 1kg', category: 'Gula', unit: 'kg', buyPrice: 14500, sellPrice: 16500, stock: 180, minStock: 50 },
      { name: 'Gula Pasir Kristal 1kg', category: 'Gula', unit: 'kg', buyPrice: 15000, sellPrice: 17000, stock: 100, minStock: 30 },
      // Tepung
      { name: 'Tepung Terigu Segitiga Biru 1kg', category: 'Tepung', unit: 'kg', buyPrice: 11000, sellPrice: 13000, stock: 150, minStock: 40 },
      { name: 'Tepung Beras Rose Brand 500g', category: 'Tepung', unit: 'pak', buyPrice: 8500, sellPrice: 10000, stock: 90, minStock: 25 },
      // Telur
      { name: 'Telur Ayam Negeri 1kg', category: 'Telur', unit: 'kg', buyPrice: 24000, sellPrice: 28000, stock: 60, minStock: 20 },
      // Mie Instan
      { name: 'Indomie Goreng 1 dus (40pcs)', category: 'Mie Instan', unit: 'dus', buyPrice: 95000, sellPrice: 108000, stock: 75, minStock: 20 },
      { name: 'Indomie Kuah Soto 1 dus (40pcs)', category: 'Mie Instan', unit: 'dus', buyPrice: 95000, sellPrice: 108000, stock: 50, minStock: 15 },
      { name: 'Sedaap Goreng 1 dus (40pcs)', category: 'Mie Instan', unit: 'dus', buyPrice: 92000, sellPrice: 105000, stock: 40, minStock: 15 },
      // Kecap & Saus
      { name: 'Kecap Manis ABC 600ml', category: 'Kecap & Saus', unit: 'botol', buyPrice: 17000, sellPrice: 19500, stock: 120, minStock: 30 },
      { name: 'Saos Sambal ABC 335ml', category: 'Kecap & Saus', unit: 'botol', buyPrice: 10000, sellPrice: 12000, stock: 80, minStock: 25 },
      { name: 'Kecap Asin ABC 275ml', category: 'Kecap & Saus', unit: 'botol', buyPrice: 8000, sellPrice: 9500, stock: 60, minStock: 20 },
      // Bumbu & Rempah
      { name: 'Garam Dapur Beryodium 250g', category: 'Bumbu & Rempah', unit: 'pak', buyPrice: 2500, sellPrice: 3500, stock: 200, minStock: 60 },
      { name: 'Bawang Merah 1kg', category: 'Bumbu & Rempah', unit: 'kg', buyPrice: 32000, sellPrice: 38000, stock: 40, minStock: 10 },
      { name: 'Bawang Putih 1kg', category: 'Bumbu & Rempah', unit: 'kg', buyPrice: 28000, sellPrice: 34000, stock: 35, minStock: 10 },
      { name: 'Cabai Merah Keriting 1kg', category: 'Bumbu & Rempah', unit: 'kg', buyPrice: 35000, sellPrice: 42000, stock: 25, minStock: 8 },
      { name: 'Kunyit 1kg', category: 'Bumbu & Rempah', unit: 'kg', buyPrice: 18000, sellPrice: 22000, stock: 20, minStock: 5 },
      { name: 'Jahe 1kg', category: 'Bumbu & Rempah', unit: 'kg', buyPrice: 22000, sellPrice: 27000, stock: 18, minStock: 5 },
      { name: 'Lengkuas 1kg', category: 'Bumbu & Rempah', unit: 'kg', buyPrice: 15000, sellPrice: 19000, stock: 15, minStock: 5 },
      { name: 'Merica Bubuk 200g', category: 'Bumbu & Rempah', unit: 'pak', buyPrice: 12000, sellPrice: 15000, stock: 45, minStock: 15 },
      // Susu
      { name: 'Susu Kental Manis Frisian Flag 370g', category: 'Susu', unit: 'kaleng', buyPrice: 9500, sellPrice: 11500, stock: 180, minStock: 50 },
      { name: 'Susu Bubuk Dancow 400g', category: 'Susu', unit: 'pak', buyPrice: 32000, sellPrice: 37000, stock: 60, minStock: 15 },
      { name: 'Susu Bubuk Indomilk 800g', category: 'Susu', unit: 'pak', buyPrice: 58000, sellPrice: 66000, stock: 35, minStock: 10 },
      // Deterjen & Kebutuhan RT
      { name: 'Rinso Anti Noda 800g', category: 'Kebutuhan RT', unit: 'pak', buyPrice: 15000, sellPrice: 18000, stock: 100, minStock: 30 },
      { name: 'Sunlight 800ml', category: 'Kebutuhan RT', unit: 'botol', buyPrice: 12000, sellPrice: 14500, stock: 90, minStock: 25 },
      { name: 'Molto Pewangi 800ml', category: 'Kebutuhan RT', unit: 'botol', buyPrice: 10000, sellPrice: 12500, stock: 70, minStock: 20 },
      // Sarden & Kaleng
      { name: 'Sarden ABC 425g', category: 'Makanan Kaleng', unit: 'kaleng', buyPrice: 12000, sellPrice: 14500, stock: 80, minStock: 25 },
      { name: 'Kornet Sapi Pronas 340g', category: 'Makanan Kaleng', unit: 'kaleng', buyPrice: 25000, sellPrice: 30000, stock: 40, minStock: 10 },
      // Air Mineral
      { name: 'Aqua 600ml 1 dus (24pcs)', category: 'Air Mineral', unit: 'dus', buyPrice: 48000, sellPrice: 54000, stock: 60, minStock: 15 },
      { name: 'Aqua Galon 19L', category: 'Air Mineral', unit: 'galon', buyPrice: 14000, sellPrice: 18000, stock: 45, minStock: 15 },
      // Kopi & Minuman
      { name: 'Kapal Api Special 1 Renceng (10pcs)', category: 'Kopi & Minuman', unit: 'renceng', buyPrice: 11000, sellPrice: 13000, stock: 100, minStock: 30 },
      { name: 'Teh Pucuk Harum 1 dus (24pcs)', category: 'Kopi & Minuman', unit: 'dus', buyPrice: 58000, sellPrice: 66000, stock: 45, minStock: 10 },
      { name: 'Kopi Good Day Cappuccino 1 dus (10pcs)', category: 'Kopi & Minuman', unit: 'dus', buyPrice: 85000, sellPrice: 98000, stock: 30, minStock: 8 },
      // Kecap Manis
      { name: 'Kecap Manis Pohon Sagu 600ml', category: 'Kecap & Saus', unit: 'botol', buyPrice: 14000, sellPrice: 16500, stock: 70, minStock: 20 },
    ]
  })

  console.log(`✅ Created ${products.count} products`)

  // === CUSTOMERS ===
  const customer1 = await db.customer.create({
    data: { name: 'Dapur SPPG Pati 1', phone: '081234567890', address: 'Jl. Raya Pati No. 45, Kab. Pati', type: 'DAPUR' }
  })
  const customer2 = await db.customer.create({
    data: { name: 'Dapur SPPG Kayen', phone: '081345678901', address: 'Jl. Raya Kayen No. 12, Kab. Pati', type: 'DAPUR' }
  })
  const customer3 = await db.customer.create({
    data: { name: 'Dapur SPPG Juwana', phone: '081456789012', address: 'Jl. Raya Juwana No. 78, Kab. Pati', type: 'DAPUR' }
  })
  const customer4 = await db.customer.create({
    data: { name: 'Warung Bu Siti', phone: '081567890123', address: 'Jl. Desa Sriwedari No. 5, Kab. Pati', type: 'ECERAN' }
  })
  const customer5 = await db.customer.create({
    data: { name: 'Toko Maju Jaya', phone: '081678901234', address: 'Jl. Pasar Baru No. 22, Kab. Pati', type: 'GROSIR' }
  })
  const customer6 = await db.customer.create({
    data: { name: 'Dapur SPPG Tayu', phone: '081789012345', address: 'Jl. Raya Tayu No. 33, Kab. Pati', type: 'DAPUR' }
  })
  const customer7 = await db.customer.create({
    data: { name: 'Warung Pak Hadi', phone: '081890123456', address: 'Jl. Raya Margorejo No. 15, Kab. Pati', type: 'ECERAN' }
  })
  const customer8 = await db.customer.create({
    data: { name: 'Toko Berkah Abadi', phone: '081901234567', address: 'Jl. Raya Rembang Km 5, Kab. Pati', type: 'GROSIR' }
  })

  console.log(`✅ Created 8 customers`)

  // === ORDERS ===
  const allProducts = await db.product.findMany()
  const customers = [customer1, customer2, customer3, customer4, customer5, customer6, customer7, customer8]
  
  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'SHIPPED', 'CONFIRMED', 'PENDING', 'CANCELLED']
  const paymentMethods = ['TRANSFER', 'CASH']

  const orderCount = 25
  const createdOrders: any[] = []

  for (let i = 0; i < orderCount; i++) {
    const daysAgo = randomBetween(0, 60)
    const orderDate = new Date()
    orderDate.setDate(orderDate.getDate() - daysAgo)

    const customer = customers[randomBetween(0, customers.length - 1)]
    const status = statuses[randomBetween(0, statuses.length - 1)]
    const numItems = randomBetween(2, 8)
    
    const usedIndices = new Set<number>()
    const items: any[] = []
    let totalAmount = 0

    for (let j = 0; j < numItems && usedIndices.size < allProducts.length; j++) {
      let prodIdx: number
      do { prodIdx = randomBetween(0, allProducts.length - 1) } while (usedIndices.has(prodIdx))
      usedIndices.add(prodIdx)

      const product = allProducts[prodIdx]
      const qty = randomBetween(1, status === 'CANCELLED' ? 1 : 20)
      const subtotal = product.sellPrice * qty
      totalAmount += subtotal

      items.push({
        productId: product.id,
        quantity: qty,
        price: product.sellPrice,
        subtotal
      })
    }

    const orderNumber = `ORD-${String(orderCount - i).padStart(4, '0')}-${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getFullYear()).slice(-2)}`
    const notes = ['Pesan via telepon', 'Kirim sore hari', 'Urgent untuk besok', 'Pesanan rutin', 'Ada tambahan nanti', ''][randomBetween(0, 5)]

    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status,
        notes: notes || null,
        totalAmount: status === 'CANCELLED' ? 0 : totalAmount,
        createdAt: new Date(formatDate(orderDate)),
        items: { create: items }
      },
      include: { customer: true, items: true }
    })

    createdOrders.push(order)

    // Create payment for completed orders
    if (status === 'COMPLETED') {
      const paidAmount = totalAmount
      const paymentDate = new Date(orderDate)
      paymentDate.setDate(paymentDate.getDate() + randomBetween(0, 5))

      await db.payment.create({
        data: {
          paymentNumber: `PAY-${String(i + 1).padStart(4, '0')}`,
          orderId: order.id,
          amount: paidAmount,
          method: paymentMethods[randomBetween(0, 1)],
          date: new Date(formatDate(paymentDate)),
          notes: 'Lunas'
        }
      })

      // Create invoice for completed orders
      const invoiceDate = new Date(orderDate)
      const dueDate = new Date(orderDate)
      dueDate.setDate(dueDate.getDate() + 14)
      const ppnAmount = Math.round(totalAmount * 11 / 100)
      const totalWithPPN = totalAmount + ppnAmount

      await db.invoice.create({
        data: {
          invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}${String(invoiceDate.getFullYear()).slice(-2)}`,
          orderId: order.id,
          status: 'PAID',
          ppnRate: 11,
          ppnAmount,
          totalAmount: totalWithPPN,
          dueDate: new Date(dueDate.toISOString().split('T')[0] + 'T23:59:59.000Z'),
          paidAt: new Date(formatDate(paymentDate)),
          createdAt: new Date(formatDate(invoiceDate))
        }
      })
    }

    // Create invoice for shipped/confirmed (unpaid)
    if (status === 'SHIPPED' || status === 'CONFIRMED') {
      const invoiceDate = new Date(orderDate)
      const dueDate = new Date(orderDate)
      dueDate.setDate(dueDate.getDate() + 14)
      const ppnAmount = Math.round(totalAmount * 11 / 100)
      const totalWithPPN = totalAmount + ppnAmount

      await db.invoice.create({
        data: {
          invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}${String(invoiceDate.getFullYear()).slice(-2)}`,
          orderId: order.id,
          status: 'UNPAID',
          ppnRate: 11,
          ppnAmount,
          totalAmount: totalWithPPN,
          dueDate: new Date(dueDate.toISOString().split('T')[0] + 'T23:59:59.000Z'),
          createdAt: new Date(formatDate(invoiceDate))
        }
      })
    }
  }

  console.log(`✅ Created ${orderCount} orders with items, payments, and invoices`)

  // === STOCK HISTORY ===
  const stockHistoryCount = 50
  for (let i = 0; i < stockHistoryCount; i++) {
    const product = allProducts[randomBetween(0, allProducts.length - 1)]
    const daysAgo = randomBetween(0, 30)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const type = Math.random() > 0.4 ? 'IN' : 'OUT'
    const qty = randomBetween(5, 50)

    await db.stockHistory.create({
      data: {
        productId: product.id,
        type,
        quantity: qty,
        note: type === 'IN' ? 'Restok dari supplier' : 'Terjual ke pelanggan',
        createdAt: new Date(formatDate(date))
      }
    })
  }

  console.log(`✅ Created ${stockHistoryCount} stock history entries`)

  // === EXPENSES ===
  const expenseCategories = ['Operasional', 'Transportasi', 'Gaji', 'Sewa', 'Listrik & Air', 'Perlengkapan', 'Beli Stok', 'Lainnya']
  const expenseDescriptions: Record<string, string[]> = {
    'Operasional': ['Beli kantong plastik', 'ATK kantor', 'Printer ink', 'Kuota internet'],
    'Transportasi': ['Bensin pengiriman', 'Sewa motor', 'Ongkir kirim', 'Parkir'],
    'Gaji': ['Gaji karyawan bulan ini', 'Lembur minggu ini', 'Bonus karyawan'],
    'Sewa': ['Sewa gudang bulan ini', 'Sewa toko bulan ini'],
    'Listrik & Air': ['Tagihan listrik', 'Tagihan PDAM', 'Token listrik'],
    'Perlengkapan': ['Timbangan baru', 'Rak penyimpanan', 'Brankas'],
    'Beli Stok': ['Pembelian stok harian', 'Pembelian stok mingguan'],
    'Lainnya': ['Biaya tak terduga', 'Servis kendaraan', 'Perizinan']
  }

  for (let i = 0; i < 40; i++) {
    const daysAgo = randomBetween(0, 60)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const category = expenseCategories[randomBetween(0, expenseCategories.length - 1)]
    const descriptions = expenseDescriptions[category]
    const description = descriptions[randomBetween(0, descriptions.length - 1)]
    const amount = randomBetween(15000, 2500000)

    await db.expense.create({
      data: {
        category,
        description,
        amount,
        date: new Date(formatDate(date))
      }
    })
  }

  console.log(`✅ Created 40 expense entries`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
