// Tenant service for API calls

import apiClient from '@/lib/api'
import { 
  TenantWithContracts, 
  TenantFormData, 
  TenantFilters, 
  TenantListResponse, 
  TenantDetailResponse,
  TenantHistoryResponse 
} from '@/types/tenant'

export class TenantService {
  // Get all tenants with filters
  static async getAll(filters: TenantFilters = {}): Promise<TenantListResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
    if (filters.roomNumber) params.append('roomNumber', filters.roomNumber)
    if (filters.floor) params.append('floor', filters.floor.toString())

    const queryString = params.toString()
    const endpoint = `/api/tenants${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get<TenantListResponse>(endpoint)
  }

  // Get tenant by ID
  static async getById(id: string): Promise<TenantDetailResponse> {
    return apiClient.get<TenantDetailResponse>(`/api/tenants/${id}`)
  }

  // Create new tenant
  static async create(data: TenantFormData): Promise<{ data: TenantWithContracts; message: string }> {
    return apiClient.post<{ data: TenantWithContracts; message: string }>('/api/tenants', data)
  }

  // Update tenant
  static async update(id: string, data: Partial<TenantFormData>): Promise<{ data: TenantWithContracts; message: string }> {
    return apiClient.put<{ data: TenantWithContracts; message: string }>(`/api/tenants/${id}`, data)
  }

  // Delete tenant
  static async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/tenants/${id}`)
  }

  // Get tenant rental history
  static async getHistory(id: string, page = 1, limit = 10): Promise<TenantHistoryResponse> {
    return apiClient.get<TenantHistoryResponse>(`/api/tenants/${id}/history?page=${page}&limit=${limit}`)
  }
}

export default TenantService