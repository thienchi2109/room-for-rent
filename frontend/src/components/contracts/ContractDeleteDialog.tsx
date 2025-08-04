'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ContractStatusBadge } from './ContractStatusBadge'
import { useDeleteContract } from '@/hooks/useContracts'
import { ContractWithDetails } from '@/types/contract'
import { 
  AlertTriangle, 
  Building, 
  Users, 
  CreditCard, 
  FileText,
  Calendar,
  Receipt
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ContractDeleteDialogProps {
  contract: ContractWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractDeleteDialog({ 
  contract, 
  open, 
  onOpenChange 
}: ContractDeleteDialogProps) {
  const [reason, setReason] = useState('')
  const [confirmText, setConfirmText] = useState('')
  
  const deleteContract = useDeleteContract()

  if (!contract) return null

  const primaryTenant = contract.tenants.find(ct => ct.isPrimary)
  const hasActiveBills = contract.bills?.some(bill => bill.status === 'UNPAID' || bill.status === 'OVERDUE')
  const isActiveContract = contract.status === 'ACTIVE'
  const expectedConfirmText = contract.contractNumber

  const handleDelete = async () => {
    if (confirmText !== expectedConfirmText) {
      return
    }

    try {
      await deleteContract.mutateAsync(contract.id)
      onOpenChange(false)
      setReason('')
      setConfirmText('')
    } catch (error) {
      console.error('Delete contract error:', error)
    }
  }

  const canDelete = confirmText === expectedConfirmText
  const isLoading = deleteContract.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-red-600">
            Xóa hợp đồng {contract.contractNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-2">Cảnh báo: Hành động không thể hoàn tác</h4>
                <div className="text-red-700 text-sm space-y-1">
                  <p>• Hợp đồng sẽ bị xóa vĩnh viễn khỏi hệ thống</p>
                  <p>• Tất cả dữ liệu liên quan sẽ bị mất</p>
                  <p>• Trạng thái phòng sẽ được cập nhật về &ldquo;Có sẵn&rdquo;</p>
                  {hasActiveBills && (
                    <p className="font-medium">• Có hóa đơn chưa thanh toán sẽ bị xóa</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Information */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Thông tin hợp đồng sẽ bị xóa</h3>
            
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Số hợp đồng</div>
                      <div className="font-medium">{contract.contractNumber}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Phòng</div>
                      <div className="font-medium">{contract.room.number} (Tầng {contract.room.floor})</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Khách thuê chính</div>
                      <div className="font-medium">{primaryTenant?.tenant.fullName}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Thời hạn</div>
                      <div className="font-medium">
                        {format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: vi })} - {' '}
                        {format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-600">Tiền cọc</div>
                      <div className="font-medium">{contract.deposit.toLocaleString('vi-VN')} ₫</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4" />
                    <div>
                      <div className="text-sm text-gray-600">Trạng thái</div>
                      <ContractStatusBadge status={contract.status} size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bills Warning */}
              {contract.bills && contract.bills.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Hóa đơn liên quan ({contract.bills.length})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-600">
                        {contract.bills.filter(bill => bill.status === 'PAID').length}
                      </div>
                      <div className="text-gray-600">Đã thanh toán</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">
                        {contract.bills.filter(bill => bill.status === 'UNPAID').length}
                      </div>
                      <div className="text-gray-600">Chưa thanh toán</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-orange-600">
                        {contract.bills.filter(bill => bill.status === 'OVERDUE').length}
                      </div>
                      <div className="text-gray-600">Quá hạn</div>
                    </div>
                  </div>
                  {hasActiveBills && (
                    <div className="mt-2 text-sm text-red-600 font-medium">
                      ⚠️ Có hóa đơn chưa thanh toán sẽ bị xóa cùng hợp đồng
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Additional Warnings for Active Contracts */}
          {isActiveContract && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Hợp đồng đang hoạt động</h4>
                  <p className="text-yellow-700 text-sm">
                    Hợp đồng này đang ở trạng thái hoạt động. Bạn có thể muốn &ldquo;Kết thúc&rdquo; hợp đồng 
                    thay vì xóa để giữ lại lịch sử.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="deleteReason">Lý do xóa hợp đồng (tùy chọn)</Label>
            <Textarea
              id="deleteReason"
              placeholder="Nhập lý do xóa hợp đồng..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmText">
              Để xác nhận, hãy nhập số hợp đồng: <span className="font-mono font-bold">{expectedConfirmText}</span>
            </Label>
            <input
              id="confirmText"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={`Nhập "${expectedConfirmText}" để xác nhận`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            {confirmText && confirmText !== expectedConfirmText && (
              <p className="text-sm text-red-600">Số hợp đồng không khớp</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
              disabled={!canDelete || isLoading}
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Xóa hợp đồng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
