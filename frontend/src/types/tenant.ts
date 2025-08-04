// Tenant-specific types for the frontend
import { ResidencyRecord } from './residencyRecord'

export interface TenantWithContracts {
  id: string
  fullName: string
  dateOfBirth: Date
  idCard: string
  hometown: string
  phone: string
  createdAt: Date
  updatedAt: Date
  contracts: ContractTenant[]
  residencyRecords?: ResidencyRecord[]
  _count: {
    contracts: number
    residencyRecords: number
  }
}

export interface ContractTenant {
  contractId: string
  tenantId: string
  isPrimary: boolean
  contract: ContractWithRoom
}

export interface ContractWithRoom {
  id: string
  contractNumber: string
  roomId: string
  startDate: Date
  endDate: Date
  deposit: number
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
  createdAt: Date
  updatedAt: Date
  room: {
    id: string
    number: string
    floor: number
    type: string
    basePrice?: number
  }
  bills?: {
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
    status: 'UNPAID' | 'PAID' | 'OVERDUE'
    dueDate: Date
    paidDate?: Date
    createdAt: Date
    updatedAt: Date
  }[]
}

export interface TenantFormData {
  fullName: string
  dateOfBirth: string
  idCard: string
  hometown: string
  phone: string
}

export interface TenantFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface TenantListResponse {
  data: TenantWithContracts[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface TenantDetailResponse {
  data: TenantWithContracts
}

export interface TenantHistoryResponse {
  data: {
    tenant: {
      id: string
      fullName: string
    }
    history: ContractTenant[]
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}