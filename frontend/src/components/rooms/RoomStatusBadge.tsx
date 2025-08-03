'use client'

import { Badge } from '@/components/ui/badge'
import RoomService from '@/services/roomService'
import type { RoomStatus } from '@/types/room'

interface RoomStatusBadgeProps {
  status: RoomStatus
  className?: string
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  const getVariant = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success'
      case 'OCCUPIED':
        return 'default'
      case 'RESERVED':
        return 'warning'
      case 'MAINTENANCE':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Badge variant={getVariant(status)} className={className}>
      {RoomService.getRoomStatusLabel(status)}
    </Badge>
  )
}
