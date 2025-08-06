import { apiClient } from '../lib/api'
import { Bill, BillFilters, BillFormData, PayBillData, BillListResponse } from '../types/bill'

export const billService = {
  // Get all bills with filters and pagination
  async getAll(filters?: BillFilters): Promise<BillListResponse> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.contractId) params.append('contractId', filters.contractId)
    if (filters?.roomId) params.append('roomId', filters.roomId)
    if (filters?.month) params.append('month', filters.month.toString())
    if (filters?.year) params.append('year', filters.year.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await apiClient.get(`/api/bills?${params.toString()}`)
    return response as BillListResponse
  },

  // Get bill by ID
  async getById(id: string): Promise<Bill> {
    const response = await apiClient.get(`/api/bills/${id}`)
    return (response as { data: Bill }).data
  },

  // Create new bill
  async create(data: BillFormData): Promise<Bill> {
    const response = await apiClient.post('/api/bills', data)
    return (response as { data: Bill }).data
  },

  // Update bill
  async update(id: string, data: Partial<BillFormData>): Promise<Bill> {
    const response = await apiClient.put(`/api/bills/${id}`, data)
    return (response as { data: Bill }).data
  },

  // Delete bill
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/bills/${id}`)
  },

  // Mark bill as paid
  async markAsPaid(id: string, data?: PayBillData): Promise<Bill> {
    const response = await apiClient.post(`/api/bills/${id}/pay`, data || {})
    return (response as { data: Bill }).data
  },

  // Generate bills for a month
  async generateBills(month: number, year: number): Promise<{ data: { generated: number; month: number; year: number } }> {
    const response = await apiClient.post('/api/bills/generate', { month, year })
    return response as { data: { generated: number; month: number; year: number } }
  }
}