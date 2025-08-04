'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TenantList } from '@/components/tenants/TenantList'
import { TenantDialog } from '@/components/tenants/TenantDialog'
import { TenantFilters } from '@/types/tenant'

export default function TenantsPage() {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filters, setFilters] = useState<TenantFilters>({
    page: 1,
    limit: 20,
    roomNumber: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    floor: undefined
  })

  const handleFiltersChange = (newFilters: Partial<TenantFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QUẢN LÝ KHÁCH THUÊ</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin khách thuê và lịch sử thuê phòng
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm khách thuê
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            Lưới
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
          >
            Bảng
          </Button>
        </div>
      </div>

      {/* Tenant List */}
      <TenantList
        view={view}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Create Tenant Dialog */}
      <TenantDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          // Refresh list will be handled by TanStack Query
        }}
      />
    </div>
  )
}