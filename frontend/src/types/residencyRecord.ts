import { ResidencyType } from '@shared/types/models'

// Base residency record interface
export interface ResidencyRecord {
  id: string
  tenantId: string
  type: ResidencyType
  startDate: Date
  endDate?: Date
  notes?: string
  createdAt: Date
}

// Residency record with tenant information
export interface ResidencyRecordWithTenant extends ResidencyRecord {
  tenant: {
    id: string
    fullName: string
    idCard: string
    phone: string
    hometown?: string
  }
}

// Form data for creating/updating residency records
export interface ResidencyRecordFormData {
  tenantId: string
  type: ResidencyType
  startDate: string
  endDate?: string
  notes?: string
}

// Filters for residency record list
export interface ResidencyRecordFilters {
  page?: number
  limit?: number
  tenantId?: string
  type?: ResidencyType
  sortBy?: 'startDate' | 'endDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// API response types
export interface ResidencyRecordListResponse {
  data: ResidencyRecordWithTenant[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ResidencyRecordDetailResponse {
  data: ResidencyRecordWithTenant
}

// Utility types for UI
export interface ResidencyRecordTypeOption {
  value: ResidencyType
  label: string
  description: string
}

export const RESIDENCY_TYPE_OPTIONS: ResidencyRecordTypeOption[] = [
  {
    value: ResidencyType.TEMPORARY_RESIDENCE,
    label: 'Tạm trú',
    description: 'Khách thuê tạm thời cư trú tại địa chỉ khác'
  },
  {
    value: ResidencyType.TEMPORARY_ABSENCE,
    label: 'Tạm vắng',
    description: 'Khách thuê tạm thời vắng mặt khỏi phòng'
  }
]

// Helper function to get residency type label
export function getResidencyTypeLabel(type: ResidencyType): string {
  const option = RESIDENCY_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.label || type
}

// Helper function to get residency type description
export function getResidencyTypeDescription(type: ResidencyType): string {
  const option = RESIDENCY_TYPE_OPTIONS.find(opt => opt.value === type)
  return option?.description || ''
}

// Helper function to check if residency record is active
export function isResidencyRecordActive(record: ResidencyRecord): boolean {
  const now = new Date()
  const startDate = new Date(record.startDate)
  
  if (startDate > now) {
    return false // Not started yet
  }
  
  if (!record.endDate) {
    return true // No end date, so it's ongoing
  }
  
  const endDate = new Date(record.endDate)
  return endDate >= now // Active if end date is in the future or today
}

// Helper function to format residency record duration
export function formatResidencyDuration(record: ResidencyRecord): string {
  const startDate = new Date(record.startDate)
  const endDate = record.endDate ? new Date(record.endDate) : null
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  if (endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  } else {
    return `Từ ${formatDate(startDate)}`
  }
}
