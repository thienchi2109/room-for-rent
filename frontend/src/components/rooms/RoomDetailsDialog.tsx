'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RoomStatusBadge } from './RoomStatusBadge'
import { formatCurrency } from '@/lib/utils'
import type { Room } from '@/types/room'
import { Building, MapPin, Ruler, Calendar, DollarSign } from 'lucide-react'
import { PencilIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

interface RoomDetailsDialogProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (room: Room) => void
  onDelete: (room: Room) => void
  onStatusChange: (room: Room) => void
}

export function RoomDetailsDialog({
  room,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onStatusChange
}: RoomDetailsDialogProps) {
  if (!room) return null

  const activeContracts = room._count?.contracts || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3">
            <Building className="w-5 h-5 text-blue-600" />
            Chi tiết phòng {room.number}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về phòng {room.number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Số phòng</p>
                  <p className="text-lg font-bold text-blue-600">{room.number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tầng</p>
                  <p className="text-base text-gray-700">Tầng {room.floor}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Ruler className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Diện tích</p>
                  <p className="text-base text-gray-700">{room.area} m²</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Loại phòng</p>
                  <Badge variant="secondary" className="mt-1">
                    {room.type}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Giá thuê</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(room.basePrice)}/tháng
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-current" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Trạng thái</p>
                  <div className="mt-1">
                    <RoomStatusBadge status={room.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Mô tả trạng thái</h4>
            <p className="text-sm text-gray-600">
              {room.status === 'AVAILABLE' && 'Phòng sẵn sàng cho thuê, có thể checkin ngay.'}
              {room.status === 'OCCUPIED' && 'Phòng đã có người thuê, đang trong quá trình sử dụng.'}
              {room.status === 'MAINTENANCE' && 'Phòng đang được bảo trì, sửa chữa. Tạm thời không thể cho thuê.'}
              {room.status === 'RESERVED' && 'Phòng đã được đặt trước, chờ khách checkin.'}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Thông tin thời gian</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ngày tạo</p>
                  <p className="text-sm text-gray-600">
                    {new Date(room.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cập nhật lần cuối</p>
                  <p className="text-sm text-gray-600">
                    {new Date(room.updatedAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          {((room._count?.contracts ?? 0) > 0 || (room._count?.bills ?? 0) > 0) && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Thống kê</h4>
              <div className="grid grid-cols-2 gap-4">
                {(room._count?.contracts ?? 0) > 0 && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {room._count?.contracts ?? 0}
                    </div>
                    <div className="text-sm text-gray-600">Hợp đồng đang hoạt động</div>
                  </div>
                )}
                {(room._count?.bills ?? 0) > 0 && (
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {room._count?.bills ?? 0}
                    </div>
                    <div className="text-sm text-gray-600">Hóa đơn chưa thanh toán</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="pt-4 border-t">
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onStatusChange(room)}
            >
              <Cog6ToothIcon className="w-4 h-4 mr-2" />
              Đổi trạng thái
            </Button>
            <Button
              variant="outline"
              onClick={() => onEdit(room)}
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(room)}
              disabled={room.status === 'OCCUPIED' || activeContracts > 0}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Xóa phòng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
