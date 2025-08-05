'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { TenantList } from '@/components/tenants/TenantList'
import { TenantDialog } from '@/components/tenants/TenantDialog'

export default function TenantsPage() {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

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
        {/* Desktop Create Button - Hidden on mobile */}
        <div className="hidden lg:block">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm khách thuê
          </Button>
        </div>
      </div>

      {/* Tenant List with integrated filters and view toggle */}
      <TenantList
        view={view}
        setView={setView}
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

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton
        onClick={() => setIsCreateDialogOpen(true)}
        icon={<Plus className="h-6 w-6" />}
        size="default"
      >
        Thêm khách thuê
      </FloatingActionButton>
    </div>
  )
}