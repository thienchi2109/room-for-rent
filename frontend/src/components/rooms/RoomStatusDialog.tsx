'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RoomStatusBadge } from './RoomStatusBadge'
import RoomService from '@/services/roomService'
import type { Room, RoomStatus } from '@/types/room'

interface RoomStatusDialogProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (roomId: string, newStatus: RoomStatus) => void
  isLoading?: boolean
}

export function RoomStatusDialog({
  room,
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: RoomStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus>('AVAILABLE')

  const statusOptions = RoomService.getRoomStatusOptions()

  const handleConfirm = () => {
    if (room && selectedStatus !== room.status) {
      onConfirm(room.id, selectedStatus)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open && room) {
      setSelectedStatus(room.status)
    }
    onOpenChange(open)
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle>Thay đổi trạng thái phòng</DialogTitle>
          <DialogDescription>
            Thay đổi trạng thái cho phòng {room.number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Trạng thái hiện tại:</Label>
            <div>
              <RoomStatusBadge status={room.status} />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Chọn trạng thái mới:</Label>
            <div className="grid grid-cols-1 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedStatus(option.value)}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    selectedStatus === option.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${option.color}`}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {option.value === 'AVAILABLE' && 'Phòng sẵn sàng cho thuê'}
                        {option.value === 'OCCUPIED' && 'Phòng đã có người thuê'}
                        {option.value === 'MAINTENANCE' && 'Phòng đang bảo trì, sửa chữa'}
                        {option.value === 'RESERVED' && 'Phòng đã được đặt trước'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedStatus !== room.status && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">Xác nhận thay đổi</p>
                  <p className="text-yellow-700 mt-1">
                    Trạng thái sẽ thay đổi từ{' '}
                    <span className="font-medium">
                      {RoomService.getRoomStatusLabel(room.status)}
                    </span>{' '}
                    thành{' '}
                    <span className="font-medium">
                      {RoomService.getRoomStatusLabel(selectedStatus)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedStatus === room.status}
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
