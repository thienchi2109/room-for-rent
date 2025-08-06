import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/api'

// Types for dashboard API responses
export interface DashboardOverviewResponse {
  success: boolean
  data: {
    rooms: {
      total: number
      occupied: number
      available: number
      maintenance: number
      occupancyRate: number
    }
    tenants: {
      total: number
      activeContracts: number
    }
    revenue: {
      monthly: number
      pending: number
      period: {
        month: number
        year: number
      }
    }
    alerts: {
      overdueBills: number
      maintenanceRooms: number
    }
  }
  error?: string
  message?: string
}

export interface RevenueDataPoint {
  month: number
  year: number
  monthName: string
  period: string
  paidRevenue: number
  pendingRevenue: number
  totalRevenue: number
  paidBills: number
  unpaidBills: number
  totalBills: number
}

export interface DashboardRevenueResponse {
  success: boolean
  data: {
    revenueData: RevenueDataPoint[]
    summary: {
      totalPaidRevenue: number
      totalPendingRevenue: number
      totalRevenue: number
      totalBills: number
      period: {
        from: { month: number; year: number }
        to: { month: number; year: number }
        months: number
      }
    }
  }
  error?: string
  message?: string
}

export interface NotificationDetails {
  roomNumber?: string
  floor?: number
  amount?: number
  dueDate?: string
  daysPastDue?: number
  daysUntilExpiry?: number
  tenantName?: string
  tenantPhone?: string
  contractNumber?: string
  paidDate?: string
  period?: string
  lastUpdated?: string
  area?: number
  basePrice?: number
}

export interface NotificationItem {
  id: string
  type: 'overdue_bill' | 'expiring_contract' | 'maintenance_room' | 'payment_received'
  priority: 'high' | 'medium' | 'low' | 'info'
  title: string
  message: string
  details: NotificationDetails
  createdAt: string
  actionRequired: boolean
}

export interface DashboardNotificationsResponse {
  success: boolean
  data: {
    notifications: NotificationItem[]
    summary: {
      total: number
      byType: {
        overdue_bill: number
        expiring_contract: number
        maintenance_room: number
        payment_received: number
      }
      byPriority: {
        high: number
        medium: number
        low: number
        info: number
      }
      actionRequired: number
    }
  }
  error?: string
  message?: string
}

// Custom hooks
export function useDashboardOverview(month?: number, year?: number) {
  return useQuery<DashboardOverviewResponse['data']>({
    queryKey: ['dashboard-overview', month, year],
    queryFn: async () => {
      const result = await apiClient.getDashboardOverview(month, year) as DashboardOverviewResponse
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard overview')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  })
}

export function useDashboardRevenue(year?: number, months?: number) {
  return useQuery<DashboardRevenueResponse['data']>({
    queryKey: ['dashboard-revenue', year, months],
    queryFn: async () => {
      const result = await apiClient.getDashboardRevenue(year, months) as DashboardRevenueResponse
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch revenue data')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  })
}

export function useDashboardNotifications(limit?: number) {
  return useQuery<DashboardNotificationsResponse['data']>({
    queryKey: ['dashboard-notifications', limit],
    queryFn: async () => {
      const result = await apiClient.getDashboardNotifications(limit) as DashboardNotificationsResponse
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch notifications')
      }
      
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  })
}

// Utility hooks for specific data transformations
export function useRoomOccupancyData() {
  const { data: overview, ...rest } = useDashboardOverview()
  
  const occupancyData = overview ? [
    { name: 'Đã thuê', value: overview.rooms.occupied, color: '#10b981' },
    { name: 'Trống', value: overview.rooms.available, color: '#3b82f6' },
    { name: 'Bảo trì', value: overview.rooms.maintenance, color: '#f59e0b' }
  ] : []
  
  return {
    data: occupancyData,
    total: overview?.rooms.total || 0,
    occupancyRate: overview?.rooms.occupancyRate || 0,
    ...rest
  }
}

export function useRevenueChartData(months: number = 12) {
  const { data: revenue, ...rest } = useDashboardRevenue(undefined, months)
  
  const chartData = revenue?.revenueData.map(item => ({
    name: item.monthName,
    period: item.period,
    'Đã thu': item.paidRevenue,
    'Chờ thu': item.pendingRevenue,
    'Tổng cộng': item.totalRevenue,
    bills: item.totalBills
  })) || []
  
  return {
    data: chartData,
    summary: revenue?.summary,
    ...rest
  }
}

export function usePriorityNotifications() {
  const { data: notifications, ...rest } = useDashboardNotifications(20)
  
  const priorityNotifications = notifications ? {
    high: notifications.notifications.filter(n => n.priority === 'high'),
    medium: notifications.notifications.filter(n => n.priority === 'medium'),
    low: notifications.notifications.filter(n => n.priority === 'low'),
    info: notifications.notifications.filter(n => n.priority === 'info')
  } : { high: [], medium: [], low: [], info: [] }
  
  return {
    data: priorityNotifications,
    summary: notifications?.summary,
    all: notifications?.notifications || [],
    ...rest
  }
}
