// Contract service for API calls

import apiClient from '@/lib/api'
import type { 
  ContractFormData,
  ContractFilters,
  ContractListResponse,
  ContractDetailResponse,
  ContractCreateResponse,
  ContractUpdateResponse,
  ContractDeleteResponse,
  ContractStatus,
  ContractStatusUpdateData,
  AvailableRoom,
  TenantForContract,
  ContractStats,
  Room
} from '@/types/contract'

export class ContractService {
  private static readonly BASE_PATH = '/api/contracts'

  // Get all contracts with pagination and filtering
  static async getAll(filters?: ContractFilters): Promise<ContractListResponse> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.roomId) params.append('roomId', filters.roomId)
    if (filters?.tenantId) params.append('tenantId', filters.tenantId)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    if (filters?.startDateFrom) params.append('startDateFrom', filters.startDateFrom)
    if (filters?.startDateTo) params.append('startDateTo', filters.startDateTo)
    if (filters?.endDateFrom) params.append('endDateFrom', filters.endDateFrom)
    if (filters?.endDateTo) params.append('endDateTo', filters.endDateTo)

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    return apiClient.get<ContractListResponse>(endpoint)
  }

  // Get a specific contract by ID
  static async getById(id: string): Promise<ContractDetailResponse> {
    return apiClient.get<ContractDetailResponse>(`${this.BASE_PATH}/${id}`)
  }

  // Create a new contract
  static async create(data: ContractFormData): Promise<ContractCreateResponse> {
    return apiClient.post<ContractCreateResponse>(this.BASE_PATH, data)
  }

  // Update an existing contract
  static async update(id: string, data: Partial<ContractFormData>): Promise<ContractUpdateResponse> {
    return apiClient.put<ContractUpdateResponse>(`${this.BASE_PATH}/${id}`, data)
  }

  // Delete a contract
  static async delete(id: string): Promise<ContractDeleteResponse> {
    return apiClient.delete<ContractDeleteResponse>(`${this.BASE_PATH}/${id}`)
  }

  // Update contract status
  static async updateStatus(id: string, data: ContractStatusUpdateData): Promise<ContractUpdateResponse> {
    return apiClient.patch<ContractUpdateResponse>(`${this.BASE_PATH}/${id}/status`, data)
  }

  // Get available rooms for contract creation
  static async getAvailableRooms(): Promise<{ data: AvailableRoom[] }> {
    // Use existing rooms endpoint and filter for available rooms
    const response = await apiClient.get<{ data: Room[], pagination: { total: number; pages: number; page: number; limit: number } }>('/api/rooms?status=AVAILABLE&limit=100')
    const availableRooms = response.data.map(room => ({
      ...room,
      isAvailable: room.status === 'AVAILABLE'
    }))
    return { data: availableRooms }
  }

  // Get tenants available for contract
  static async getAvailableTenants(): Promise<{ data: TenantForContract[] }> {
    // Use existing tenants endpoint
    interface TenantApiResponse {
      id: string
      fullName: string
      phone: string
      idCard: string
      dateOfBirth: string
      hometown: string
    }
    
    const response = await apiClient.get<{ data: TenantApiResponse[], pagination: { total: number; pages: number; page: number; limit: number } }>('/api/tenants?limit=100')
    const tenants = response.data.map(tenant => ({
      ...tenant,
      isSelected: false,
      isPrimary: false,
      currentContracts: [] // This would need to be populated from contracts if needed
    }))
    return { data: tenants }
  }

  // Get contract statistics
  static async getStats(): Promise<{ data: ContractStats }> {
    // For now, return mock data since the stats endpoint doesn't exist yet
    return Promise.resolve({
      data: {
        total: 0,
        active: 0,
        expired: 0,
        terminated: 0,
        expiringThisMonth: 0,
        expiringNextMonth: 0
      }
    })
    // TODO: Implement when backend stats endpoint is ready
    // return apiClient.get<{ data: ContractStats }>(`${this.BASE_PATH}/stats`)
  }

  // Check-in contract (activate and update room status)
  static async checkIn(id: string): Promise<ContractUpdateResponse> {
    return apiClient.post<ContractUpdateResponse>(`${this.BASE_PATH}/${id}/checkin`)
  }

  // Check-out contract (terminate and calculate final bill)
  static async checkOut(id: string, data?: { reason?: string }): Promise<ContractUpdateResponse> {
    return apiClient.post<ContractUpdateResponse>(`${this.BASE_PATH}/${id}/checkout`, data)
  }

  // Get contract status options
  static getContractStatusOptions() {
    return [
      { value: 'ACTIVE', label: 'Đang hoạt động', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
      { value: 'EXPIRED', label: 'Hết hạn', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
      { value: 'TERMINATED', label: 'Đã kết thúc', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' }
    ] as const
  }

  // Get contract status color
  static getContractStatusColor(status: ContractStatus): string {
    const statusMap = {
      'ACTIVE': 'bg-green-500',
      'EXPIRED': 'bg-orange-500',
      'TERMINATED': 'bg-red-500'
    }
    return statusMap[status] || 'bg-gray-500'
  }

  // Get contract status label
  static getContractStatusLabel(status: ContractStatus): string {
    const statusMap = {
      'ACTIVE': 'Đang hoạt động',
      'EXPIRED': 'Hết hạn',
      'TERMINATED': 'Đã kết thúc'
    }
    return statusMap[status] || status
  }

  // Get contract status variant for badge
  static getContractStatusVariant(status: ContractStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    const statusMap = {
      'ACTIVE': 'default' as const,
      'EXPIRED': 'secondary' as const,
      'TERMINATED': 'destructive' as const
    }
    return statusMap[status] || 'outline'
  }

  // Helper function to safely parse dates
  private static safeParseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  }

  // Check if contract is expiring soon (within 30 days)
  static isExpiringSoon(endDate: string): boolean {
    const end = this.safeParseDate(endDate)
    if (!end) return false
    
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    return end <= thirtyDaysFromNow && end > now
  }

  // Check if contract is expired
  static isExpired(endDate: string): boolean {
    const end = this.safeParseDate(endDate)
    if (!end) return false
    
    const now = new Date()
    return end < now
  }

  // Calculate contract duration in days
  static getContractDuration(startDate: string, endDate: string): number {
    const start = this.safeParseDate(startDate)
    const end = this.safeParseDate(endDate)
    
    if (!start || !end) return 0
    
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calculate remaining days
  static getRemainingDays(endDate: string): number {
    const end = this.safeParseDate(endDate)
    if (!end) return 0
    
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Format contract number for display
  static formatContractNumber(contractNumber: string): string {
    // Add formatting if needed, e.g., HD-2024-001
    return contractNumber
  }

  // Validate contract dates
  static validateContractDates(startDate: string, endDate: string): { isValid: boolean; error?: string } {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (start >= end) {
      return { isValid: false, error: 'Ngày kết thúc phải sau ngày bắt đầu' }
    }

    if (end <= now) {
      return { isValid: false, error: 'Ngày kết thúc phải trong tương lai' }
    }

    // Minimum contract duration: 1 month
    const minDuration = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    if (end.getTime() - start.getTime() < minDuration) {
      return { isValid: false, error: 'Hợp đồng phải có thời hạn tối thiểu 1 tháng' }
    }

    return { isValid: true }
  }
}

export default ContractService
