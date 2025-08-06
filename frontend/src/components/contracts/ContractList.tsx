'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Calendar, Building, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ContractStatusBadge } from './ContractStatusBadge'
import { ContractDetailDialog } from './ContractDetailDialog'
import { ContractForm } from './ContractForm'
import { ContractDeleteDialog } from './ContractDeleteDialog'
import { useContracts } from '@/hooks/useContracts'
import { ContractFilters, ContractWithDetails, ContractStatus } from '@/types/contract'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ContractListProps {
  onContractSelect?: (contract: ContractWithDetails) => void
  showCreateButton?: boolean
  initialFilters?: Partial<ContractFilters>
}

export function ContractList({ 
  onContractSelect, 
  showCreateButton = true,
  initialFilters = {}
}: ContractListProps) {
  const [filters, setFilters] = useState<ContractFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<ContractWithDetails | null>(null)
  const [deletingContract, setDeletingContract] = useState<ContractWithDetails | null>(null)

  const { data: contractsData, isLoading, error } = useContracts(filters)

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchTerm,
        page: 1
      }))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleStatusFilter = (status: ContractStatus | 'ALL') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'ALL' ? undefined : status,
      page: 1
    }))
  }

  const handleContractClick = (contract: ContractWithDetails) => {
    if (onContractSelect) {
      onContractSelect(contract)
    } else {
      setSelectedContract(contract)
      setIsDetailDialogOpen(true)
    }
  }

  const handleEditContract = (contract: ContractWithDetails) => {
    setEditingContract(contract)
  }

  const handleDeleteContract = (contract: ContractWithDetails) => {
    setDeletingContract(contract)
  }

  const statusOptions = [
    { value: 'ALL', label: 'Tất cả', count: contractsData?.pagination.totalCount || 0 },
    { value: 'ACTIVE', label: 'Đang hoạt động', count: 0 },
    { value: 'EXPIRED', label: 'Hết hạn', count: 0 },
    { value: 'TERMINATED', label: 'Đã kết thúc', count: 0 }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Có lỗi xảy ra khi tải danh sách hợp đồng</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Thử lại
        </Button>
      </div>
    )
  }

  const contracts = contractsData?.data || []
  const pagination = contractsData?.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QUẢN LÝ HỢP ĐỒNG</h1>
          <p className="text-gray-600 mt-1">
            Quản lý hợp đồng thuê phòng và theo dõi trạng thái
          </p>
        </div>

        {showCreateButton && (
          <div className="hidden lg:block">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo hợp đồng mới
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo số hợp đồng, phòng, hoặc tên khách thuê..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={filters.status === option.value || (option.value === 'ALL' && !filters.status) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(option.value as ContractStatus | 'ALL')}
              className="flex-shrink-0"
            >
              <span className="truncate">{option.label}</span>
              {option.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {option.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {contracts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy hợp đồng nào
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filters.status 
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Chưa có hợp đồng nào được tạo'
            }
          </p>
          {showCreateButton && !searchTerm && !filters.status && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo hợp đồng đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Contract Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.map((contract) => (
              <Card 
                key={contract.id} 
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleContractClick(contract)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {contract.contractNumber}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">
                          Phòng {contract.room.number}
                        </span>
                      </div>
                    </div>
                    <ContractStatusBadge 
                      status={contract.status}
                      endDate={contract.endDate}
                      size="sm"
                    />
                  </div>

                  {/* Tenants */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Khách thuê ({contract.tenants.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {contract.tenants.slice(0, 2).map((contractTenant) => (
                        <div key={contractTenant.tenantId} className="flex items-center gap-2">
                          <div className="text-sm text-gray-600">
                            {contractTenant.tenant.fullName}
                            {contractTenant.isPrimary && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Chính
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {contract.tenants.length > 2 && (
                        <div className="text-sm text-gray-500">
                          +{contract.tenants.length - 2} khách khác
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contract Period */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Thời hạn</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: vi })} - {' '}
                      {format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  </div>

                  {/* Deposit */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-600">Tiền cọc:</span>
                    <span className="font-semibold text-gray-900">
                      {contract.deposit.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} trong tổng số {' '}
                {pagination.totalCount} hợp đồng
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <ContractDetailDialog
        contract={selectedContract}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onEdit={handleEditContract}
        onDelete={handleDeleteContract}
      />

      <ContractForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {editingContract && (
        <ContractForm
          contract={editingContract}
          open={!!editingContract}
          onOpenChange={(open) => !open && setEditingContract(null)}
          mode="edit"
        />
      )}

      {deletingContract && (
        <ContractDeleteDialog
          contract={deletingContract}
          open={!!deletingContract}
          onOpenChange={(open) => !open && setDeletingContract(null)}
        />
      )}

      {/* Floating Action Button for Mobile */}
      {showCreateButton && (
        <FloatingActionButton
          onClick={() => setIsCreateDialogOpen(true)}
          icon={<Plus className="h-6 w-6" />}
          size="default"
        >
          Tạo hợp đồng mới
        </FloatingActionButton>
      )}
    </div>
  )
}
