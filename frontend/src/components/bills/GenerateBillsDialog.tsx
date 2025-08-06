'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGenerateBills } from '../../hooks/useBills'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  X,
  Zap
} from 'lucide-react'

// Validation schema
const generateBillsSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100)
})

type GenerateBillsFormValues = z.infer<typeof generateBillsSchema>

interface GenerateBillsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function GenerateBillsDialog({ open, onOpenChange, onSuccess }: GenerateBillsDialogProps) {
  const [confirmGenerate, setConfirmGenerate] = useState(false)

  const generateBills = useGenerateBills()

  // Get current month/year as default
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Form setup
  const form = useForm<GenerateBillsFormValues>({
    resolver: zodResolver(generateBillsSchema),
    defaultValues: {
      month: currentMonth,
      year: currentYear
    }
  })

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = form

  // Handle form submission
  const onSubmit = async (data: GenerateBillsFormValues) => {
    try {
      await generateBills.mutateAsync({ month: data.month, year: data.year })
      onSuccess?.()
      onOpenChange(false)
      setConfirmGenerate(false)
    } catch (error) {
      console.error('Generate bills error:', error)
    }
  }

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmGenerate(false)
      form.reset()
    }
    onOpenChange(newOpen)
  }

  const watchedMonth = watch('month')
  const watchedYear = watch('year')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Tạo Hóa đơn Tự động
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-blue-600" />
                Chọn Kỳ Hóa đơn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Tháng *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    {...register('month', { valueAsNumber: true })}
                    placeholder="1-12"
                  />
                  {errors.month && (
                    <p className="text-sm text-red-600 mt-1">{errors.month.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="year">Năm *</Label>
                  <Input
                    type="number"
                    min="2020"
                    max="2100"
                    {...register('year', { valueAsNumber: true })}
                    placeholder="2024"
                  />
                  {errors.year && (
                    <p className="text-sm text-red-600 mt-1">{errors.year.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Kỳ được chọn:</strong> Tháng {watchedMonth}/{watchedYear}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Tự động tạo hóa đơn</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Hệ thống sẽ tự động tạo hóa đơn cho tất cả hợp đồng đang hoạt động trong kỳ này.
                  Hóa đơn sẽ bao gồm tiền thuê phòng, điện, nước dựa trên chỉ số mét gần nhất.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          {!confirmGenerate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Xác nhận tạo hóa đơn</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Bạn có chắc chắn muốn tạo hóa đơn cho tháng {watchedMonth}/{watchedYear}?
                    Hóa đơn đã tồn tại sẽ không được tạo lại.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmGenerate(true)}
                    className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Tôi xác nhận
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !confirmGenerate}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Tạo Hóa đơn
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}