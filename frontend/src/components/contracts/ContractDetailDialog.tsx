'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContractStatusBadge } from './ContractStatusBadge'
import { ContractStatusDialog } from './ContractStatusDialog'
import { 
  Building, 
  Users, 
  Calendar, 
  FileText, 
  Phone, 
  MapPin, 
  Edit,
  Settings,
  Receipt,
  Clock,
  XCircle
} from 'lucide-react'
import { ContractWithDetails } from '@/types/contract'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ContractService } from '@/services/contractService'

interface ContractDetailDialogProps {
  contract: ContractWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (contract: ContractWithDetails) => void
}

export function ContractDetailDialog({ 
  contract, 
  open, 
  onOpenChange, 
  onEdit 
}: ContractDetailDialogProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

  if (!contract) return null

  const primaryTenant = contract.tenants.find(ct => ct.isPrimary)
  const otherTenants = contract.tenants.filter(ct => !ct.isPrimary)
  const remainingDays = ContractService.getRemainingDays(contract.endDate)
  const contractDuration = ContractService.getContractDuration(contract.startDate, contract.endDate)
  const isExpiringSoon = ContractService.isExpiringSoon(contract.endDate)
  const isExpired = ContractService.isExpired(contract.endDate)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                Chi tiết hợp đồng {contract.contractNumber}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <ContractStatusBadge 
                  status={contract.status}
                  endDate={contract.endDate}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStatusDialogOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Thay đổi trạng thái
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(contract)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 px-1">
            {/* Status Alert */}
            {contract.status === 'ACTIVE' && isExpiringSoon && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Hợp đồng sắp hết hạn</h4>
                    <p className="text-yellow-700 text-sm">
                      Hợp đồng sẽ hết hạn trong {remainingDays} ngày ({format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {contract.status === 'ACTIVE' && isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-800">Hợp đồng đã quá hạn</h4>
                    <p className="text-red-700 text-sm">
                      Hợp đồng đã quá hạn {Math.abs(remainingDays)} ngày kể từ {format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contract Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Thông tin hợp đồng
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số hợp đồng:</span>
                      <span className="font-medium">{contract.contractNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <ContractStatusBadge 
                        status={contract.status}
                        endDate={contract.endDate}
                        size="sm"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="font-medium">
                        {format(new Date(contract.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày bắt đầu:</span>
                      <span className="font-medium">
                        {format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày kết thúc:</span>
                      <span className="font-medium">
                        {format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời hạn:</span>
                      <span className="font-medium">{contractDuration} ngày</span>
                    </div>
                    {contract.status === 'ACTIVE' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Còn lại:</span>
                        <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                          {isExpired ? `Quá hạn ${Math.abs(remainingDays)} ngày` : `${remainingDays} ngày`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Tiền cọc:</span>
                      <span className="font-bold text-lg text-green-600">
                        {contract.deposit.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Room Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Thông tin phòng
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số phòng:</span>
                      <span className="font-medium text-lg">{contract.room.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tầng:</span>
                      <span className="font-medium">{contract.room.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diện tích:</span>
                      <span className="font-medium">{contract.room.area}m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sức chứa:</span>
                      <span className="font-medium">{contract.room.capacity} người</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái phòng:</span>
                      <Badge variant={contract.room.status === 'OCCUPIED' ? 'default' : 'secondary'}>
                        {contract.room.status === 'OCCUPIED' ? 'Đã thuê' : 
                         contract.room.status === 'AVAILABLE' ? 'Có sẵn' :
                         contract.room.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đã đặt'}
                      </Badge>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Giá thuê:</span>
                      <span className="font-bold text-lg text-blue-600">
                        {contract.room.basePrice.toLocaleString('vi-VN')} ₫/tháng
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Primary Tenant */}
                {primaryTenant && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Khách thuê chính
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{primaryTenant.tenant.fullName}</h4>
                          <Badge variant="default" className="text-xs">Khách chính</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">SĐT:</span>
                          <span className="font-medium">{primaryTenant.tenant.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">CCCD:</span>
                          <span className="font-medium">{primaryTenant.tenant.idCard}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Quê quán:</span>
                          <span className="font-medium">{primaryTenant.tenant.hometown}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Ngày sinh:</span>
                          <span className="font-medium">
                            {format(new Date(primaryTenant.tenant.dateOfBirth), 'dd/MM/yyyy', { locale: vi })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Other Tenants */}
                {otherTenants.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Khách thuê khác ({otherTenants.length})
                    </h3>
                    <div className="space-y-4">
                      {otherTenants.map((contractTenant) => (
                        <div key={contractTenant.tenantId} className="border-l-4 border-gray-300 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{contractTenant.tenant.fullName}</h4>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>SĐT: {contractTenant.tenant.phone}</div>
                            <div>CCCD: {contractTenant.tenant.idCard}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Bills Summary */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Hóa đơn
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng hóa đơn:</span>
                      <span className="font-medium">{contract._count?.bills || 0}</span>
                    </div>
                    {contract.bills && contract.bills.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Đã thanh toán:</span>
                          <span className="font-medium text-green-600">
                            {contract.bills.filter(bill => bill.status === 'PAID').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chưa thanh toán:</span>
                          <span className="font-medium text-red-600">
                            {contract.bills.filter(bill => bill.status === 'UNPAID').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quá hạn:</span>
                          <span className="font-medium text-orange-600">
                            {contract.bills.filter(bill => bill.status === 'OVERDUE').length}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="pt-2 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        <Receipt className="w-4 h-4 mr-2" />
                        Xem tất cả hóa đơn
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <ContractStatusDialog
        contract={contract}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      />
    </>
  )
}
