import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { TenantService } from '@/services/tenantService'
import type { 
  TenantFormData, 
  TenantFilters 
} from '@/types/tenant'

// Query keys factory
export const tenantQueryKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantQueryKeys.all, 'list'] as const,
  list: (filters?: TenantFilters) => [...tenantQueryKeys.lists(), filters] as const,
  details: () => [...tenantQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantQueryKeys.details(), id] as const,
  history: (id: string, page?: number) => [...tenantQueryKeys.all, 'history', id, page] as const,
}

// Hook to get tenants with filters
export function useTenants(filters?: TenantFilters) {
  return useQuery({
    queryKey: tenantQueryKeys.list(filters),
    queryFn: () => TenantService.getAll(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get a specific tenant
export function useTenant(id: string, enabled = true) {
  return useQuery({
    queryKey: tenantQueryKeys.detail(id),
    queryFn: () => TenantService.getById(id),
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to get tenant rental history
export function useTenantHistory(id: string, page = 1, limit = 10, enabled = true) {
  return useQuery({
    queryKey: tenantQueryKeys.history(id, page),
    queryFn: () => TenantService.getHistory(id, page, limit),
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to create a tenant
export function useCreateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TenantFormData) => TenantService.create(data),
    onSuccess: (response) => {
      // Invalidate and refetch tenants list
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() })
      
      toast.success(`Khách thuê ${response.data.fullName} đã được thêm thành công!`)
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi thêm khách thuê'
      toast.error(`Lỗi thêm khách thuê: ${message}`)
    },
  })
}

// Hook to update a tenant
export function useUpdateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TenantFormData> }) => 
      TenantService.update(id, data),
    onSuccess: (response, variables) => {
      // Update specific tenant in cache
      queryClient.setQueryData(
        tenantQueryKeys.detail(variables.id),
        response
      )
      
      // Invalidate tenants list to reflect changes
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() })
      
      toast.success(`Thông tin khách thuê ${response.data.fullName} đã được cập nhật!`)
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi cập nhật khách thuê'
      toast.error(`Lỗi cập nhật khách thuê: ${message}`)
    },
  })
}

// Hook to delete a tenant
export function useDeleteTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TenantService.delete(id),
    onSuccess: (response, variables) => {
      // Remove tenant from cache
      queryClient.removeQueries({ queryKey: tenantQueryKeys.detail(variables) })
      
      // Invalidate tenants list
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() })
      
      toast.success('Khách thuê đã được xóa thành công!')
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi xóa khách thuê'
      toast.error(`Lỗi xóa khách thuê: ${message}`)
    },
  })
}