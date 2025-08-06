'use client'

import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { LoadingSpinner } from '../ui/loading-spinner'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  FileText,
  DollarSign,
  Wrench,
  User,
  Calendar,

  Building,
  ChevronRight,
  Filter,
  Bell,
  BellOff
} from 'lucide-react'
import { usePriorityNotifications, NotificationItem } from '../../hooks/useDashboard'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

type NotificationFilter = 'all' | 'high' | 'medium' | 'low' | 'info'

interface NotificationCardProps {
  notification: NotificationItem
  onClick?: () => void
}

function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'bg-red-50 border-red-200 text-red-800',
          badgeColor: 'bg-red-500',
          icon: <AlertTriangle className="w-4 h-4" />
        }
      case 'medium':
        return {
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          badgeColor: 'bg-yellow-500',
          icon: <Clock className="w-4 h-4" />
        }
      case 'low':
        return {
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          badgeColor: 'bg-blue-500',
          icon: <FileText className="w-4 h-4" />
        }
      case 'info':
        return {
          color: 'bg-green-50 border-green-200 text-green-800',
          badgeColor: 'bg-green-500',
          icon: <CheckCircle className="w-4 h-4" />
        }
      default:
        return {
          color: 'bg-gray-50 border-gray-200 text-gray-800',
          badgeColor: 'bg-gray-500',
          icon: <Bell className="w-4 h-4" />
        }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overdue_bill':
        return <DollarSign className="w-4 h-4" />
      case 'expiring_contract':
        return <FileText className="w-4 h-4" />
      case 'maintenance_room':
        return <Wrench className="w-4 h-4" />
      case 'payment_received':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const config = getPriorityConfig(notification.priority)

  return (
    <Card 
      className={`${config.color} border-2 hover:shadow-md transition-all duration-200 cursor-pointer group`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 ${config.badgeColor} rounded-lg text-white flex-shrink-0`}>
            {getTypeIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-sm leading-tight">
                {notification.title}
              </h4>
              <div className="flex items-center gap-1 flex-shrink-0">
                {notification.actionRequired && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {notification.message}
            </p>
            
            {/* Details */}
            {notification.details && (
              <div className="space-y-1 mb-3">
                {notification.details.roomNumber && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Building className="w-3 h-3" />
                    <span>Phòng {notification.details.roomNumber}</span>
                    {notification.details.floor && (
                      <span className="text-gray-400">• Tầng {notification.details.floor}</span>
                    )}
                  </div>
                )}
                
                {notification.details.tenantName && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="w-3 h-3" />
                    <span>{notification.details.tenantName}</span>
                    {notification.details.tenantPhone && (
                      <span className="text-gray-400">• {notification.details.tenantPhone}</span>
                    )}
                  </div>
                )}
                
                {notification.details.amount && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <DollarSign className="w-3 h-3" />
                    <span>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(notification.details.amount)}
                    </span>
                  </div>
                )}
                
                {(notification.details.daysPastDue || notification.details.daysUntilExpiry) && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {notification.details.daysPastDue 
                        ? `Quá hạn ${notification.details.daysPastDue} ngày`
                        : `Còn ${notification.details.daysUntilExpiry} ngày`
                      }
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {notification.priority.toUpperCase()}
                </Badge>
                {notification.actionRequired && (
                  <Badge variant="destructive" className="text-xs">
                    Cần xử lý
                  </Badge>
                )}
              </div>
              
              <span className="text-xs text-gray-500">
                {format(new Date(notification.createdAt), 'dd/MM HH:mm', { locale: vi })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationsPanel() {
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const { data: notifications, summary, isLoading, error } = usePriorityNotifications()

  const getFilteredNotifications = () => {
    if (filter === 'all') {
      return [...notifications.high, ...notifications.medium, ...notifications.low, ...notifications.info]
    }
    return notifications[filter] || []
  }

  const filteredNotifications = getFilteredNotifications()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-medium">
          Không thể tải thông báo
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {error instanceof Error ? error.message : 'Lỗi không xác định'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-lg border border-red-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {summary.byPriority.high}
              </div>
              <div className="text-xs text-red-700 font-medium">Ưu tiên cao</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.actionRequired}
              </div>
              <div className="text-xs text-blue-700 font-medium">Cần xử lý</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
          <Filter className="w-4 h-4" />
          <span>Lọc:</span>
        </div>
        
        {[
          { key: 'all', label: 'Tất cả', count: summary?.total || 0 },
          { key: 'high', label: 'Cao', count: summary?.byPriority.high || 0 },
          { key: 'medium', label: 'Trung bình', count: summary?.byPriority.medium || 0 },
          { key: 'low', label: 'Thấp', count: summary?.byPriority.low || 0 },
          { key: 'info', label: 'Thông tin', count: summary?.byPriority.info || 0 }
        ].map((filterOption) => (
          <Button
            key={filterOption.key}
            variant={filter === filterOption.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(filterOption.key as NotificationFilter)}
            className="text-xs flex-shrink-0"
          >
            {filterOption.label}
            {filterOption.count > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {filterOption.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Không có thông báo</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === 'all' ? 'Hệ thống đang hoạt động bình thường' : `Không có thông báo ${filter}`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={() => {
                // Handle notification click - could open detail modal or navigate
                console.log('Notification clicked:', notification)
              }}
            />
          ))
        )}
      </div>

      {/* Action Summary */}
      {summary && summary.actionRequired > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-red-800">
                {summary.actionRequired} thông báo cần xử lý
              </p>
              <p className="text-sm text-red-600 mt-1">
                Vui lòng kiểm tra và xử lý các vấn đề quan trọng
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
