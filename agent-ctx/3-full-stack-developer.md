---
Task ID: 3
Agent: full-stack-developer
Task: Migrate all API routes from Prisma/SQLite to JSON-based storage

Work Log:
- Read and analyzed existing project structure: types.ts, db.json (seed data with 41 products, 8 customers, 25 orders, 18 invoices, 18 payments, 20 expenses, 5 stock history entries), format.ts
- Read all 14 existing API route files to understand Prisma query patterns and business logic
- Created `/src/lib/json-db.ts` — JSON database layer with in-memory mutable state, deep-cloned from seed data, with dev-mode file sync via dynamic fs import
- Rewrote all 14 API route files to use `readData()`/`writeData()` instead of Prisma:
  - `/src/app/api/products/route.ts` — GET with ?q= and ?category= filters; POST with generated ID
  - `/src/app/api/products/[id]/route.ts` — GET with stockHistory join; PUT with stock change detection; DELETE with order-item usage check
  - `/src/app/api/customers/route.ts` — GET with ?q= and ?type= filters, includes order count; POST with generated ID
  - `/src/app/api/customers/[id]/route.ts` — GET/PUT/DELETE with orders relation check
  - `/src/app/api/orders/route.ts` — GET with ?status=, ?from=, ?to= filters, enriched with customer+product; POST with stock deduction and stock history OUT entries
  - `/src/app/api/orders/[id]/route.ts` — GET with full enrichment; PUT with auto-invoice on COMPLETED, stock restore on CANCELLED; DELETE with stock restore and cascade cleanup
  - `/src/app/api/invoices/route.ts` — GET with ?status= filter, enriched with order+customer; POST with PPN 11% calculation
  - `/src/app/api/invoices/[id]/route.ts` — GET with full order+items+payments enrichment; PUT with PAID auto-set paidAt
  - `/src/app/api/payments/route.ts` — GET with date range filters, enriched with order+customer; POST with auto-invoice PAID when total payments >= order total
  - `/src/app/api/expenses/route.ts` — GET with ?category= and date range filters; POST with generated ID
  - `/src/app/api/expenses/[id]/route.ts` — PUT/DELETE with validation
  - `/src/app/api/reports/route.ts` — Full analytics: totalRevenue, totalExpense, totalProfit, totalOrders, pendingOrders, unpaidInvoices, lowStockProducts, topSellingProducts (top 5), monthlyRevenue/Expenses (last 6 months with "Jan 25" labels), expenseByCategory, recentOrders, customerStats, totalCustomers, avgOrderValue
  - `/src/app/api/stock-history/route.ts` — GET with ?productId= filter, enriched with product name/category/unit
- Deleted old Prisma-dependent files:
  - `/src/lib/db.ts` (PrismaClient wrapper)
  - `/src/app/api/route.ts` (old hello-world endpoint)
- Verified zero remaining references to `@prisma/client` or `@/lib/db` in source
- Fixed TypeScript type inference issues in invoices/[id]/route.ts (null assignment narrowing)
- Cleared `.next` cache to remove stale type references
- TypeScript compilation passes with zero errors in modified files
- ESLint: only pre-existing react-hooks/set-state-in-effect warnings in frontend views (not related to this migration)

Issues:
- Dev server stopped during file changes (likely due to deleting db.ts which was imported by old routes). The `.next` cache was cleared and will rebuild on next server start.
- No breaking changes to API response shapes — all endpoints maintain the same `{ data: ... }` / `{ error: ... }` response format
