'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRange, DateRangePreset } from '@/types/report'
import { dateRangeOptions, getDateRangeFromPreset, getPresetFromDateRange } from '@/lib/dateRangeUtils'

interface DateRangePickerProps {
  value: DateRange
  onChange: (dateRange: DateRange) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>(() => {
    return getPresetFromDateRange(value) || 'custom'
  })

  const handlePresetChange = (preset: DateRangePreset) => {
    setSelectedPreset(preset)
    if (preset !== 'custom') {
      const newRange = getDateRangeFromPreset(preset)
      onChange(newRange)
    }
  }

  const handleCustomDateChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      const newRange: DateRange = {
        startDate: range.from,
        endDate: range.to
      }
      onChange(newRange)
      setSelectedPreset('custom')
      setIsOpen(false)
    }
  }

  const formatDisplayText = () => {
    if (selectedPreset !== 'custom') {
      const option = dateRangeOptions.find(opt => opt.value === selectedPreset)
      return option?.label || 'Chọn khoảng thời gian'
    }
    
    return `${format(value.startDate, 'dd/MM/yyyy', { locale: vi })} - ${format(value.endDate, 'dd/MM/yyyy', { locale: vi })}`
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Preset Selection */}
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger>
          <SelectValue placeholder="Chọn khoảng thời gian" />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Date Range Picker */}
      {selectedPreset === 'custom' && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDisplayText()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value.startDate}
              selected={{
                from: value.startDate,
                to: value.endDate
              }}
              onSelect={handleCustomDateChange}
              numberOfMonths={2}
              locale={vi}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Display current selection */}
      {selectedPreset !== 'custom' && (
        <div className="text-sm text-muted-foreground">
          {format(value.startDate, 'dd/MM/yyyy', { locale: vi })} - {format(value.endDate, 'dd/MM/yyyy', { locale: vi })}
        </div>
      )}
    </div>
  )
}
