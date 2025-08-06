import { BillStatus } from '../../../shared/src/types/models'

export interface Bill {
  id: string
  contractId: string
  roomId: string
  month: number
  year: number
  rentAmount: number
  electricAmount: number
  waterAmount: number
  serviceAmount: number
  totalAmount: number
  status: BillStatus
  dueDate: Date
  paidDate?: Date
  createdAt: Date
  updatedAt: Date
  
  // Relations
  contract: {
    id: string
    contractNumber: string
    tenants: Array<{
      tenant: {
        id: string
        fullName: string
        phone: string
        idCard?: string
      }
    }>
  }
  room: {
    id: string
    number: string
    floor: number
    area?: number
    capacity?: number
    basePrice?: number
  }
}

export interface BillFilters {
  page?: number
  limit?: number
  status?: BillStatus
  contractId?: string
  roomId?: string
  month?: number
  year?: number
  search?: string
  sortBy?: 'createdAt' | 'month' | 'year' | 'totalAmount' | 'dueDate' | 'paidDate'
  sortOrder?: 'asc' | 'desc'
}

export interface BillFormData {
  contractId: string
  roomId: string
  month: number
  year: number
  rentAmount: number
  electricAmount: number
  waterAmount: number
  serviceAmount: number
  totalAmount: number
  dueDate: Date
  status?: BillStatus
}

export interface PayBillData {
  paidDate?: Date
  notes?: string
}

export interface BillListResponse {
  data: Bill[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface BillStats {
  totalBills: number
  paidBills: number
  unpaidBills: number
  overdueBills: number
  totalRevenue: number
  pendingRevenue: number
}