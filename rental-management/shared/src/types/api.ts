// API request and response types

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Authentication
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    username: string
    fullName: string
    role: string
  }
  token: string
}

// Room filters
export interface RoomFilters extends PaginationParams {
  status?: string
  floor?: number
  type?: string
  search?: string
}

// Tenant filters
export interface TenantFilters extends PaginationParams {
  search?: string
}

// Contract filters
export interface ContractFilters extends PaginationParams {
  status?: string
  roomId?: string
  tenantId?: string
}

// Bill filters
export interface BillFilters extends PaginationParams {
  status?: string
  month?: number
  year?: number
  roomId?: string
  contractId?: string
}

// Dashboard data
export interface DashboardOverview {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  monthlyRevenue: number
  pendingPayments: number
  overduePayments: number
}

export interface RevenueChartData {
  month: string
  revenue: number
  year: number
}