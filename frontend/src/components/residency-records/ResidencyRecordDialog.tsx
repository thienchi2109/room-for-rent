'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useCreateResidencyRecord, useUpdateResidencyRecord } from '@/hooks/useResidencyRecords'
import {
  ResidencyRecordFormData,
  ResidencyRecordWithTenant,
  RESIDENCY_TYPE_OPTIONS
} from '@/types/residencyRecord'
import { ResidencyType } from '@shared/types/models'

// Validation schema
const residencyRecordSchema = z.object({
  tenantId: z.string().min(1, 'Vui lòng chọn khách thuê'),
  type: z.nativeEnum(ResidencyType, {
    message: 'Vui lòng chọn loại bản ghi'
  }),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().optional(),
  notes: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự').optional()
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) > new Date(data.startDate)
  }
  return true
}, {
  message: 'Ngày kết thúc phải sau ngày bắt đầu',
  path: ['endDate']
})

type FormData = z.infer<typeof residencyRecordSchema>

interface ResidencyRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId?: string
  tenantName?: string
  record?: ResidencyRecordWithTenant
  mode: 'create' | 'edit'
}

export function ResidencyRecordDialog({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  record,
  mode
}: ResidencyRecordDialogProps) {
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  const createMutation = useCreateResidencyRecord()
  const updateMutation = useUpdateResidencyRecord()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    clearErrors
  } = useForm<FormData>({
    resolver: zodResolver(residencyRecordSchema),
    defaultValues: {
      tenantId: tenantId || '',
      type: ResidencyType.TEMPORARY_RESIDENCE,
      startDate: '',
      endDate: '',
      notes: ''
    }
  })

  const watchedStartDate = watch('startDate')
  const watchedEndDate = watch('endDate')

  // Reset form when dialog opens/closes or record changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && record) {
        reset({
          tenantId: record.tenantId,
          type: record.type,
          startDate: format(new Date(record.startDate), 'yyyy-MM-dd'),
          endDate: record.endDate ? format(new Date(record.endDate), 'yyyy-MM-dd') : '',
          notes: record.notes || ''
        })
      } else {
        reset({
          tenantId: tenantId || '',
          type: ResidencyType.TEMPORARY_RESIDENCE,
          startDate: '',
          endDate: '',
          notes: ''
        })
      }
    }
  }, [open, mode, record, tenantId, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const formData: ResidencyRecordFormData = {
        tenantId: data.tenantId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        notes: data.notes || undefined
      }

      if (mode === 'create') {
        await createMutation.mutateAsync(formData)
      } else if (record) {
        await updateMutation.mutateAsync({
          id: record.id,
          data: formData
        })
      }

      onOpenChange(false)
    } catch {
      // Error handling is done in the mutation hooks
    }
  }

  const handleDateSelect = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    if (date) {
      setValue(field, format(date, 'yyyy-MM-dd'))
      clearErrors(field)
    }
    if (field === 'startDate') {
      setStartDateOpen(false)
    } else {
      setEndDateOpen(false)
    }
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm bản ghi tạm trú/tạm vắng' : 'Sửa bản ghi tạm trú/tạm vắng'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Tạo bản ghi mới về tình trạng tạm trú hoặc tạm vắng của khách thuê.'
              : 'Cập nhật thông tin bản ghi tạm trú/tạm vắng.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tenant Info (read-only if tenantId provided) */}
          {tenantName && (
            <div className="space-y-2">
              <Label>Khách thuê</Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {tenantName}
              </div>
            </div>
          )}

          {/* Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Loại bản ghi *</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value as ResidencyType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại bản ghi" />
              </SelectTrigger>
              <SelectContent>
                {RESIDENCY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Ngày bắt đầu *</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchedStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedStartDate ? (
                    format(new Date(watchedStartDate), 'dd/MM/yyyy', { locale: vi })
                  ) : (
                    "Chọn ngày bắt đầu"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedStartDate ? new Date(watchedStartDate) : undefined}
                  onSelect={(date) => handleDateSelect(date, 'startDate')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && (
              <p className="text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>Ngày kết thúc</Label>
            <div className="flex gap-2">
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !watchedEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedEndDate ? (
                      format(new Date(watchedEndDate), 'dd/MM/yyyy', { locale: vi })
                    ) : (
                      "Chọn ngày kết thúc (tùy chọn)"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchedEndDate ? new Date(watchedEndDate) : undefined}
                    onSelect={(date) => handleDateSelect(date, 'endDate')}
                    disabled={(date) => 
                      watchedStartDate ? date <= new Date(watchedStartDate) : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {watchedEndDate && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setValue('endDate', '')
                    clearErrors('endDate')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {errors.endDate && (
              <p className="text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Ghi chú thêm về bản ghi này..."
              className="min-h-[80px]"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : (mode === 'create' ? 'Tạo bản ghi' : 'Cập nhật')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
