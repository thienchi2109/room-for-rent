'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useCreateTenant, useUpdateTenant } from '@/hooks/useTenants'
import { TenantFormData, TenantWithContracts } from '@/types/tenant'

interface TenantDialogProps {
  tenant?: TenantWithContracts
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function TenantDialog({ 
  tenant, 
  open, 
  onOpenChange, 
  mode, 
  onSuccess 
}: TenantDialogProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    fullName: '',
    dateOfBirth: '',
    idCard: '',
    hometown: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Partial<TenantFormData>>({})

  // Hooks
  const createMutation = useCreateTenant()
  const updateMutation = useUpdateTenant()

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && tenant) {
      setFormData({
        fullName: tenant.fullName,
        dateOfBirth: new Date(tenant.dateOfBirth).toISOString().split('T')[0],
        idCard: tenant.idCard,
        hometown: tenant.hometown,
        phone: tenant.phone
      })
    } else if (mode === 'create') {
      setFormData({
        fullName: '',
        dateOfBirth: '',
        idCard: '',
        hometown: '',
        phone: ''
      })
    }
    setErrors({})
  }, [mode, tenant, open])

  // Handle success
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      onSuccess?.()
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, onSuccess])

  // Handle errors
  useEffect(() => {
    if (createMutation.error) {
      const error = createMutation.error as Error & { message?: string }
      if (error.message?.includes('ID card already exists')) {
        setErrors({ idCard: 'Số CCCD này đã tồn tại' })
      }
    }
    if (updateMutation.error) {
      const error = updateMutation.error as Error & { message?: string }
      if (error.message?.includes('ID card already exists')) {
        setErrors({ idCard: 'Số CCCD này đã tồn tại' })
      }
    }
  }, [createMutation.error, updateMutation.error])

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

    if (mode === 'create') {
      createMutation.mutate(submitData)
    } else {
      updateMutation.mutate({ id: tenant!.id, data: submitData })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="mb-4">
          <DialogTitle>
            {mode === 'create' ? 'Thêm khách thuê mới' : 'Chỉnh sửa thông tin khách thuê'}
          </DialogTitle>
        </DialogHeader>

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
              {mode === 'create' ? 'Thêm' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}