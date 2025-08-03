import apiClient from '@/lib/api'
import type { 
  Room, 
  CreateRoomData, 
  UpdateRoomData, 
  RoomFilters, 
  PaginationResponse, 
  ApiResponse,
  RoomStatus 
} from '@/types/room'

export class RoomService {
  private static readonly BASE_PATH = '/api/rooms'

  // Get all rooms with pagination and filtering
  static async getRooms(filters?: RoomFilters): Promise<PaginationResponse<Room>> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.floor) params.append('floor', filters.floor.toString())
    if (filters?.type) params.append('type', filters.type)
    if (filters?.search) params.append('search', filters.search)

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    return apiClient.get<PaginationResponse<Room>>(endpoint)
  }

  // Get a specific room by ID
  static async getRoomById(id: string): Promise<ApiResponse<Room>> {
    return apiClient.get<ApiResponse<Room>>(`${this.BASE_PATH}/${id}`)
  }

  // Create a new room
  static async createRoom(data: CreateRoomData): Promise<ApiResponse<Room>> {
    return apiClient.post<ApiResponse<Room>>(this.BASE_PATH, data)
  }

  // Update an existing room
  static async updateRoom(id: string, data: UpdateRoomData): Promise<ApiResponse<Room>> {
    return apiClient.put<ApiResponse<Room>>(`${this.BASE_PATH}/${id}`, data)
  }

  // Delete a room
  static async deleteRoom(id: string): Promise<ApiResponse<{ id: string; number: string }>> {
    return apiClient.delete<ApiResponse<{ id: string; number: string }>>(`${this.BASE_PATH}/${id}`)
  }

  // Update room status
  static async updateRoomStatus(id: string, status: RoomStatus): Promise<ApiResponse<Room>> {
    return apiClient.patch<ApiResponse<Room>>(`${this.BASE_PATH}/${id}/status`, { status })
  }

  // Get room status options
  static getRoomStatusOptions() {
    return [
      { value: 'AVAILABLE', label: 'Có sẵn', color: 'bg-green-500' },
      { value: 'OCCUPIED', label: 'Đã thuê', color: 'bg-blue-500' },
      { value: 'RESERVED', label: 'Đã đặt', color: 'bg-yellow-500' },
      { value: 'MAINTENANCE', label: 'Bảo trì', color: 'bg-red-500' }
    ] as const
  }

  // Get room status color
  static getRoomStatusColor(status: RoomStatus): string {
    const statusMap = {
      'AVAILABLE': 'bg-green-500',
      'OCCUPIED': 'bg-blue-500', 
      'RESERVED': 'bg-yellow-500',
      'MAINTENANCE': 'bg-red-500'
    }
    return statusMap[status] || 'bg-gray-500'
  }

  // Get room status label
  static getRoomStatusLabel(status: RoomStatus): string {
    const statusMap = {
      'AVAILABLE': 'Có sẵn',
      'OCCUPIED': 'Đã thuê',
      'RESERVED': 'Đã đặt', 
      'MAINTENANCE': 'Bảo trì'
    }
    return statusMap[status] || status
  }
}

export default RoomService
