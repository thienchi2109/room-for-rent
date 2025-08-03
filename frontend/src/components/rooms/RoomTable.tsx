'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { RoomStatusBadge } from './RoomStatusBadge'
import type { Room } from '@/types/room'
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  Cog6ToothIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'

interface RoomTableProps {
  rooms: Room[]
  onView?: (room: Room) => void
  onEdit?: (room: Room) => void
  onDelete?: (room: Room) => void
  onStatusChange?: (room: Room) => void
  onAddTenant?: (room: Room) => void
}

export function RoomTable({ 
  rooms, 
  onView,
  onEdit, 
  onDelete, 
  onStatusChange,
  onAddTenant 
}: RoomTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Số phòng</TableHead>
            <TableHead>Tầng</TableHead>
            <TableHead>Loại phòng</TableHead>
            <TableHead>Diện tích</TableHead>
            <TableHead>Giá cơ bản</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[120px]">HĐ hiện tại</TableHead>
            <TableHead className="w-[120px]">Bill chưa TT</TableHead>
            <TableHead className="text-right w-[200px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Không có phòng nào.
              </TableCell>
            </TableRow>
          ) : (
            rooms.map((room) => {
              const activeContracts = room._count?.contracts || 0
              const unpaidBills = room._count?.bills || 0

              return (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">
                    {room.number}
                  </TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.type}</TableCell>
                  <TableCell>{room.area}m²</TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {formatCurrency(room.basePrice)}
                  </TableCell>
                  <TableCell>
                    <RoomStatusBadge status={room.status} />
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${activeContracts > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {activeContracts}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${unpaidBills > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {unpaidBills}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView?.(room)}
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {room.status === 'AVAILABLE' && onAddTenant && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddTenant(room)}
                          title="Thêm khách thuê"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStatusChange?.(room)}
                        title="Đổi trạng thái"
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(room)}
                        title="Sửa phòng"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(room)}
                        disabled={room.status === 'OCCUPIED' || activeContracts > 0}
                        title={activeContracts > 0 ? 'Không thể xóa phòng có hợp đồng' : 'Xóa phòng'}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
