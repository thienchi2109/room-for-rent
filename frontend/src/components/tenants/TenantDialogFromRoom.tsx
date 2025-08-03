'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { useCreateTenant } from '@/hooks/useTenants'
import { TenantFormData } from '@/types/tenant'
import { Building } from 'lucide-react'

interface TenantDialogFromRoomProps {
  roomNumber: string
  roomId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TenantDialogFromRoom({ 
  roomNumber,
  // roomId, // TODO: Will be used for creating contract later
  open, 
  onOpenChange, 
  onSuccess 
}: TenantDialogFromRoomProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    fullName: '',
    dateOfBirth: '',
    idCard: '',
    hometown: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Partial<TenantFormData>>({})

  const createMutation = useCreateTenant()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        fullName: '',
        dateOfBirth: '',
        idCard: '',
        hometown: '',
        phone: ''
      })
      setErrors({})
    }
  }, [open])

  // Handle success
  useEffect(() => {
    if (createMutation.isSuccess) {
      onSuccess?.()
    }
  }, [createMutation.isSuccess, onSuccess])

  // Handle errors
  useEffect(() => {
    if (createMutation.error) {
      const error = createMutation.error as Error & { message?: string }
      if (error.message?.includes('ID card already exists')) {
        setErrors({ idCard: 'Số CCCD này đã tồn tại' })
      }
    }
  }, [createMutation.error])

  const handleInputChange = (field: keyof TenantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<TenantFormData> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc'
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      if (birthDate >= today) {
        newErrors.dateOfBirth = 'Ngày sinh không thể là tương lai'
      }
    }

    if (!formData.idCard.trim()) {
      newErrors.idCard = 'Số CCCD là bắt buộc'
    } else if (!/^[0-9]{9,12}$/.test(formData.idCard.trim())) {
      newErrors.idCard = 'Số CCCD phải có 9-12 chữ số'
    }

    if (!formData.hometown.trim()) {
      newErrors.hometown = 'Quê quán là bắt buộc'
    } else if (formData.hometown.trim().length < 2) {
      newErrors.hometown = 'Quê quán phải có ít nhất 2 ký tự'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc'
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      ...formData,
      fullName: formData.fullName.trim(),
      idCard: formData.idCard.trim(),
      hometown: formData.hometown.trim(),
      phone: formData.phone.trim()
    }

    createMutation.mutate(submitData)
  }

  const isLoading = createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Thêm khách thuê cho phòng {roomNumber}
          </DialogTitle>
        </DialogHeader>

        {/* Room Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Phòng được chọn</p>
              <p className="text-lg font-bold text-blue-700">Phòng {roomNumber}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Có sẵn
            </Badge>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Sau khi thêm khách thuê, bạn có thể tạo hợp đồng thuê phòng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-1">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Nhập họ và tên"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Ngày sinh *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              disabled={isLoading}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* ID Card */}
          <div className="space-y-2">
            <Label htmlFor="idCard">Số CCCD *</Label>
            <Input
              id="idCard"
              value={formData.idCard}
              onChange={(e) => handleInputChange('idCard', e.target.value)}
              placeholder="Nhập số CCCD"
              disabled={isLoading}
            />
            {errors.idCard && (
              <p className="text-sm text-red-600">{errors.idCard}</p>
            )}
          </div>

          {/* Hometown */}
          <div className="space-y-2">
            <Label htmlFor="hometown">Quê quán *</Label>
            <Input
              id="hometown"
              value={formData.hometown}
              onChange={(e) => handleInputChange('hometown', e.target.value)}
              placeholder="Nhập quê quán"
              disabled={isLoading}
            />
            {errors.hometown && (
              <p className="text-sm text-red-600">{errors.hometown}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 px-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
              {isLoading && <LoadingSpinner className="w-4 h-4 mr-2" />}
              Thêm khách thuê
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}