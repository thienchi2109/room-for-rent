'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMarkBillAsPaid } from '../../hooks/useBills'
import { Bill, PayBillData } from '../../types/bill'
import { BillStatusBadge } from './BillStatusBadge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { Separator } from '../ui/separator'
import { 
  CreditCard, 
  Calendar, 
  Building, 
  Check, 
  X,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// Validation schema
const payBillSchema = z.object({
  paidDate: z.date(),
  notes: z.string().optional()
})

type PayBillFormValues = z.infer<typeof payBillSchema>

interface PayBillDialogProps {
  bill: Bill
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PayBillDialog({ bill, open, onOpenChange, onSuccess }: PayBillDialogProps) {
  const [confirmPay, setConfirmPay] = useState(false)

  const markAsPaid = useMarkBillAsPaid()

  // Form setup
  const form = useForm<PayBillFormValues>({
    resolver: zodResolver(payBillSchema),
    defaultValues: {
      paidDate: new Date(),
      notes: ''
    }
  })

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = form

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Handle form submission
  const onSubmit = async (data: PayBillFormValues) => {
    try {
      const payData: PayBillData = {
        paidDate: data.paidDate,
        notes: data.notes || undefined
      }

      await markAsPaid.mutateAsync({ id: bill.id, data: payData })
      onSuccess?.()
    } catch (error) {
      console.error('Payment error:', error)
    }
  }

  const primaryTenant = bill.contract.tenants[0]?.tenant

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-green-600" />
            Xác nhận Thanh toán
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Thông tin Hóa đơn
                </div>
                <BillStatusBadge status={bill.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Phòng</p>
                  <p className="font-semibold">
                    {bill.room.number} (Tầng {bill.room.floor})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kỳ hóa đơn</p>
                  <p className="font-semibold">Tháng {bill.month}/{bill.year}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Khách thuê</p>
                  <p className="font-semibold">
                    {primaryTenant?.fullName || 'Chưa có thông tin'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hạn thanh toán</p>
                  <p className="font-semibold text-orange-600">
                    {format(new Date(bill.dueDate), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Amount Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiền thuê phòng:</span>
                  <span>{formatCurrency(bill.rentAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tiền điện:</span>
                  <span>{formatCurrency(bill.electricAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tiền nước:</span>
                  <span>{formatCurrency(bill.waterAmount)}</span>
                </div>
                {bill.serviceAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Dịch vụ khác:</span>
                    <span>{formatCurrency(bill.serviceAmount)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatCurrency(bill.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Thông tin Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paidDate">Ngày thanh toán *</Label>
                  <Input
                    type="date"
                    {...register('paidDate', { 
                      setValueAs: (value) => value ? new Date(value) : undefined 
                    })}
                    value={watch('paidDate') ? format(watch('paidDate'), 'yyyy-MM-dd') : ''}
                  />
                  {errors.paidDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.paidDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    {...register('notes')}
                    placeholder="Ghi chú về thanh toán (phương thức, người thu, v.v.)"
                    rows={3}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Confirmation */}
            {!confirmPay && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Xác nhận thanh toán</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Bạn có chắc chắn muốn đánh dấu hóa đơn này là đã thanh toán? 
                      Hành động này không thể hoàn tác.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmPay(true)}
                      className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
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
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting || !confirmPay}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Xác nhận Thanh toán
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}