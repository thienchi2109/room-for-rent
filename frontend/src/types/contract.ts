// Contract management types

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED'

export interface Contract {
  id: string
  contractNumber: string
  roomId: string
  startDate: string
  endDate: string
  deposit: number
  status: ContractStatus
  createdAt: string
  updatedAt: string
}

export interface ContractTenant {
  contractId: string
  tenantId: string
  isPrimary: boolean
  tenant: {
    id: string
    fullName: string
    phone: string
    idCard: string
    dateOfBirth: string
    hometown: string
  }
}

export interface Room {
  id: string
  number: string
  floor: number
  area: number
  capacity: number
  basePrice: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
}

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
  status: 'UNPAID' | 'PAID' | 'OVERDUE'
  dueDate: string
  paidDate?: string
  createdAt: string
  updatedAt: string
}

// Extended contract with all related data
export interface ContractWithDetails extends Contract {
  room: Room
  tenants: ContractTenant[]
  bills?: Bill[]
  _count?: {
    bills: number
    tenants: number
  }
}

// Form data for creating/updating contracts
export interface ContractFormData {
  contractNumber?: string // Optional - will be auto-generated if not provided
  roomId: string
  startDate: string
  endDate: string
  deposit: number
  status?: ContractStatus
  tenantIds: string[]
  primaryTenantId: string
}

// Filters for contract list
export interface ContractFilters {
  page?: number
  limit?: number
  status?: ContractStatus
  roomId?: string
  tenantId?: string
  search?: string // Search by contract number, room number, or tenant name
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'contractNumber'
  sortOrder?: 'asc' | 'desc'
  startDateFrom?: string
  startDateTo?: string
  endDateFrom?: string
  endDateTo?: string
}

// API Response types
export interface ContractListResponse {
  data: ContractWithDetails[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ContractDetailResponse {
  data: ContractWithDetails
  message?: string
}

export interface ContractCreateResponse {
  data: ContractWithDetails
  message: string
}

export interface ContractUpdateResponse {
  data: ContractWithDetails
  message: string
}

export interface ContractDeleteResponse {
  message: string
}

// Contract status update data
export interface ContractStatusUpdateData {
  status: ContractStatus
  reason?: string
}

// Multi-step form data for contract creation wizard
export interface ContractWizardData {
  step: number
  roomId?: string
  tenantIds: string[]
  primaryTenantId?: string
  contractDetails?: {
    contractNumber?: string
    startDate: string
    endDate: string
    deposit: number
  }
}

// Available room for contract creation
export interface AvailableRoom extends Room {
  isAvailable: boolean
  currentContract?: {
    id: string
    contractNumber: string
    endDate: string
  }
}

// Tenant selection for contract
export interface TenantForContract {
  id: string
  fullName: string
  phone: string
  idCard: string
  dateOfBirth: string
  hometown: string
  isSelected: boolean
  isPrimary: boolean
  currentContracts?: {
    id: string
    contractNumber: string
    roomNumber: string
    status: ContractStatus
  }[]
}

// Contract validation errors
export interface ContractValidationError {
  field: string
  message: string
  code: string
}

// Contract statistics for dashboard
export interface ContractStats {
  total: number
  active: number
  expired: number
  terminated: number
  expiringThisMonth: number
  expiringNextMonth: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
}
