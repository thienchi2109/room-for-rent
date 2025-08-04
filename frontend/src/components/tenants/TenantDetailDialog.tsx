'use client'

import { useState } from 'react'
import { Calendar, MapPin, Phone, CreditCard, Building, Clock, DollarSign, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useTenant, useTenantHistory } from '@/hooks/useTenants'
import { TenantWithContracts } from '@/types/tenant'
import { formatCurrency } from '@/lib/utils'
import { ResidencyRecordList } from '@/components/residency-records'

interface TenantDetailDialogProps {
  tenant: TenantWithContracts
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (tenant: TenantWithContracts) => void
  onDelete?: (tenant: TenantWithContracts) => void
}

export function TenantDetailDialog({ 
  tenant, 
  open, 
  onOpenChange,
  onEdit,
  onDelete
}: TenantDetailDialogProps) {
  const [historyPage, setHistoryPage] = useState(1)

  // Early return if tenant is not provided
  if (!tenant) {
    return null
  }

  // Fetch detailed tenant info
  const { data: detailData, isLoading: isDetailLoading } = useTenant(tenant.id, open)

  // Fetch rental history
  const { data: historyData, isLoading: isHistoryLoading } = useTenantHistory(
    tenant.id, 
    historyPage, 
    5, 
    open
  )

  const tenantDetail = detailData?.data || tenant
  
  // Ensure contracts is always an array - handle all edge cases
  const safeContracts = Array.isArray(tenantDetail?.contracts) 
    ? tenantDetail.contracts.filter(ct => ct && ct.contract) // Filter out invalid contracts
    : Array.isArray(tenant?.contracts) 
    ? tenant.contracts.filter(ct => ct && ct.contract) // Filter out invalid contracts
    : []
    
  // Ensure _count is always available
  const safeCount = tenantDetail?._count || tenant?._count || { contracts: 0, residencyRecords: 0 }
  
  const history = historyData?.data.history || []
  const historyPagination = historyData?.pagination

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: { variant: 'default' as const, label: 'Đang thuê' },
      EXPIRED: { variant: 'secondary' as const, label: 'Hết hạn' },
      TERMINATED: { variant: 'destructive' as const, label: 'Đã kết thúc' }
    }
    return variants[status as keyof typeof variants] || { variant: 'secondary' as const, label: status }
  }

  const getBillStatusBadge = (status: string) => {
    const variants = {
      PAID: { variant: 'default' as const, label: 'Đã thanh toán' },
      UNPAID: { variant: 'secondary' as const, label: 'Chưa thanh toán' },
      OVERDUE: { variant: 'destructive' as const, label: 'Quá hạn' }
    }
    return variants[status as keyof typeof variants] || { variant: 'secondary' as const, label: status }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết khách thuê</DialogTitle>
        </DialogHeader>

        {isDetailLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Họ và tên</p>
                    <p className="font-medium">{tenantDetail?.fullName || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày sinh</p>
                    <p className="font-medium">
                      {tenantDetail?.dateOfBirth ? new Date(tenantDetail.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Số CCCD</p>
                    <p className="font-medium">{tenantDetail?.idCard || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium">{tenantDetail?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Quê quán</p>
                    <p className="font-medium">{tenantDetail?.hometown || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Current Contract */}
            {safeContracts.find(ct => ct.contract.status === 'ACTIVE') && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Hợp đồng hiện tại</h3>
                {(() => {
                  const activeContract = safeContracts.find(ct => ct.contract.status === 'ACTIVE')
                  
                  if (!activeContract) return null
                  
                  const statusBadge = getStatusBadge(activeContract.contract.status)
                  
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Phòng</p>
                            <p className="font-medium">
                              Phòng {activeContract.contract.room.number} - Tầng {activeContract.contract.room.floor}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                            <p className="font-medium">
                              {new Date(activeContract.contract.startDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Ngày kết thúc</p>
                            <p className="font-medium">
                              {new Date(activeContract.contract.endDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Tiền cọc</p>
                            <p className="font-medium">
                              {formatCurrency(activeContract.contract.deposit)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Giá thuê</p>
                            <p className="font-medium">
                              {formatCurrency(activeContract.contract.room.basePrice || 0)}/tháng
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Recent Bills */}
                      {activeContract.contract.bills && activeContract.contract.bills.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Hóa đơn gần đây</h4>
                          <div className="space-y-2">
                            {activeContract.contract.bills.slice(0, 3).map((bill) => {
                              const billStatusBadge = getBillStatusBadge(bill.status)
                              return (
                                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <p className="font-medium">
                                      Tháng {bill.month}/{bill.year}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {formatCurrency(bill.totalAmount)}
                                    </p>
                                  </div>
                                  <Badge variant={billStatusBadge.variant}>
                                    {billStatusBadge.label}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </Card>
            )}

            {/* Rental History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lịch sử thuê phòng</h3>
              
              {isHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((contractTenant) => {
                    const contract = contractTenant.contract
                    const statusBadge = getStatusBadge(contract.status)
                    
                    return (
                      <div key={contract.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              Phòng {contract.room.number}
                            </span>
                            {contractTenant.isPrimary && (
                              <Badge variant="outline" className="text-xs">
                                Khách chính
                              </Badge>
                            )}
                          </div>
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Thời gian thuê</p>
                            <p className="font-medium">
                              {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {' '}
                              {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tiền cọc</p>
                            <p className="font-medium">
                              {formatCurrency(contract.deposit)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* History Pagination */}
                  {historyPagination && historyPagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!historyPagination.hasPrev}
                        onClick={() => setHistoryPage(historyPagination.page - 1)}
                      >
                        Trước
                      </Button>
                      
                      <span className="text-sm text-gray-600">
                        Trang {historyPagination.page} / {historyPagination.totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!historyPagination.hasNext}
                        onClick={() => setHistoryPage(historyPagination.page + 1)}
                      >
                        Sau
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lịch sử thuê phòng
                </div>
              )}
            </Card>

            {/* Residency Records */}
            <Card className="p-6">
              <ResidencyRecordList
                tenantId={tenantDetail?.id || tenant?.id || ''}
                tenantName={tenantDetail?.fullName || tenant?.fullName || 'N/A'}
                showCreateButton={true}
              />
            </Card>

            {/* Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {safeCount.contracts}
                  </p>
                  <p className="text-sm text-gray-600">Tổng hợp đồng</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {safeContracts.filter(ct => ct.contract.status === 'ACTIVE').length}
                  </p>
                  <p className="text-sm text-gray-600">Đang thuê</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">
                    {safeContracts.filter(ct => ct.contract.status === 'EXPIRED').length}
                  </p>
                  <p className="text-sm text-gray-600">Đã hết hạn</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {safeContracts.filter(ct => ct.contract.status === 'TERMINATED').length}
                  </p>
                  <p className="text-sm text-gray-600">Đã kết thúc</p>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {safeCount.residencyRecords}
                  </p>
                  <p className="text-sm text-gray-600">Bản ghi tạm trú/vắng</p>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-6 border-t">
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                onEdit(tenant)
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                onDelete(tenant)
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}