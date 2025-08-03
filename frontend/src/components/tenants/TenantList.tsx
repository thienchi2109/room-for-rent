'use client'

import { useState } from 'react'
import { Search, Filter, Eye, Edit, Trash2, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TenantDialog } from './TenantDialog'
import { TenantDetailDialog } from './TenantDetailDialog'
import { TenantDeleteDialog } from './TenantDeleteDialog'
import { useTenants } from '@/hooks/useTenants'
import { TenantFilters, TenantWithContracts } from '@/types/tenant'

interface TenantListProps {
  filters: TenantFilters
  onFiltersChange: (filters: Partial<TenantFilters>) => void
}

export function TenantList({ filters, onFiltersChange }: TenantListProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [selectedTenant, setSelectedTenant] = useState<TenantWithContracts | null>(null)
  const [editingTenant, setEditingTenant] = useState<TenantWithContracts | null>(null)
  const [deletingTenant, setDeletingTenant] = useState<TenantWithContracts | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch tenants
  const { data, isLoading, error, refetch } = useTenants(filters)

  const handleSearch = () => {
    onFiltersChange({ search: searchInput, page: 1 })
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ page: newPage })
  }

  const handleViewDetails = (tenant: TenantWithContracts) => {
    setSelectedTenant(tenant)
    setIsDetailDialogOpen(true)
  }

  const handleEdit = (tenant: TenantWithContracts) => {
    setEditingTenant(tenant)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (tenant: TenantWithContracts) => {
    setDeletingTenant(tenant)
    setIsDeleteDialogOpen(true)
  }

  const getActiveContract = (tenant: TenantWithContracts) => {
    return tenant.contracts.find(ct => ct.contract.status === 'ACTIVE')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải danh sách khách thuê</p>
        <Button onClick={() => refetch()} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  const tenants = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Tìm kiếm theo tên, CCCD, số điện thoại..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
            </Button>
          </div>
        </div>
      </Card>

      {/* Tenant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((tenant) => {
          const activeContract = getActiveContract(tenant)
          
          return (
            <Card key={tenant.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{tenant.fullName}</h3>
                    <p className="text-sm text-gray-600">CCCD: {tenant.idCard}</p>
                  </div>
                  
                  {activeContract && (
                    <Badge variant="default">
                      Phòng {activeContract.contract.room.number}
                    </Badge>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {tenant.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {tenant.hometown}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Số hợp đồng: {tenant._count.contracts}
                  </span>
                  <span className="text-gray-600">
                    Ngày sinh: {new Date(tenant.dateOfBirth).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(tenant)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Xem
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(tenant)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(tenant)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {tenants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {filters.search ? 'Không tìm thấy khách thuê nào' : 'Chưa có khách thuê nào'}
          </p>
          {filters.search && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchInput('')
                onFiltersChange({ search: '', page: 1 })
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Trước
          </Button>
          
          <span className="text-sm text-gray-600">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {selectedTenant && (
        <TenantDetailDialog
          tenant={selectedTenant}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}

      {editingTenant && (
        <TenantDialog
          tenant={editingTenant}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          onSuccess={() => {
            setIsEditDialogOpen(false)
            setEditingTenant(null)
            refetch()
          }}
        />
      )}

      {deletingTenant && (
        <TenantDeleteDialog
          tenant={deletingTenant}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={() => {
            setIsDeleteDialogOpen(false)
            setDeletingTenant(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}