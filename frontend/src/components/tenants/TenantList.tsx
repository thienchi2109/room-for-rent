'use client'

import { useState } from 'react'
import { Search, Phone, MapPin, Grid3X3, Table } from 'lucide-react'
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
import { useRooms } from '@/hooks/useRooms'
import { TenantWithContracts } from '@/types/tenant'

interface TenantListProps {
  view: 'grid' | 'table'
  setView: (view: 'grid' | 'table') => void
}

export function TenantList({ view, setView }: TenantListProps) {
  // Helper function to get active contract - defined inside component
  const getActiveContract = (tenant: TenantWithContracts) => {
    return tenant.contracts?.find(contractTenant =>
      contractTenant.contract.status === 'ACTIVE'
    )
  }
  // Client-side filtering states
  const [searchTerm, setSearchTerm] = useState('')
  const [roomNumberFilter, setRoomNumberFilter] = useState('')
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [selectedTenant, setSelectedTenant] = useState<TenantWithContracts | null>(null)
  const [editingTenant, setEditingTenant] = useState<TenantWithContracts | null>(null)
  const [deletingTenant, setDeletingTenant] = useState<TenantWithContracts | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch all tenants with high limit for client-side filtering
  const { data, isLoading, error, refetch } = useTenants({ limit: 100 })

  // Fetch rooms for floor filter options
  const { data: roomsData } = useRooms({ limit: 100 })

  // Extract tenants array from response
  const tenants = Array.isArray(data) ? data : data?.data || []
  const rooms = Array.isArray(roomsData) ? roomsData : roomsData?.data || []

  // Get unique floors for filter
  const floors = Array.from(new Set(rooms.map((room: { floor: number }) => room.floor))).sort((a, b) => a - b)

  // Client-side filtering
  const filteredTenants = tenants.filter((tenant: TenantWithContracts) => {
    const matchesSearch = tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.phone.includes(searchTerm)

    const activeContract = getActiveContract(tenant)

    const matchesRoomNumber = !roomNumberFilter ||
                             (activeContract && activeContract.contract.room.number.toLowerCase().includes(roomNumberFilter.toLowerCase()))

    const matchesFloor = floorFilter === 'ALL' ||
                        (activeContract && activeContract.contract.room.floor === floorFilter)

    return matchesSearch && matchesRoomNumber && matchesFloor
  })

  // Pagination for table view
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTenants = view === 'table' ? filteredTenants.slice(startIndex, endIndex) : filteredTenants

  // Reset to first page when filters change
  const resetPagination = () => {
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
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

  return (
    <div className="space-y-6">
      {/* Filters and Search - Client-side filtering */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                resetPagination()
              }}
              className="pl-10"
            />
          </div>

          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Tìm theo số phòng..."
              value={roomNumberFilter}
              onChange={(e) => {
                setRoomNumberFilter(e.target.value)
                resetPagination()
              }}
              className="flex-1"
            />
          </div>
        </div>

        {/* Floor Filter Buttons */}
        {floors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={floorFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFloorFilter('ALL')
                resetPagination()
              }}
            >
              Tất cả tầng
            </Button>
            {floors.map((floor) => (
              <Button
                key={floor}
                variant={floorFilter === floor ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFloorFilter(floor)
                  resetPagination()
                }}
              >
                Tầng {floor}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Lưới
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
          >
            <Table className="w-4 h-4 mr-2" />
            Bảng
          </Button>
        </div>
      </div>

      {/* Content based on view */}
      {filteredTenants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm || roomNumberFilter || floorFilter !== 'ALL'
              ? 'Không tìm thấy khách thuê phù hợp với bộ lọc'
              : 'Chưa có khách thuê nào được tạo'
            }
          </p>
          {(searchTerm || roomNumberFilter || floorFilter !== 'ALL') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setRoomNumberFilter('')
                setFloorFilter('ALL')
                resetPagination()
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map((tenant) => {
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
            tenants={paginatedTenants}
            onView={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination for Table View */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredTenants.length)} trong tổng số {filteredTenants.length} khách thuê
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Trước
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let startPage = Math.max(1, currentPage - 2)
                    const endPage = Math.min(totalPages, startPage + 4)

                    if (endPage - startPage < 4) {
                      startPage = Math.max(1, endPage - 4)
                    }

                    return startPage + i
                  }).filter(page => page <= totalPages).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
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
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
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