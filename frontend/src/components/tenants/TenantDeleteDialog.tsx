'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useDeleteTenant } from '@/hooks/useTenants'
import { TenantWithContracts } from '@/types/tenant'

interface TenantDeleteDialogProps {
  tenant: TenantWithContracts
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TenantDeleteDialog({ 
  tenant, 
  open, 
  onOpenChange, 
  onSuccess 
}: TenantDeleteDialogProps) {
  const deleteMutation = useDeleteTenant()

  // Handle success
  useEffect(() => {
    if (deleteMutation.isSuccess) {
      onSuccess?.()
    }
  }, [deleteMutation.isSuccess, onSuccess])

  const handleDelete = () => {
    deleteMutation.mutate(tenant.id)
  }

  const hasActiveContracts = tenant.contracts.some(ct => ct.contract.status === 'ACTIVE')
  const canDelete = !hasActiveContracts

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Xác nhận xóa khách thuê
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Bạn có chắc chắn muốn xóa khách thuê <strong>{tenant.fullName}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Hành động này không thể hoàn tác.
            </p>
          </div>

          {/* Validation Messages */}
          {!canDelete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium">
                Không thể xóa khách thuê này
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                {hasActiveContracts && (
                  <li>• Khách thuê đang có hợp đồng hoạt động</li>
                )}
              </ul>
              <p className="text-sm text-yellow-600 mt-2">
                Vui lòng kết thúc tất cả hợp đồng trước khi xóa khách thuê.
              </p>
            </div>
          )}

          {/* Tenant Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Thông tin khách thuê:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Họ tên:</strong> {tenant.fullName}</p>
              <p><strong>CCCD:</strong> {tenant.idCard}</p>
              <p><strong>Số điện thoại:</strong> {tenant.phone}</p>
              <p><strong>Số hợp đồng:</strong> {tenant._count.contracts}</p>
            </div>
          </div>

          {deleteMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Có lỗi xảy ra: {deleteMutation.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending || !canDelete}
              className="flex-1"
            >
              {deleteMutation.isPending && <LoadingSpinner className="w-4 h-4 mr-2" />}
              Xóa khách thuê
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}