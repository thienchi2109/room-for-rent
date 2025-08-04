'use client'

import { Badge } from '@/components/ui/badge'
import { ContractService } from '@/services/contractService'
import type { ContractStatus } from '@/types/contract'
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ContractStatusBadgeProps {
  status: ContractStatus
  endDate?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ContractStatusBadge({ 
  status, 
  endDate, 
  showIcon = true, 
  size = 'md',
  className = '' 
}: ContractStatusBadgeProps) {
  const getStatusConfig = () => {
    const baseConfig = {
      ACTIVE: {
        variant: 'default' as const,
        label: 'Đang hoạt động',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      EXPIRED: {
        variant: 'secondary' as const,
        label: 'Hết hạn',
        icon: Clock,
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      TERMINATED: {
        variant: 'destructive' as const,
        label: 'Đã kết thúc',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    }

    // Check if active contract is expiring soon
    if (status === 'ACTIVE' && endDate && ContractService.isExpiringSoon(endDate)) {
      return {
        variant: 'secondary' as const,
        label: 'Sắp hết hạn',
        icon: AlertTriangle,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      }
    }

    return baseConfig[status]
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <Badge 
      variant={config.variant}
      className={`
        ${config.className} 
        ${sizeClasses[size]} 
        ${className}
        inline-flex items-center gap-1.5 font-medium border
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
      {status === 'ACTIVE' && endDate && (
        <span className="ml-1 text-xs opacity-75">
          ({ContractService.getRemainingDays(endDate)} ngày)
        </span>
      )}
    </Badge>
  )
}

// Utility component for contract status with additional info
interface ContractStatusInfoProps {
  status: ContractStatus
  startDate: string
  endDate: string
  showDuration?: boolean
  showRemainingDays?: boolean
  className?: string
}

export function ContractStatusInfo({ 
  status, 
  startDate, 
  endDate, 
  showDuration = false,
  showRemainingDays = true,
  className = '' 
}: ContractStatusInfoProps) {
  const remainingDays = ContractService.getRemainingDays(endDate)
  const duration = ContractService.getContractDuration(startDate, endDate)
  const isExpired = ContractService.isExpired(endDate)
  const isExpiringSoon = ContractService.isExpiringSoon(endDate)

  return (
    <div className={`space-y-2 ${className}`}>
      <ContractStatusBadge 
        status={status} 
        endDate={endDate}
        showIcon={true}
      />
      
      {showDuration && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Thời hạn:</span> {duration} ngày
        </div>
      )}
      
      {showRemainingDays && status === 'ACTIVE' && (
        <div className="text-sm">
          {isExpired ? (
            <span className="text-red-600 font-medium">
              Đã quá hạn {Math.abs(remainingDays)} ngày
            </span>
          ) : isExpiringSoon ? (
            <span className="text-yellow-600 font-medium">
              Còn {remainingDays} ngày hết hạn
            </span>
          ) : (
            <span className="text-gray-600">
              Còn {remainingDays} ngày
            </span>
          )}
        </div>
      )}
      
      {status === 'EXPIRED' && (
        <div className="text-sm text-orange-600">
          Hết hạn từ {new Date(endDate).toLocaleDateString('vi-VN')}
        </div>
      )}
      
      {status === 'TERMINATED' && (
        <div className="text-sm text-red-600">
          Đã kết thúc
        </div>
      )}
    </div>
  )
}

// Quick status indicator for compact displays
interface ContractStatusDotProps {
  status: ContractStatus
  endDate?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ContractStatusDot({ 
  status, 
  endDate, 
  size = 'md',
  className = '' 
}: ContractStatusDotProps) {
  const getStatusColor = () => {
    // Check if active contract is expiring soon
    if (status === 'ACTIVE' && endDate && ContractService.isExpiringSoon(endDate)) {
      return 'bg-yellow-500'
    }

    const colorMap = {
      ACTIVE: 'bg-green-500',
      EXPIRED: 'bg-orange-500',
      TERMINATED: 'bg-red-500'
    }
    return colorMap[status]
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div 
      className={`
        ${getStatusColor()} 
        ${sizeClasses[size]} 
        ${className}
        rounded-full flex-shrink-0
      `}
      title={ContractService.getContractStatusLabel(status)}
    />
  )
}
