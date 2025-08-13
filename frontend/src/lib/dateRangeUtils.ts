import { DateRange, DateRangePreset, DateRangeOption } from '@/types/report'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays, subWeeks, subMonths, subQuarters, subYears } from 'date-fns'

/**
 * Get date range based on preset
 */
export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const now = new Date()
  
  switch (preset) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now)
      }
      
    case 'yesterday':
      const yesterday = subDays(now, 1)
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday)
      }
      
    case 'this_week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        endDate: endOfWeek(now, { weekStartsOn: 1 })
      }
      
    case 'last_week':
      const lastWeek = subWeeks(now, 1)
      return {
        startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        endDate: endOfWeek(lastWeek, { weekStartsOn: 1 })
      }
      
    case 'this_month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      }
      
    case 'last_month':
      const lastMonth = subMonths(now, 1)
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      }
      
    case 'this_quarter':
      return {
        startDate: startOfQuarter(now),
        endDate: endOfQuarter(now)
      }
      
    case 'last_quarter':
      const lastQuarter = subQuarters(now, 1)
      return {
        startDate: startOfQuarter(lastQuarter),
        endDate: endOfQuarter(lastQuarter)
      }
      
    case 'this_year':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now)
      }
      
    case 'last_year':
      const lastYear = subYears(now, 1)
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear)
      }
      
    default:
      // Default to this month
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      }
  }
}

/**
 * Available date range options
 */
export const dateRangeOptions: DateRangeOption[] = [
  {
    label: 'Hôm nay',
    value: 'today',
    getDateRange: () => getDateRangeFromPreset('today')
  },
  {
    label: 'Hôm qua',
    value: 'yesterday',
    getDateRange: () => getDateRangeFromPreset('yesterday')
  },
  {
    label: 'Tuần này',
    value: 'this_week',
    getDateRange: () => getDateRangeFromPreset('this_week')
  },
  {
    label: 'Tuần trước',
    value: 'last_week',
    getDateRange: () => getDateRangeFromPreset('last_week')
  },
  {
    label: 'Tháng này',
    value: 'this_month',
    getDateRange: () => getDateRangeFromPreset('this_month')
  },
  {
    label: 'Tháng trước',
    value: 'last_month',
    getDateRange: () => getDateRangeFromPreset('last_month')
  },
  {
    label: 'Quý này',
    value: 'this_quarter',
    getDateRange: () => getDateRangeFromPreset('this_quarter')
  },
  {
    label: 'Quý trước',
    value: 'last_quarter',
    getDateRange: () => getDateRangeFromPreset('last_quarter')
  },
  {
    label: 'Năm này',
    value: 'this_year',
    getDateRange: () => getDateRangeFromPreset('this_year')
  },
  {
    label: 'Năm trước',
    value: 'last_year',
    getDateRange: () => getDateRangeFromPreset('last_year')
  },
  {
    label: 'Tùy chọn',
    value: 'custom',
    getDateRange: () => getDateRangeFromPreset('this_month') // Default fallback
  }
]

/**
 * Format date range for display
 */
export function formatDateRange(dateRange: DateRange): string {
  const startDate = dateRange.startDate.toLocaleDateString('vi-VN')
  const endDate = dateRange.endDate.toLocaleDateString('vi-VN')
  
  if (startDate === endDate) {
    return startDate
  }
  
  return `${startDate} - ${endDate}`
}

/**
 * Check if two date ranges are equal
 */
export function isDateRangeEqual(range1: DateRange, range2: DateRange): boolean {
  return range1.startDate.getTime() === range2.startDate.getTime() &&
         range1.endDate.getTime() === range2.endDate.getTime()
}

/**
 * Get preset from date range (if matches)
 */
export function getPresetFromDateRange(dateRange: DateRange): DateRangePreset | null {
  for (const option of dateRangeOptions) {
    if (option.value === 'custom') continue
    
    const presetRange = option.getDateRange()
    if (isDateRangeEqual(dateRange, presetRange)) {
      return option.value
    }
  }
  
  return null
}
