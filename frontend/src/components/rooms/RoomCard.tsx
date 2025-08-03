'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RoomStatusBadge } from './RoomStatusBadge'
import type { Room } from '@/types/room'
import { MapPinIcon, UsersIcon, CurrencyDollarIcon, UserPlusIcon } from '@heroicons/react/24/outline'

interface RoomCardProps {
  room: Room
  onClick?: (room: Room) => void
  onAddTenant?: (room: Room) => void
}

export function RoomCard({ 
  room, 
  onClick,
  onAddTenant,
}: RoomCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const activeContracts = room._count?.contracts || 0
  const unpaidBills = room._count?.bills || 0

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(room)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-lg">Phòng {room.number}</h3>
          </div>
          <RoomStatusBadge status={room.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Tầng:</span>
            <p className="font-medium">{room.floor}</p>
          </div>
          <div>
            <span className="text-gray-600">Diện tích:</span>
            <p className="font-medium">{room.area}m²</p>
          </div>
          <div>
            <span className="text-gray-600">Sức chứa:</span>
            <p className="font-medium">{room.type}</p>
          </div>
          <div>
            <span className="text-gray-600">Đơn giá phòng:</span>
            <p className="font-medium text-green-600">
              {formatCurrency(room.basePrice)}
            </p>
          </div>
        </div>

        {/* Room Statistics */}
        <div className="flex items-center space-x-4 pt-2 border-t">
          <div className="flex items-center space-x-1 text-sm">
            <UsersIcon className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">HĐ:</span>
            <span className="font-medium">{activeContracts}</span>
          </div>
          {unpaidBills > 0 && (
            <div className="flex items-center space-x-1 text-sm">
              <CurrencyDollarIcon className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">Chưa thanh toán:</span>
              <span className="font-medium text-red-600">{unpaidBills}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Tenant Button for Available Rooms */}
      {room.status === 'AVAILABLE' && onAddTenant && (
        <CardFooter className="pt-0">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onAddTenant(room)
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Thêm khách thuê
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
