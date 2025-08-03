// Application constants

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  },
  ROOMS: {
    BASE: '/api/rooms',
    MAP: '/api/rooms/map'
  },
  TENANTS: {
    BASE: '/api/tenants'
  },
  CONTRACTS: {
    BASE: '/api/contracts',
    CHECKIN: (id: string) => `/api/contracts/${id}/checkin`,
    CHECKOUT: (id: string) => `/api/contracts/${id}/checkout`
  },
  BILLS: {
    BASE: '/api/bills',
    GENERATE: '/api/bills/generate',
    PAY: (id: string) => `/api/bills/${id}/pay`
  },
  METER_READINGS: {
    BASE: '/api/meter-readings',
    AI_SCAN: '/api/meter-readings/ai-scan',
    BATCH_SCAN: '/api/meter-readings/batch-scan'
  },
  DASHBOARD: {
    OVERVIEW: '/api/dashboard/overview',
    REVENUE: '/api/dashboard/revenue',
    NOTIFICATIONS: '/api/dashboard/notifications'
  },
  SETTINGS: {
    BASE: '/api/settings',
    CATEGORY: (name: string) => `/api/settings/category/${name}`,
    LOGO: '/api/settings/logo'
  }
} as const

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
} as const

export const ROOM_TYPES = [
  'Phòng đơn',
  'Phòng đôi',
  'Phòng gia đình',
  'Studio',
  'Căn hộ mini'
] as const

export const VIETNAMESE_MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
] as const

export const ROOM_STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-red-100 text-red-800',
  RESERVED: 'bg-yellow-100 text-yellow-800',
  MAINTENANCE: 'bg-gray-100 text-gray-800'
} as const

export const BILL_STATUS_COLORS = {
  UNPAID: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800'
} as const