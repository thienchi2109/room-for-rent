import { apiClient } from '@/lib/api'
import {
  ResidencyRecordFilters,
  ResidencyRecordFormData,
  ResidencyRecordListResponse,
  ResidencyRecordDetailResponse,
  ResidencyRecordWithTenant
} from '@/types/residencyRecord'

export class ResidencyRecordService {
  // Get all residency records with filters
  static async getAll(filters: ResidencyRecordFilters = {}): Promise<ResidencyRecordListResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.tenantId) params.append('tenantId', filters.tenantId)
    if (filters.type) params.append('type', filters.type)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const queryString = params.toString()
    const endpoint = `/api/residency-records${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get<ResidencyRecordListResponse>(endpoint)
  }

  // Get residency record by ID
  static async getById(id: string): Promise<ResidencyRecordDetailResponse> {
    return apiClient.get<ResidencyRecordDetailResponse>(`/api/residency-records/${id}`)
  }

  // Create new residency record
  static async create(data: ResidencyRecordFormData): Promise<{ data: ResidencyRecordWithTenant; message: string }> {
    return apiClient.post<{ data: ResidencyRecordWithTenant; message: string }>('/api/residency-records', data)
  }

  // Update residency record
  static async update(id: string, data: Partial<ResidencyRecordFormData>): Promise<{ data: ResidencyRecordWithTenant; message: string }> {
    return apiClient.put<{ data: ResidencyRecordWithTenant; message: string }>(`/api/residency-records/${id}`, data)
  }

  // Delete residency record
  static async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/residency-records/${id}`)
  }

  // Get residency records for a specific tenant
  static async getByTenantId(tenantId: string, filters: Omit<ResidencyRecordFilters, 'tenantId'> = {}): Promise<ResidencyRecordListResponse> {
    return this.getAll({ ...filters, tenantId })
  }
}
