'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TenantList } from '@/components/tenants/TenantList'
import { TenantDialog } from '@/components/tenants/TenantDialog'
import { TenantFilters } from '@/types/tenant'

export default function TenantsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filters, setFilters] = useState<TenantFilters>({
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const handleFiltersChange = (newFilters: Partial<TenantFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Khách thuê</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin khách thuê và lịch sử thuê phòng</p>
        </div>
        
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm khách thuê
        </Button>
      </div>

      {/* Tenant List */}
      <TenantList 
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