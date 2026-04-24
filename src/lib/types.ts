export interface Product {
  id: string
  name: string
  category: string
  unit: string
  buyPrice: number
  sellPrice: number
  stock: number
  minStock: number
}

export interface Customer {
  id: string
  name: string
  phone: string
  address: string | null
  type: 'DAPUR' | 'ECERAN' | 'GROSIR'
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
  notes: string | null
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface Invoice {
  id: string
  invoiceNumber: string
  orderId: string
  status: 'UNPAID' | 'PAID'
  ppnRate: number
  ppnAmount: number
  totalAmount: number
  dueDate: string
  paidAt: string | null
  createdAt: string
}

export interface Payment {
  id: string
  paymentNumber: string
  orderId: string
  amount: number
  method: 'CASH' | 'TRANSFER'
  date: string
  notes: string | null
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
}

export interface StockHistory {
  id: string
  productId: string
  type: 'IN' | 'OUT'
  quantity: number
  note: string | null
  createdAt: string
}

export interface AppData {
  products: Product[]
  customers: Customer[]
  orders: Order[]
  invoices: Invoice[]
  payments: Payment[]
  expenses: Expense[]
  stockHistory: StockHistory[]
}
