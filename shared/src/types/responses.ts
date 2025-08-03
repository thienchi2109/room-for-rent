// Specific response types for different endpoints

import { Room, Tenant, Contract, Bill, MeterReading } from './models'

// Room responses
export interface RoomWithDetails extends Room {
  currentContract?: Contract
  currentTenant?: Tenant
  lastMeterReading?: MeterReading
}

// Tenant responses
export interface TenantWithHistory extends Tenant {
  contracts: Contract[]
  currentContract?: Contract
}

// Contract responses
export interface ContractWithDetails extends Contract {
  room: Room
  tenants: Tenant[]
  bills: Bill[]
}

// Bill responses
export interface BillWithDetails extends Bill {
  room: Room
  contract: Contract
  tenants: Tenant[]
}

// Meter reading responses
export interface MeterReadingWithRoom extends MeterReading {
  room: Room
}

// AI Scan responses
export interface MeterScanResult {
  reading: number | null
  confidence: number
  meterType: 'electric' | 'water'
  imageId: string
  rawResponse: any
  timestamp: Date
}

// Settings responses
export interface SettingsCategory {
  [key: string]: string | number | boolean
}