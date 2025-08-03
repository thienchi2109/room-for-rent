import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import RoomService from '@/services/roomService'
import type { 
  Room, 
  CreateRoomData, 
  UpdateRoomData, 
  RoomFilters,
  RoomStatus 
} from '@/types/room'

// Query keys factory
export const roomQueryKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomQueryKeys.all, 'list'] as const,
  list: (filters?: RoomFilters) => [...roomQueryKeys.lists(), filters] as const,
  details: () => [...roomQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomQueryKeys.details(), id] as const,
}

// Hook to get rooms with filters
export function useRooms(filters?: RoomFilters) {
  return useQuery({
    queryKey: roomQueryKeys.list(filters),
    queryFn: () => RoomService.getRooms(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get a specific room
export function useRoom(id: string, enabled = true) {
  return useQuery({
    queryKey: roomQueryKeys.detail(id),
    queryFn: () => RoomService.getRoomById(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to create a room
export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoomData) => RoomService.createRoom(data),
    onSuccess: (response) => {
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: roomQueryKeys.lists() })
      
      toast.success(`Phòng ${response.data.number} đã được tạo thành công!`)
    },
    onError: (error: Error) => {
      toast.error(`Lỗi tạo phòng: ${error.message}`)
    },
  })
}

// Hook to update a room
export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomData }) => 
      RoomService.updateRoom(id, data),
    onSuccess: (response, variables) => {
      // Update specific room in cache
      queryClient.setQueryData(
        roomQueryKeys.detail(variables.id),
        response
      )
      
      // Invalidate rooms list to reflect changes
      queryClient.invalidateQueries({ queryKey: roomQueryKeys.lists() })
      
      toast.success(`Phòng ${response.data.number} đã được cập nhật!`)
    },
    onError: (error: Error) => {
      toast.error(`Lỗi cập nhật phòng: ${error.message}`)
    },
  })
}

// Hook to delete a room
export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => RoomService.deleteRoom(id),
    onSuccess: (response) => {
      // Remove room from cache
      queryClient.removeQueries({ queryKey: roomQueryKeys.detail(response.data.id) })
      
      // Invalidate rooms list
      queryClient.invalidateQueries({ queryKey: roomQueryKeys.lists() })
      
      toast.success(`Phòng ${response.data.number} đã được xóa!`)
    },
    onError: (error: Error) => {
      toast.error(`Lỗi xóa phòng: ${error.message}`)
    },
  })
}

// Hook to update room status
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RoomStatus }) => 
      RoomService.updateRoomStatus(id, status),
    onSuccess: (response, variables) => {
      // Update specific room in cache
      queryClient.setQueryData(
        roomQueryKeys.detail(variables.id),
        response
      )
      
      // Optimistically update rooms list
      queryClient.setQueriesData(
        { queryKey: roomQueryKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData
          
          return {
            ...oldData,
            data: oldData.data.map((room: Room) =>
              room.id === variables.id
                ? { ...room, status: variables.status }
                : room
            ),
          }
        }
      )
      
      const statusLabel = RoomService.getRoomStatusLabel(variables.status)
      toast.success(`Trạng thái phòng ${response.data.number} đã đổi thành "${statusLabel}"`)
    },
    onError: (error: Error) => {
      toast.error(`Lỗi cập nhật trạng thái: ${error.message}`)
    },
  })
}
