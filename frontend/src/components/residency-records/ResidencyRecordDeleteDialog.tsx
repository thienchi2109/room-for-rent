'use client'

import { AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useDeleteResidencyRecord } from '@/hooks/useResidencyRecords'
import {
  ResidencyRecordWithTenant,
  getResidencyTypeLabel,
  formatResidencyDuration
} from '@/types/residencyRecord'

interface ResidencyRecordDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: ResidencyRecordWithTenant
}

export function ResidencyRecordDeleteDialog({
  open,
  onOpenChange,
  record
}: ResidencyRecordDeleteDialogProps) {
  const deleteMutation = useDeleteResidencyRecord()

  const handleDelete = async () => {
    if (!record) return

    try {
      await deleteMutation.mutateAsync(record.id)
      onOpenChange(false)
    } catch {
      // Error handling is done in the mutation hook
    }
  }

  if (!record) return null

  const isLoading = deleteMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Xác nhận xóa bản ghi
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa bản ghi tạm trú/tạm vắng này không? 
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        {/* Record Details */}
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Tenant */}
            <div>
              <span className="text-sm font-medium text-gray-700">Khách thuê:</span>
              <div className="text-sm text-gray-900">{record.tenant.fullName}</div>
            </div>

            {/* Type */}
            <div>
              <span className="text-sm font-medium text-gray-700">Loại:</span>
              <div className="mt-1">
                <Badge variant="outline">
                  {getResidencyTypeLabel(record.type)}
                </Badge>
              </div>
            </div>

            {/* Duration */}
            <div>
              <span className="text-sm font-medium text-gray-700">Thời gian:</span>
              <div className="text-sm text-gray-900">
                {formatResidencyDuration(record)}
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div>
                <span className="text-sm font-medium text-gray-700">Ghi chú:</span>
                <div className="text-sm text-gray-900">{record.notes}</div>
              </div>
            )}

            {/* Created date */}
            <div>
              <span className="text-sm font-medium text-gray-700">Ngày tạo:</span>
              <div className="text-sm text-gray-900">
                {format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <strong>Cảnh báo:</strong> Việc xóa bản ghi này sẽ không thể hoàn tác. 
                Tất cả thông tin liên quan đến bản ghi tạm trú/tạm vắng này sẽ bị mất vĩnh viễn.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xóa...' : 'Xóa bản ghi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
