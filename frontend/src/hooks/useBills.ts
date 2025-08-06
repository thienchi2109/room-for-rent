import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { billService } from '../services/billService'
import { BillFilters, BillFormData, PayBillData } from '../types/bill'
import { toast } from 'sonner'

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

// Query keys
export const billKeys = {
  all: ['bills'] as const,
  lists: () => [...billKeys.all, 'list'] as const,
  list: (filters?: BillFilters) => [...billKeys.lists(), filters] as const,
  details: () => [...billKeys.all, 'detail'] as const,
  detail: (id: string) => [...billKeys.details(), id] as const,
  infinite: (filters?: BillFilters) => [...billKeys.all, 'infinite', filters] as const,
}

// Get bills with pagination
export function useBills(filters?: BillFilters) {
  return useQuery({
    queryKey: billKeys.list(filters),
    queryFn: () => billService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get infinite bills for mobile
export function useInfiniteBills(filters?: BillFilters) {
  return useInfiniteQuery({
    queryKey: billKeys.infinite(filters),
    queryFn: ({ pageParam = 1 }) => 
      billService.getAll({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

// Get bill by ID
export function useBill(id: string) {
  return useQuery({
    queryKey: billKeys.detail(id),
    queryFn: () => billService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create bill mutation
export function useCreateBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BillFormData) => billService.create(data),
    onSuccess: () => {
      // Invalidate and refetch bills list
      queryClient.invalidateQueries({ queryKey: billKeys.lists() })
      queryClient.invalidateQueries({ queryKey: billKeys.infinite() })
      
      toast.success('Hóa đơn đã được tạo thành công')
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || 'Không thể tạo hóa đơn'
      toast.error(message)
    },
  })
}

// Update bill mutation
export function useUpdateBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BillFormData> }) =>
      billService.update(id, data),
    onSuccess: (updatedBill) => {
      // Update the specific bill in cache
      queryClient.setQueryData(billKeys.detail(updatedBill.id), updatedBill)
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: billKeys.lists() })
      queryClient.invalidateQueries({ queryKey: billKeys.infinite() })
      
      toast.success('Hóa đơn đã được cập nhật')
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || 'Không thể cập nhật hóa đơn'
      toast.error(message)
    },
  })
}

// Delete bill mutation
export function useDeleteBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: billKeys.detail(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: billKeys.lists() })
      queryClient.invalidateQueries({ queryKey: billKeys.infinite() })
      
      toast.success('Hóa đơn đã được xóa')
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || 'Không thể xóa hóa đơn'
      toast.error(message)
    },
  })
}

// Mark bill as paid mutation
export function useMarkBillAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: PayBillData }) =>
      billService.markAsPaid(id, data),
    onSuccess: (updatedBill) => {
      // Update the specific bill in cache
      queryClient.setQueryData(billKeys.detail(updatedBill.id), updatedBill)
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: billKeys.lists() })
      queryClient.invalidateQueries({ queryKey: billKeys.infinite() })
      
      toast.success('Hóa đơn đã được đánh dấu là đã thanh toán')
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán'
      toast.error(message)
    },
  })
}

// Generate bills mutation
export function useGenerateBills() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      billService.generateBills(month, year),
    onSuccess: (result) => {
      // Invalidate all bill queries
      queryClient.invalidateQueries({ queryKey: billKeys.all })
      
      toast.success(`Đã tạo thành công ${result.data.generated} hóa đơn cho tháng ${result.data.month}/${result.data.year}`)
    },
    onError: (error: unknown) => {
      const message = (error as ApiError)?.response?.data?.message || 'Không thể tạo hóa đơn tự động'
      toast.error(message)
    },
  })
}