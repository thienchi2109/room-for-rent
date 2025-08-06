'use client'

import { Room } from '../../types/room'
import { RoomStatusBadge } from './RoomStatusBadge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import {
  Building,
  Ruler,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  Settings,
  Edit,
  Trash2,
  UserPlus,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface RoomDetailProps {
  room: Room
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (room: Room) => void
  onDelete?: (room: Room) => void
  onStatusChange?: (room: Room) => void
  onAddTenant?: (room: Room) => void
}

export function RoomDetail({ 
  room, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onAddTenant 
}: RoomDetailProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Get status description
  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Phòng sẵn sàng cho thuê, có thể checkin ngay.'
      case 'OCCUPIED':
        return 'Phòng đã có người thuê, đang trong quá trình sử dụng.'
      case 'MAINTENANCE':
        return 'Phòng đang được bảo trì, sửa chữa. Tạm thời không thể cho thuê.'
      case 'RESERVED':
        return 'Phòng đã được đặt trước, chờ khách checkin.'
      default:
        return 'Trạng thái không xác định.'
    }
  }

  const activeContracts = room._count?.contracts || 0
  const totalBills = room._count?.bills || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building className="w-6 h-6 text-blue-600" />
            Chi tiết Phòng {room.number}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Room Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Thông tin Cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Số phòng</p>
                    <p className="font-semibold text-2xl text-blue-600">{room.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tầng</p>
                    <p className="font-semibold text-lg">Tầng {room.floor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Diện tích</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {room.area} m²
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sức chứa</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {room.capacity} người
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-600">Giá thuê</p>
                  <p className="font-bold text-xl text-green-600 flex items-center gap-1">
                    <DollarSign className="w-5 h-5" />
                    {formatCurrency(room.basePrice)}/tháng
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Trạng thái Phòng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trạng thái hiện tại</span>
                  <RoomStatusBadge status={room.status} />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    {getStatusDescription(room.status)}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {onStatusChange && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(room)}
                      className="flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Đổi trạng thái
                    </Button>
                  )}
                  
                  {room.status === 'AVAILABLE' && onAddTenant && (
                    <Button
                      size="sm"
                      onClick={() => onAddTenant(room)}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Thêm khách thuê
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Timeline & Stats */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Thông tin Thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(room.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(room.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {activeContracts}
                    </div>
                    <div className="text-sm text-gray-600">Hợp đồng hoạt động</div>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {totalBills}
                    </div>
                    <div className="text-sm text-gray-600">Tổng hóa đơn</div>
                  </div>
                </div>

                {activeContracts > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-medium">
                      Phòng đang có {activeContracts} hợp đồng hoạt động
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Thao tác
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {onEdit && (
                    <Button
                      variant="outline"
                      onClick={() => onEdit(room)}
                      className="justify-start"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa thông tin
                    </Button>
                  )}
                  
                  {onDelete && (
                    <Button
                      variant="destructive"
                      onClick={() => onDelete(room)}
                      disabled={room.status === 'OCCUPIED' || activeContracts > 0}
                      className="justify-start"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa phòng
                      {(room.status === 'OCCUPIED' || activeContracts > 0) && (
                        <span className="ml-2 text-xs">(Không thể xóa)</span>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
