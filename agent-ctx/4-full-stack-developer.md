# Task 4: Update page.tsx - Landing + Dashboard Navigation

## Status: COMPLETED

## Changes Made

### 1. State Management
- Removed `demoDialog` state (was used for the demo request dialog)
- Added `view` state: `useState<'landing' | 'dashboard'>('landing')`
- Added `activeTab` state: `useState('dashboard')` for sidebar navigation
- Added `sidebarOpen` state: `useState(false)` for mobile Sheet menu

### 2. Removed Demo Dialog
- Removed the entire `<Dialog>` component at the bottom of the file (lines 518-551)
- Removed `Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter` imports
- Removed `Input, Textarea` imports (only used in dialog)
- Removed `demoDialog` state variable

### 3. Button Behavior Changes
- **All `setDemoDialog(true)`** → **`setView('dashboard')`** (5 occurrences)
- **All "Minta Demo"** text → **"Lihat Demo"** (4 occurrences)
- Buttons affected:
  - Desktop navbar button
  - Mobile menu button
  - Hero CTA button
  - Pricing section "Pilih Paket" buttons
  - Contact section CTA button

### 4. Dashboard Admin Layout (inline in page.tsx)
- **Header**: Sticky header with:
  - Mobile hamburger menu (Sheet trigger, hidden on desktop)
  - "← Kembali ke Beranda" back button (hidden on mobile, "Beranda" on mobile)
  - Active page title
  - Admin avatar with `CircleUser` icon
- **Sidebar**: 
  - Desktop: Fixed sidebar (`lg:w-60`) with store branding + navigation
  - Mobile: `Sheet` component sliding from left
  - `DASHBOARD_NAV` array with 7 items: Dashboard, Produk & Inventaris, Pesanan, Faktur, Pelanggan, Pengeluaran, Laporan Keuangan
- **Main Content**: Renders corresponding view component based on `activeTab`
- **Footer**: Simple centered footer with copyright

### 5. New Imports Added
- `Sheet, SheetContent, SheetTrigger` from `@/components/ui/sheet`
- `LayoutDashboard, ArrowLeft, CircleUser` from `lucide-react`
- All 7 view components from `@/components/app/`

### 6. Preserved
- ALL existing landing page content remains exactly as-is
- No changes to any view components in `/src/components/app/`

## Files Modified
- `/home/z/my-project/src/app/page.tsx` - Complete rewrite with view switching

## Lint Results
- No lint errors in `page.tsx`
- Pre-existing lint warnings in view components (not modified per task requirements)
