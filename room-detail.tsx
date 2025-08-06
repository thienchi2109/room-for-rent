'use client'

// ## Dialog Chi Tiết Phòng - Redesigned ##
//
// Dependencies:
// 1. React
// 2. shadcn/ui (Dialog, Button, Badge)
// 3. lucide-react (cho icons): `npm install lucide-react`
//
// Cách sử dụng:
// Component này được thiết kế để thay thế cho `RoomDetailsDialog` hiện tại.
// Bạn chỉ cần thay thế nội dung component cũ bằng component này và đảm bảo
// các props được truyền vào đúng cách.

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog' // Giả định đường dẫn đến component của bạn
import { Badge } from '@/components/ui/badge' // Giả định đường dẫn đến component của bạn
import { Button } from '@/components/ui/button' // Giả định đường dẫn đến component của bạn
import { formatCurrency } from '@/lib/utils' // Giả định đường dẫn đến helper của bạn
import type { Room } from '@/types/room' // Giả định đường dẫn đến type của bạn

import {
  Building,
  MapPin,
  Ruler,
  Users,
  DollarSign,
  Calendar,
  Pencil,
  Trash2,
  Settings,
  UserPlus,
  FileText,
  Receipt,
  X,
  Info,
} from 'lucide-react'

// --- Mock Data ---
// Dữ liệu mẫu để component có thể hiển thị độc lập.
// Trong thực tế, bạn sẽ truyền dữ liệu này qua props.
const mockRoomData = {
  id: 'room-101',
  number: '310',
  floor: 3,
  area: 25,
  capacity: 2,
  basePrice: 3500000,
  status: 'OCCUPIED', // AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date(),
  _count: {
    contracts: 1,
    bills: 2,
  },
}

// --- Helper Components ---

// Component hiển thị một mục thông tin
const InfoItem = ({ icon, label, value, valueClassName = '' }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 flex-shrink-0">
      {React.createElement(icon, { className: 'w-4 h-4 text-slate-500' })}
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-base font-medium text-slate-800 ${valueClassName}`}>
        {value}
      </p>
    </div>
  </div>
)

// Component hiển thị thẻ thống kê
const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            iconBg: 'bg-blue-100'
        },
        yellow: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-600',
            iconBg: 'bg-yellow-100'
        }
    }
    const classes = colorClasses[color] || colorClasses.blue

    return (
        <div className={`flex items-center p-4 rounded-xl ${classes.bg}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${classes.iconBg}`}>
                {React.createElement(icon, { className: `w-5 h-5 ${classes.text}` })}
            </div>
            <div>
                <div className={`text-2xl font-bold ${classes.text}`}>{value}</div>
                <div className="text-sm text-slate-600">{label}</div>
            </div>
        </div>
    )
}

// Component hiển thị trạng thái phòng
const RoomStatusBadge = ({ status }) => {
  const statusConfig = {
    AVAILABLE: { label: 'Phòng trống', className: 'bg-green-100 text-green-800 border-green-200' },
    OCCUPIED: { label: 'Đã có khách', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    MAINTENANCE: { label: 'Đang sửa chữa', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    RESERVED: { label: 'Đã đặt trước', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  }
  const config = statusConfig[status] || { label: 'Không xác định', className: 'bg-slate-100 text-slate-800' }

  return (
    <Badge variant="outline" className={`text-sm font-medium px-3 py-1 ${config.className}`}>
      {config.label}
    </Badge>
  )
}


// --- Main Component ---

export function RoomDetailsDialog({
  room = mockRoomData,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
  onAddTenant,
}) {
  if (!room) return null

  const activeContracts = room._count?.contracts || 0
  const canDelete = room.status !== 'OCCUPIED' && activeContracts === 0

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-50 p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex justify-between items-start">
            <div>
                <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <span>Phòng {room.number}</span>
                </DialogTitle>
                <div className="mt-3">
                    <RoomStatusBadge status={room.status} />
                </div>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl border border-slate-200/80">
            <InfoItem icon={MapPin} label="Tầng" value={room.floor} />
            <InfoItem icon={Ruler} label="Diện tích" value={`${room.area} m²`} />
            <InfoItem icon={Users} label="Sức chứa" value={`${room.capacity} người`} />
          </div>
          
          <div className="p-6 bg-white rounded-xl border border-slate-200/80">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Chi tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem 
                    icon={DollarSign} 
                    label="Giá thuê" 
                    value={`${formatCurrency(room.basePrice)}/tháng`}
                    valueClassName="!text-xl !font-bold text-green-600"
                />
                <div /> {/* Empty div for grid alignment */}
                <InfoItem icon={Calendar} label="Ngày tạo" value={formatDate(room.createdAt)} />
                <InfoItem icon={Calendar} label="Cập nhật lần cuối" value={formatDate(room.updatedAt)} />
            </div>
          </div>


          {/* Stats */}
          {((room._count?.contracts ?? 0) > 0 || (room._count?.bills ?? 0) > 0) && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Thống kê</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard icon={FileText} label="Hợp đồng đang hoạt động" value={room._count.contracts} color="blue" />
                <StatCard icon={Receipt} label="Hóa đơn chưa thanh toán" value={room._count.bills} color="yellow" />
              </div>
            </div>
          )}
          
          {/* Status Description */}
          <div className="flex items-start gap-3 bg-slate-100 p-4 rounded-lg">
            <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-600">
                {room.status === 'AVAILABLE' && 'Phòng sẵn sàng cho thuê, có thể tạo hợp đồng và thêm khách thuê ngay.'}
                {room.status === 'OCCUPIED' && 'Phòng đã có người thuê, đang trong quá trình sử dụng.'}
                {room.status === 'MAINTENANCE' && 'Phòng đang được bảo trì, sửa chữa. Tạm thời không thể cho thuê.'}
                {room.status === 'RESERVED' && 'Phòng đã được đặt trước, đang chờ khách check-in.'}
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 bg-white border-t border-slate-200/80 sticky bottom-0">
          <div className="flex justify-between items-center w-full flex-wrap gap-2">
            {/* Left-aligned button */}
            {room.status === 'AVAILABLE' && onAddTenant && (
              <Button onClick={() => onAddTenant(room)} className="bg-green-600 hover:bg-green-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm khách thuê
              </Button>
            )}
            <div className="flex-grow"></div> {/* Spacer */}

            {/* Right-aligned buttons */}
            <div className="flex gap-2 flex-wrap justify-end">
              <Button variant="outline" onClick={() => onStatusChange(room)}>
                <Settings className="w-4 h-4 mr-2" />
                Đổi trạng thái
              </Button>
              <Button variant="outline" onClick={() => onEdit(room)}>
                <Pencil className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(room)}
                disabled={!canDelete}
                title={!canDelete ? 'Không thể xóa phòng đang có khách hoặc có hợp đồng' : 'Xóa phòng'}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa phòng
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
