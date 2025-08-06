'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateBill, useUpdateBill } from '../../hooks/useBills'
import { useContracts } from '../../hooks/useContracts'
import { useRooms } from '../../hooks/useRooms'
import { Bill, BillFormData } from '../../types/bill'
import { BillStatus } from '../../../../shared/src/types/models'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { Separator } from '../ui/separator'
import { 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  Zap, 
  Droplets, 
  Settings,
  Calculator,
  Save,
  X
} from 'lucide-react'
import { format } from 'date-fns'

// Validation schema
const billSchema = z.object({
  contractId: z.string().min(1, 'Vui lòng chọn hợp đồng'),
  roomId: z.string().min(1, 'Vui lòng chọn phòng'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  rentAmount: z.number().min(0, 'Tiền thuê phải >= 0'),
  electricAmount: z.number().min(0, 'Tiền điện phải >= 0'),
  waterAmount: z.number().min(0, 'Tiền nước phải >= 0'),
  serviceAmount: z.number().min(0, 'Tiền dịch vụ phải >= 0'),
  totalAmount: z.number().min(0, 'Tổng tiền phải >= 0'),
  dueDate: z.date(),
  status: z.nativeEnum(BillStatus).optional()
})

type BillFormValues = z.infer<typeof billSchema>

interface BillFormProps {
  bill?: Bill
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BillForm({ bill, open, onOpenChange, onSuccess }: BillFormProps) {
  const [selectedContractId, setSelectedContractId] = useState<string>('')
  const [autoCalculateTotal, setAutoCalculateTotal] = useState(true)

  const isEditing = !!bill

  // Hooks
  const createBill = useCreateBill()
  const updateBill = useUpdateBill()
  const { data: contractsData } = useContracts({ status: 'ACTIVE', limit: 100 })
  const { data: roomsData } = useRooms({ status: 'OCCUPIED', limit: 100 })

  const contracts = contractsData?.data || []
  const rooms = roomsData?.data || []

  // Form setup
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      contractId: '',
      roomId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      rentAmount: 0,
      electricAmount: 0,
      waterAmount: 0,
      serviceAmount: 0,
      totalAmount: 0,
      dueDate: new Date(),
      status: BillStatus.UNPAID
    }
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = form

  // Watch form values for auto-calculation
  const watchedValues = watch(['rentAmount', 'electricAmount', 'waterAmount', 'serviceAmount'])

  // Auto-calculate total when amounts change
  useEffect(() => {
    if (autoCalculateTotal) {
      const [rent, electric, water, service] = watchedValues
      const total = (rent || 0) + (electric || 0) + (water || 0) + (service || 0)
      setValue('totalAmount', total)
    }
  }, [watchedValues, autoCalculateTotal, setValue])

  // Initialize form when editing
  useEffect(() => {
    if (bill && open) {
      reset({
        contractId: bill.contractId,
        roomId: bill.roomId,
        month: bill.month,
        year: bill.year,
        rentAmount: bill.rentAmount,
        electricAmount: bill.electricAmount,
        waterAmount: bill.waterAmount,
        serviceAmount: bill.serviceAmount,
        totalAmount: bill.totalAmount,
        dueDate: new Date(bill.dueDate),
        status: bill.status
      })
      setSelectedContractId(bill.contractId)
    } else if (!bill && open) {
      // Reset form for new bill
      const currentDate = new Date()
      reset({
        contractId: '',
        roomId: '',
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        rentAmount: 0,
        electricAmount: 0,
        waterAmount: 0,
        serviceAmount: 0,
        totalAmount: 0,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5), // 5th of next month
        status: BillStatus.UNPAID
      })
      setSelectedContractId('')
    }
  }, [bill, open, reset])

  // Handle contract selection
  const handleContractChange = (contractId: string) => {
    setSelectedContractId(contractId)
    setValue('contractId', contractId)
    
    const selectedContract = contracts.find(c => c.id === contractId)
    if (selectedContract) {
      setValue('roomId', selectedContract.roomId)
      
      // Auto-fill rent amount from room base price
      const room = rooms.find(r => r.id === selectedContract.roomId)
      if (room) {
        setValue('rentAmount', room.basePrice)
      }
    }
  }

  // Handle form submission
  const onSubmit = async (data: BillFormValues) => {
    try {
      const formData: BillFormData = {
        ...data,
        dueDate: data.dueDate
      }

      if (isEditing) {
        await updateBill.mutateAsync({ id: bill.id, data: formData })
      } else {
        await createBill.mutateAsync(formData)
      }

      onSuccess?.()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Get current month/year options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const selectedContract = contracts.find(c => c.id === selectedContractId)
  const selectedRoom = selectedContract ? rooms.find(r => r.id === selectedContract.roomId) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            {isEditing ? 'Chỉnh sửa Hóa đơn' : 'Tạo Hóa đơn mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Contract & Period */}
            <div className="space-y-6">
              {/* Contract Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Hợp đồng & Phòng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="contractId">Hợp đồng *</Label>
                    <Select 
                      value={selectedContractId} 
                      onValueChange={handleContractChange}
                      disabled={isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hợp đồng" />
                      </SelectTrigger>
                      <SelectContent>
                        {contracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{contract.contractNumber}</span>
                              <span className="text-sm text-gray-500">
                                Phòng {contract.room?.number} - {contract.tenants[0]?.tenant.fullName}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.contractId && (
                      <p className="text-sm text-red-600 mt-1">{errors.contractId.message}</p>
                    )}
                  </div>

                  {/* Selected Contract Info */}
                  {selectedContract && selectedRoom && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Phòng</p>
                          <p className="font-semibold">{selectedRoom.number} (Tầng {selectedRoom.floor})</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Giá thuê cơ bản</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(selectedRoom.basePrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Khách thuê chính</p>
                          <p className="font-semibold">
                            {selectedContract.tenants[0]?.tenant.fullName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Số điện thoại</p>
                          <p className="font-semibold">
                            {selectedContract.tenants[0]?.tenant.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Period Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Kỳ hóa đơn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="month">Tháng *</Label>
                      <Select 
                        value={watch('month')?.toString()} 
                        onValueChange={(value) => setValue('month', parseInt(value))}
                        disabled={isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tháng" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              Tháng {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.month && (
                        <p className="text-sm text-red-600 mt-1">{errors.month.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="year">Năm *</Label>
                      <Select 
                        value={watch('year')?.toString()} 
                        onValueChange={(value) => setValue('year', parseInt(value))}
                        disabled={isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn năm" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              Năm {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.year && (
                        <p className="text-sm text-red-600 mt-1">{errors.year.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Hạn thanh toán *</Label>
                    <Input
                      type="date"
                      {...register('dueDate', { 
                        setValueAs: (value) => value ? new Date(value) : undefined 
                      })}
                      value={watch('dueDate') ? format(watch('dueDate'), 'yyyy-MM-dd') : ''}
                    />
                    {errors.dueDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select 
                        value={watch('status')} 
                        onValueChange={(value) => setValue('status', value as BillStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BillStatus.UNPAID}>Chưa thanh toán</SelectItem>
                          <SelectItem value={BillStatus.PAID}>Đã thanh toán</SelectItem>
                          <SelectItem value={BillStatus.OVERDUE}>Quá hạn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Amounts */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-green-600" />
                    Chi tiết Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rent Amount */}
                  <div>
                    <Label htmlFor="rentAmount" className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-500" />
                      Tiền thuê phòng *
                    </Label>
                    <Input
                      type="number"
                      step="1000"
                      min="0"
                      {...register('rentAmount', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.rentAmount && (
                      <p className="text-sm text-red-600 mt-1">{errors.rentAmount.message}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Electric Amount */}
                  <div>
                    <Label htmlFor="electricAmount" className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Tiền điện *
                    </Label>
                    <Input
                      type="number"
                      step="1000"
                      min="0"
                      {...register('electricAmount', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.electricAmount && (
                      <p className="text-sm text-red-600 mt-1">{errors.electricAmount.message}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Water Amount */}
                  <div>
                    <Label htmlFor="waterAmount" className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Tiền nước *
                    </Label>
                    <Input
                      type="number"
                      step="1000"
                      min="0"
                      {...register('waterAmount', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.waterAmount && (
                      <p className="text-sm text-red-600 mt-1">{errors.waterAmount.message}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Service Amount */}
                  <div>
                    <Label htmlFor="serviceAmount" className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-500" />
                      Dịch vụ khác
                    </Label>
                    <Input
                      type="number"
                      step="1000"
                      min="0"
                      {...register('serviceAmount', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.serviceAmount && (
                      <p className="text-sm text-red-600 mt-1">{errors.serviceAmount.message}</p>
                    )}
                  </div>

                  <Separator className="border-2" />

                  {/* Total Amount */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Label htmlFor="totalAmount" className="flex items-center gap-2 text-lg font-bold">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Tổng cộng *
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        step="1000"
                        min="0"
                        {...register('totalAmount', { valueAsNumber: true })}
                        placeholder="0"
                        className="text-lg font-bold text-green-600"
                        readOnly={autoCalculateTotal}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoCalculateTotal(!autoCalculateTotal)}
                      >
                        {autoCalculateTotal ? 'Tự động' : 'Thủ công'}
                      </Button>
                    </div>
                    {errors.totalAmount && (
                      <p className="text-sm text-red-600 mt-1">{errors.totalAmount.message}</p>
                    )}
                    
                    {/* Display formatted total */}
                    <p className="text-sm text-green-600 mt-2">
                      {formatCurrency(watch('totalAmount') || 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

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
              disabled={isSubmitting || !selectedContractId}
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Cập nhật' : 'Tạo hóa đơn'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}