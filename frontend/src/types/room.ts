// Room management types

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'

export interface Room {
  id: string
  number: string
  floor: number
  area: number
  type: string
  basePrice: number
  status: RoomStatus
  createdAt: string
  updatedAt: string
  contracts?: Contract[]
  bills?: Bill[]
  meterReadings?: MeterReading[]
  _count?: {
    contracts: number
    bills: number
  }
}

export interface Contract {
  id: string
  contractNumber: string
  roomId: string
  startDate: string
  endDate: string
  deposit: number
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
  createdAt: string
  updatedAt: string
  tenants?: ContractTenant[]
}

export interface ContractTenant {
  contractId: string
  tenantId: string
  isPrimary: boolean
  tenant: {
    id: string
    fullName: string
    phone: string
    idCard?: string
  }
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

export interface MeterReading {
  id: string
  roomId: string
  month: number
  year: number
  electricReading: number
  waterReading: number
  createdAt: string
  electricScanConfidence?: number
  waterScanConfidence?: number
  isAiScanned: boolean
  aiScanMetadata?: Record<string, unknown>
  verifiedBy?: string
  verifiedAt?: string
}

export interface CreateRoomData {
  number: string
  floor: number
  area: number
  type: string
  basePrice: number
  status?: RoomStatus
}

export interface UpdateRoomData {
  number?: string
  floor?: number
  area?: number
  type?: string
  basePrice?: number
  status?: RoomStatus
}

export interface RoomFilters {
  page?: number
  limit?: number
  status?: RoomStatus
  floor?: number
  type?: string
  search?: string
}

export interface PaginationResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
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
