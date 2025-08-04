// Database model types (matching Prisma schema)

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED'
}

export enum BillStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum ResidencyType {
  TEMPORARY_RESIDENCE = 'TEMPORARY_RESIDENCE',
  TEMPORARY_ABSENCE = 'TEMPORARY_ABSENCE'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

export interface Room {
  id: string
  number: string
  floor: number
  area: number
  type: string
  basePrice: number
  status: RoomStatus
  createdAt: Date
  updatedAt: Date
}

export interface Tenant {
  id: string
  fullName: string
  dateOfBirth: Date
  idCard: string
  hometown: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

export interface Contract {
  id: string
  contractNumber: string
  roomId: string
  startDate: Date
  endDate: Date
  deposit: number
  status: ContractStatus
  createdAt: Date
  updatedAt: Date
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
  status: BillStatus
  dueDate: Date
  paidDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface MeterReading {
  id: string
  roomId: string
  month: number
  year: number
  electricReading: number
  waterReading: number
  createdAt: Date
  electricScanConfidence?: number
  waterScanConfidence?: number
  isAiScanned: boolean
  aiScanMetadata?: any
  verifiedBy?: string
  verifiedAt?: Date
}

export interface ResidencyRecord {
  id: string
  tenantId: string
  type: ResidencyType
  startDate: Date
  endDate?: Date
  notes?: string
  createdAt: Date
}

export interface User {
  id: string
  username: string
  fullName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}