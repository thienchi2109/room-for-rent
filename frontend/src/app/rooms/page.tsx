'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RoomCard } from '@/components/rooms/RoomCard'
import { RoomTable } from '@/components/rooms/RoomTable'
import { RoomForm } from '@/components/rooms/RoomForm'
import { RoomStatusDialog } from '@/components/rooms/RoomStatusDialog'
import { RoomDetailsDialog } from '@/components/rooms/RoomDetailsDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { TenantDialogFromRoom } from '@/components/tenants/TenantDialogFromRoom'
import { useRooms, useCreateRoom, useUpdateRoom, useUpdateRoomStatus, useDeleteRoom } from '@/hooks/useRooms'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { Room, RoomStatus, CreateRoomData, UpdateRoomData } from '@/types/room'
import { toast } from 'react-hot-toast'

export default function RoomsPage() {
  const [view, setView] = useState<'grid' | 'table' | 'floor'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL')
  const [floorFilter, setFloorFilter] = useState<number | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [statusRoom, setStatusRoom] = useState<Room | null>(null)
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null)
  const [addTenantRoom, setAddTenantRoom] = useState<Room | null>(null)

  const { data: roomsResponse, isLoading, error } = useRooms({ limit: 100 })
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

  // Pagination for table view
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRooms = view === 'table' ? filteredRooms.slice(startIndex, endIndex) : filteredRooms

  // Reset to first page when filters change
  const resetPagination = () => {
    setCurrentPage(1)
  }

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
    } catch {
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
    } catch {
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
    } catch {
      toast.error('Không thể cập nhật trạng thái. Vui lòng thử lại.')
    }
  }

  const handleAddTenant = (room: Room) => {
    setAddTenantRoom(room)
  }

  const confirmDeleteRoom = async () => {
    if (!deletingRoom) return
    
    try {
      await deleteRoomMutation.mutateAsync(deletingRoom.id)
      setDeletingRoom(null)
      toast.success('Xóa phòng thành công!')
    } catch {
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
          <h1 className="text-2xl font-bold text-gray-900">QUẢN LÝ CÁC PHÒNG HIỆN CÓ</h1>
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo số phòng hoặc loại phòng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                resetPagination()
              }}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value as RoomStatus | 'ALL')
            resetPagination()
          }}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="AVAILABLE">Có sẵn</SelectItem>
              <SelectItem value="OCCUPIED">Đã cho thuê</SelectItem>
              <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
              <SelectItem value="RESERVED">Đã đặt trước</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Floor Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={floorFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setFloorFilter('ALL')
              resetPagination()
            }}
          >
            Tất cả tầng
          </Button>
          {floors.map((floor) => (
            <Button
              key={floor}
              variant={floorFilter === floor ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFloorFilter(floor)
                resetPagination()
              }}
            >
              Tầng {floor}
            </Button>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
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
              onAddTenant={handleAddTenant}
            />
          ))}
        </div>
      ) : view === 'table' ? (
        <div className="space-y-4">
          <RoomTable
            rooms={paginatedRooms}
            onView={setDetailsRoom}
            onEdit={setEditingRoom}
            onDelete={setDeletingRoom}
            onStatusChange={setStatusRoom}
            onAddTenant={handleAddTenant}
          />

          {/* Pagination for Table View */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredRooms.length)} trong tổng số {filteredRooms.length} phòng
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Trước
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
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
                        aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 cursor-pointer relative group
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
                      
                      {/* Add Tenant Button for Available Rooms in Floor View */}
                      {room.status === 'AVAILABLE' && (
                        <div className="absolute inset-0 bg-green-600 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            size="sm"
                            className="text-xs px-2 py-1 h-auto bg-green-600 hover:bg-green-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddTenant(room)
                            }}
                          >
                            + Thuê
                          </Button>
                        </div>
                      )}
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
        onAddTenant={() => {
          setDetailsRoom(null)
          setAddTenantRoom(detailsRoom)
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

      {/* Add Tenant Dialog */}
      {addTenantRoom && (
        <TenantDialogFromRoom
          roomNumber={addTenantRoom.number}
          roomId={addTenantRoom.id}
          open={!!addTenantRoom}
          onOpenChange={(open) => !open && setAddTenantRoom(null)}
          onSuccess={() => {
            setAddTenantRoom(null)
            toast.success(`Đã thêm khách thuê cho phòng ${addTenantRoom.number}!`)
          }}
        />
      )}
    </div>
  )
}