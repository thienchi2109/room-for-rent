'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import RoomService from '@/services/roomService'
import type { Room, CreateRoomData, UpdateRoomData, RoomStatus } from '@/types/room'

interface RoomFormProps {
  room?: Room // If provided, this is edit mode
  onSubmit: (data: CreateRoomData | UpdateRoomData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function RoomForm({ room, onSubmit, onCancel, isLoading }: RoomFormProps) {
  const isEditMode = !!room
  
  const [formData, setFormData] = useState({
    number: room?.number || '',
    floor: room?.floor || 1,
    area: room?.area || 0,
    capacity: room?.capacity || 1,
    basePrice: room?.basePrice || 0,
    status: room?.status || 'AVAILABLE' as RoomStatus
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.number.trim()) {
      newErrors.number = 'Số phòng là bắt buộc'
    }

    if (formData.floor < 1) {
      newErrors.floor = 'Tầng phải >= 1'
    }

    if (formData.area <= 0) {
      newErrors.area = 'Diện tích phải > 0'
    }

    if (formData.capacity < 1 || formData.capacity > 10) {
      newErrors.capacity = 'Sức chứa phải từ 1 đến 10 người'
    }

    if (formData.basePrice <= 0) {
      newErrors.basePrice = 'Giá cơ bản phải > 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const statusOptions = RoomService.getRoomStatusOptions()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {isEditMode ? `Sửa phòng ${room.number}` : 'Tạo phòng mới'}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Số phòng</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              placeholder="Ví dụ: 101, A01"
              className={errors.number ? 'border-red-500' : ''}
            />
            {errors.number && (
              <p className="text-sm text-red-500">{errors.number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Tầng</Label>
            <Input
              id="floor"
              type="number"
              min="1"
              value={formData.floor}
              onChange={(e) => handleInputChange('floor', parseInt(e.target.value) || 0)}
              className={errors.floor ? 'border-red-500' : ''}
            />
            {errors.floor && (
              <p className="text-sm text-red-500">{errors.floor}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Diện tích (m²)</Label>
            <Input
              id="area"
              type="number"
              min="0"
              step="0.1"
              value={formData.area}
              onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
              className={errors.area ? 'border-red-500' : ''}
            />
            {errors.area && (
              <p className="text-sm text-red-500">{errors.area}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Sức chứa (người)</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="10"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
              className={errors.capacity ? 'border-red-500' : ''}
            />
            {errors.capacity && (
              <p className="text-sm text-red-500">{errors.capacity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="basePrice">Giá cơ bản (VNĐ)</Label>
            <Input
              id="basePrice"
              type="number"
              min="0"
              value={formData.basePrice}
              onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
              className={errors.basePrice ? 'border-red-500' : ''}
            />
            {errors.basePrice && (
              <p className="text-sm text-red-500">{errors.basePrice}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as RoomStatus)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>

        <CardFooter className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
