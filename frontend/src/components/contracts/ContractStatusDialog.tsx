'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContractStatusBadge } from './ContractStatusBadge'
import { useUpdateContractStatus, useCheckInContract, useCheckOutContract } from '@/hooks/useContracts'
import { ContractService } from '@/services/contractService'
import { ContractWithDetails, ContractStatus } from '@/types/contract'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building,
  Users,
  CreditCard,
  FileText
} from 'lucide-react'

interface ContractStatusDialogProps {
  contract: ContractWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractStatusDialog({ 
  contract, 
  open, 
  onOpenChange 
}: ContractStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | null>(null)
  const [reason, setReason] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const updateStatus = useUpdateContractStatus()
  const checkIn = useCheckInContract()
  const checkOut = useCheckOutContract()

  if (!contract) return null

  const statusOptions = ContractService.getContractStatusOptions()
  const currentStatus = contract.status
  const isExpired = ContractService.isExpired(contract.endDate)
  const isExpiringSoon = ContractService.isExpiringSoon(contract.endDate)

  const handleStatusSelect = (status: ContractStatus) => {
    setSelectedStatus(status)
    setShowConfirmation(true)
  }

  const handleConfirm = async () => {
    if (!selectedStatus) return

    try {
      if (selectedStatus === 'ACTIVE' && currentStatus !== 'ACTIVE') {
        // Check-in process
        await checkIn.mutateAsync(contract.id)
      } else if (selectedStatus === 'TERMINATED' && currentStatus === 'ACTIVE') {
        // Check-out process
        await checkOut.mutateAsync({ id: contract.id, data: { reason } })
      } else {
        // Regular status update
        await updateStatus.mutateAsync({ 
          id: contract.id, 
          data: { status: selectedStatus, reason } 
        })
      }
      
      onOpenChange(false)
      setShowConfirmation(false)
      setSelectedStatus(null)
      setReason('')
    } catch (error) {
      console.error('Status update error:', error)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setSelectedStatus(null)
    setReason('')
  }

  const getStatusChangeDescription = (newStatus: ContractStatus) => {
    switch (newStatus) {
      case 'ACTIVE':
        return currentStatus === 'TERMINATED' 
          ? 'Kích hoạt lại hợp đồng và cập nhật trạng thái phòng thành "Đã thuê"'
          : 'Kích hoạt hợp đồng và cập nhật trạng thái phòng thành "Đã thuê"'
      case 'EXPIRED':
        return 'Đánh dấu hợp đồng đã hết hạn. Phòng sẽ được chuyển về trạng thái "Có sẵn"'
      case 'TERMINATED':
        return 'Kết thúc hợp đồng trước hạn. Phòng sẽ được chuyển về trạng thái "Có sẵn" và tính toán hóa đơn cuối kỳ'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: ContractStatus) => {
    switch (status) {
      case 'ACTIVE':
        return CheckCircle
      case 'EXPIRED':
        return Clock
      case 'TERMINATED':
        return XCircle
      default:
        return FileText
    }
  }

  const isLoading = updateStatus.isPending || checkIn.isPending || checkOut.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            Thay đổi trạng thái hợp đồng {contract.contractNumber}
          </DialogTitle>
        </DialogHeader>

        {!showConfirmation ? (
          <div className="space-y-6">
            {/* Current Status */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Trạng thái hiện tại</h3>
                  <ContractStatusBadge 
                    status={currentStatus}
                    endDate={contract.endDate}
                  />
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>Phòng {contract.room.number}</div>
                  <div>{contract.tenants.length} khách thuê</div>
                </div>
              </div>
            </Card>

            {/* Status Warnings */}
            {currentStatus === 'ACTIVE' && isExpired && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-800">Hợp đồng đã quá hạn</h4>
                    <p className="text-red-700 text-sm">
                      Hợp đồng đã quá hạn {Math.abs(ContractService.getRemainingDays(contract.endDate))} ngày. 
                      Nên chuyển sang trạng thái &ldquo;Hết hạn&rdquo; hoặc &ldquo;Đã kết thúc&rdquo;.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStatus === 'ACTIVE' && isExpiringSoon && !isExpired && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Hợp đồng sắp hết hạn</h4>
                    <p className="text-yellow-700 text-sm">
                      Hợp đồng sẽ hết hạn trong {ContractService.getRemainingDays(contract.endDate)} ngày.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Options */}
            <div className="space-y-4">
              <h3 className="font-semibold">Chọn trạng thái mới</h3>
              <div className="grid grid-cols-1 gap-3">
                {statusOptions.map((option) => {
                  const Icon = getStatusIcon(option.value)
                  const isCurrentStatus = option.value === currentStatus
                  const isDisabled = isCurrentStatus

                  return (
                    <Card 
                      key={option.value}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => !isDisabled && handleStatusSelect(option.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.bgColor}`}>
                            <Icon className={`w-5 h-5 ${option.textColor}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{option.label}</h4>
                            <p className="text-sm text-gray-600">
                              {getStatusChangeDescription(option.value)}
                            </p>
                          </div>
                        </div>
                        {isCurrentStatus && (
                          <Badge variant="outline">Hiện tại</Badge>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Xác nhận thay đổi trạng thái</h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn thay đổi trạng thái hợp đồng?
              </p>
            </div>

            {/* Change Summary */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Từ:</span>
                  <ContractStatusBadge status={currentStatus} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Thành:</span>
                  {selectedStatus && <ContractStatusBadge status={selectedStatus} size="sm" />}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    {selectedStatus && getStatusChangeDescription(selectedStatus)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Contract Info */}
            <Card className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span>Phòng {contract.room.number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{contract.tenants.length} khách thuê</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span>Cọc: {contract.deposit.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span>{contract.contractNumber}</span>
                </div>
              </div>
            </Card>

            {/* Reason Input */}
            {(selectedStatus === 'TERMINATED' || selectedStatus === 'EXPIRED') && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Lý do {selectedStatus === 'TERMINATED' ? 'kết thúc' : 'hết hạn'} (tùy chọn)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Nhập lý do..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Xác nhận thay đổi
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
