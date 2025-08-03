'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RoomCard } from '@/components/rooms/RoomCard'
import { RoomTable } from '@/components/rooms/RoomTable'
import { RoomForm } from '@/components/rooms/RoomForm'
import { RoomStatusDialog } from '@/components/rooms/RoomStatusDialog'
import { RoomDetailsDialog } from '@/components/rooms/RoomDetailsDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useRooms, useCreateRoom, useUpdateRoom, useUpdateRoomStatus, useDeleteRoom } from '@/hooks/useRooms'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { Room, RoomStatus, CreateRoomData, UpdateRoomData } from '@/types/room'
import { toast } from 'react-hot-toast'

export default function RoomsPage() {
  const [view, setView] = useState<'grid' | 'table' | 'floor'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL')
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [statusRoom, setStatusRoom] = useState<Room | null>(null)
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null)

  const { data: roomsResponse, isLoading, error } = useRooms()
  const createRoomMutation = useCreateRoom()
  const updateRoomMutation = useUpdateRoom()
  const updateStatusMutation = useUpdateRoomStatus()
  const deleteRoomMutation = useDeleteRoom()

  // Extract rooms array from response
  const rooms = Array.isArray(roomsResponse) ? roomsResponse : roomsResponse?.data || []

  // Get unique floors for filter
  const floors = Array.from(new Set(rooms.map((room: Room) => room.floor))).sort((a, b) => a - b)

  // Filter rooms based on search, status, and floor
  const filteredRooms = rooms.filter((room: Room) => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter
    const matchesFloor = floorFilter === 'ALL' || room.floor === floorFilter
    return matchesSearch && matchesStatus && matchesFloor
  })

  // Group rooms by floor for floor view
  const roomsByFloor = floors.reduce((acc, floor) => {
    acc[floor] = filteredRooms.filter((room: Room) => room.floor === floor)
    return acc
  }, {} as Record<number, Room[]>)

  const handleCreateRoom = async (data: CreateRoomData | UpdateRoomData) => {
    try {
      await createRoomMutation.mutateAsync(data as CreateRoomData)
      setShowCreateForm(false)
      toast.success('Tạo phòng thành công!')
    } catch (error) {
      toast.error('Không thể tạo phòng. Vui lòng thử lại.')
    }
  }

  const handleUpdateRoom = async (data: CreateRoomData | UpdateRoomData) => {
    if (!editingRoom) return
    
    try {
      await updateRoomMutation.mutateAsync({
        id: editingRoom.id,
        data
      })
      setEditingRoom(null)
      toast.success('Cập nhật phòng thành công!')
    } catch (error) {
      toast.error('Không thể cập nhật phòng. Vui lòng thử lại.')
    }
  }

  const handleUpdateStatus = async (roomId: string, newStatus: RoomStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: roomId,
        status: newStatus
      })
      setStatusRoom(null)
      toast.success('Cập nhật trạng thái thành công!')
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.')
    }
  }

  const handleDeleteRoom = async (room: Room) => {
    setDeletingRoom(room)
  }

  const confirmDeleteRoom = async () => {
    if (!deletingRoom) return
    
    try {
      await deleteRoomMutation.mutateAsync(deletingRoom.id)
      setDeletingRoom(null)
      toast.success('Xóa phòng thành công!')
    } catch (error) {
      toast.error('Không thể xóa phòng. Vui lòng thử lại.')
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu phòng</p>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QUẢN LÝ CÁC PHÒNG HIỆN CÓ</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin và trạng thái các phòng cho thuê
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm phòng mới
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo số phòng hoặc loại phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RoomStatus | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="AVAILABLE">Có sẵn</option>
            <option value="OCCUPIED">Đã cho thuê</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="RESERVED">Đã đặt trước</option>
          </select>

          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="ALL">Tất cả tầng</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>Tầng {floor}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            Lưới
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
          >
            Bảng
          </Button>
          <Button
            variant={view === 'floor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('floor')}
          >
            Sơ đồ tầng
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Không tìm thấy phòng phù hợp với bộ lọc'
              : 'Chưa có phòng nào được tạo'
            }
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm phòng đầu tiên
            </Button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onClick={() => setDetailsRoom(room)}
            />
          ))}
        </div>
      ) : view === 'table' ? (
        <RoomTable
          rooms={filteredRooms}
          onView={setDetailsRoom}
          onEdit={setEditingRoom}
          onDelete={setDeletingRoom}
          onStatusChange={setStatusRoom}
        />
      ) : (
        // Floor view
        <div className="space-y-8">
          {floors.map((floor) => {
            const floorRooms = roomsByFloor[floor] || []
            if (floorRooms.length === 0) return null
            
            return (
              <div key={floor} className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Tầng {floor} ({floorRooms.length} phòng)
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {floorRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`
                        aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 cursor-pointer
                        transition-all duration-200 hover:scale-105 hover:shadow-md
                        ${room.status === 'AVAILABLE' ? 'bg-green-50 border-green-200 hover:bg-green-100' :
                          room.status === 'OCCUPIED' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                          room.status === 'MAINTENANCE' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                          'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'}
                      `}
                      onClick={() => setDetailsRoom(room)}
                      title={`Phòng ${room.number} - ${room.status} - Click để xem chi tiết`}
                    >
                      <span className="text-xs font-semibold text-gray-900">
                        {room.number}
                      </span>
                      <div className={`
                        w-2 h-2 rounded-full mt-1
                        ${room.status === 'AVAILABLE' ? 'bg-green-500' :
                          room.status === 'OCCUPIED' ? 'bg-blue-500' :
                          room.status === 'MAINTENANCE' ? 'bg-red-500' :
                          'bg-yellow-500'}
                      `} />
                    </div>
                  ))}
                </div>
                
                {/* Floor legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-600">Có sẵn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-600">Đã cho thuê</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-gray-600">Bảo trì</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs text-gray-600">Đã đặt trước</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Room Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <RoomForm
              onSubmit={handleCreateRoom}
              onCancel={() => setShowCreateForm(false)}
              isLoading={createRoomMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Room Form */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <RoomForm
              room={editingRoom}
              onSubmit={handleUpdateRoom}
              onCancel={() => setEditingRoom(null)}
              isLoading={updateRoomMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Status Change Dialog */}
      <RoomStatusDialog
        room={statusRoom}
        open={!!statusRoom}
        onOpenChange={(open) => !open && setStatusRoom(null)}
        onConfirm={handleUpdateStatus}
        isLoading={updateStatusMutation.isPending}
      />

      {/* Room Details Dialog */}
      <RoomDetailsDialog
        room={detailsRoom}
        open={!!detailsRoom}
        onOpenChange={(open) => !open && setDetailsRoom(null)}
        onEdit={() => {
          setDetailsRoom(null)
          setEditingRoom(detailsRoom)
        }}
        onDelete={() => {
          setDetailsRoom(null)
          setDeletingRoom(detailsRoom)
        }}
        onStatusChange={() => {
          setDetailsRoom(null)
          setStatusRoom(detailsRoom)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingRoom}
        onOpenChange={(open) => !open && setDeletingRoom(null)}
        onConfirm={confirmDeleteRoom}
        title="Xóa phòng"
        description={
          deletingRoom
            ? `Bạn có chắc chắn muốn xóa phòng ${deletingRoom.number}? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmText="Xóa phòng"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deleteRoomMutation.isPending}
      />
    </div>
  )
}