import { Badge } from '../ui/badge'
import { BillStatus } from '../../../../shared/src/types/models'

interface BillStatusBadgeProps {
  status: BillStatus
  className?: string
}

export function BillStatusBadge({ status, className }: BillStatusBadgeProps) {
  const getStatusConfig = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID:
        return {
          label: 'Đã thanh toán',
          variant: 'success' as const,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        }
      case BillStatus.UNPAID:
        return {
          label: 'Chưa thanh toán',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        }
      case BillStatus.OVERDUE:
        return {
          label: 'Quá hạn',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        }
      default:
        return {
          label: 'Không xác định',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  )
}