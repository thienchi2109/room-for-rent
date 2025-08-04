'use client'

import { useState, useEffect } from 'react'
import { Search, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TenantDialog } from './TenantDialog'
import { TenantDetailDialog } from './TenantDetailDialog'
import { TenantDeleteDialog } from './TenantDeleteDialog'
import { TenantTable } from './TenantTable'
import { useTenants } from '@/hooks/useTenants'
import { TenantFilters, TenantWithContracts } from '@/types/tenant'

interface TenantListProps {
  view: 'grid' | 'table'
  filters: TenantFilters
  onFiltersChange: (filters: Partial<TenantFilters>) => void
}

export function TenantList({ view, filters, onFiltersChange }: TenantListProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [roomNumberInput, setRoomNumberInput] = useState(filters.roomNumber || '')
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>(filters.floor || 'ALL')
  
  const [selectedTenant, setSelectedTenant] = useState<TenantWithContracts | null>(null)
  const [editingTenant, setEditingTenant] = useState<TenantWithContracts | null>(null)
  const [deletingTenant, setDeletingTenant] = useState<TenantWithContracts | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Sync local state with props when filters change
  useEffect(() => {
    setSearchInput(filters.search || '')
    setRoomNumberInput(filters.roomNumber || '')
    setFloorFilter(filters.floor || 'ALL')
  }, [filters.search, filters.roomNumber, filters.floor])

  // Fetch tenants
  const { data, isLoading, error, refetch } = useTenants(filters)

  useEffect(() => {
    const handler = setTimeout(() => {
      // Only update if roomNumberInput actually changed
      if (roomNumberInput !== filters.roomNumber) {
        onFiltersChange({ roomNumber: roomNumberInput, page: 1 })
      }
    }, 250)

    return () => {
      clearTimeout(handler)
    }
  }, [roomNumberInput, onFiltersChange, filters.roomNumber])

  const handleSearch = () => {
    if (searchInput !== filters.search) {
      onFiltersChange({ search: searchInput, page: 1 })
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
    return tenant.contracts?.find(ct => ct.contract.status === 'ACTIVE')
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

  // Get unique floors from tenants with active contracts
  const floors = Array.from(new Set(
    tenants
      .map(tenant => getActiveContract(tenant)?.contract.room.floor)
      .filter(floor => floor !== undefined)
  )).sort((a, b) => a - b)

  // Handle floor filter change
  const handleFloorFilterChange = (floor: number | 'ALL') => {
    setFloorFilter(floor)
    onFiltersChange({ 
      floor: floor === 'ALL' ? undefined : floor, 
      page: 1 
    })
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {pagination && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm text-blue-800">
              <span className="font-semibold">Tổng số khách thuê:</span> {pagination.total} khách thuê
            </div>
            {(filters.search || filters.roomNumber || filters.floor) && (
              <div className="text-sm text-blue-600">
                Hiển thị {tenants.length} khách thuê sau khi lọc
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, CCCD, số điện thoại..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  // Auto search on change like rooms page
                  const handler = setTimeout(() => {
                    if (e.target.value !== filters.search) {
                      onFiltersChange({ search: e.target.value, page: 1 })
                    }
                  }, 300)
                  return () => clearTimeout(handler)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="pl-10"
              />
            </div>

            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Tìm theo số phòng..."
                value={roomNumberInput}
                onChange={(e) => setRoomNumberInput(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        {/* Floor Filter Buttons */}
        {floors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={floorFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFloorFilterChange('ALL')}
            >
              Tất cả tầng
            </Button>
            {floors.map((floor) => (
              <Button
                key={floor}
                variant={floorFilter === floor ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFloorFilterChange(floor)}
              >
                Tầng {floor}
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Content based on view */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => {
            const activeContract = getActiveContract(tenant)
            
            return (
              <Card 
                key={tenant.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(tenant)}
              >
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
                      Số hợp đồng: {tenant._count?.contracts || 0}
                    </span>
                    <span className="text-gray-600">
                      Ngày sinh: {new Date(tenant.dateOfBirth).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <TenantTable
            tenants={tenants}
            onView={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination for Table View - Server-side pagination with rooms-style UI */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {((filters.page || 1) - 1) * (filters.limit || 20) + 1} - {Math.min((filters.page || 1) * (filters.limit || 20), pagination.total)} trong tổng số {pagination.total} khách thuê
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                >
                  Trước
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const currentPage = filters.page || 1
                    const totalPages = pagination.totalPages
                    let startPage = Math.max(1, currentPage - 2)
                    const endPage = Math.min(totalPages, startPage + 4)
                    
                    if (endPage - startPage < 4) {
                      startPage = Math.max(1, endPage - 4)
                    }
                    
                    return startPage + i
                  }).filter(page => page <= pagination.totalPages).map((page) => (
                    <Button
                      key={page}
                      variant={filters.page === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === pagination.totalPages}
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {tenants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {filters.search || filters.roomNumber || filters.floor ? 'Không tìm thấy khách thuê nào' : 'Chưa có khách thuê nào'}
          </p>
          {(filters.search || filters.roomNumber || filters.floor) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchInput('')
                setRoomNumberInput('')
                setFloorFilter('ALL')
                onFiltersChange({ search: '', roomNumber: '', floor: undefined, page: 1 })
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}

      {/* Pagination for Grid View (API pagination) */}
      {view === 'grid' && pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => handlePageChange((filters.page || 1) - 1)}
          >
            Trước
          </Button>
          
          <span className="text-sm text-gray-600">
            Trang {filters.page || 1} / {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === pagination.totalPages}
            onClick={() => handlePageChange((filters.page || 1) + 1)}
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
          onEdit={handleEdit}
          onDelete={handleDelete}
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