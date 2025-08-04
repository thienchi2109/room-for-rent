import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ResidencyRecordService } from '@/services/residencyRecordService'
import {
  ResidencyRecordFilters,
  ResidencyRecordFormData
} from '@/types/residencyRecord'

// Query key factory for residency records
export const residencyRecordQueryKeys = {
  all: ['residencyRecords'] as const,
  lists: () => [...residencyRecordQueryKeys.all, 'list'] as const,
  list: (filters?: ResidencyRecordFilters) => [...residencyRecordQueryKeys.lists(), filters] as const,
  details: () => [...residencyRecordQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...residencyRecordQueryKeys.details(), id] as const,
  byTenant: (tenantId: string) => [...residencyRecordQueryKeys.all, 'tenant', tenantId] as const,
}

// Hook to get residency records with filters
export function useResidencyRecords(filters?: ResidencyRecordFilters) {
  return useQuery({
    queryKey: residencyRecordQueryKeys.list(filters),
    queryFn: () => ResidencyRecordService.getAll(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get a specific residency record
export function useResidencyRecord(id: string, enabled = true) {
  return useQuery({
    queryKey: residencyRecordQueryKeys.detail(id),
    queryFn: () => ResidencyRecordService.getById(id),
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to get residency records for a specific tenant
export function useResidencyRecordsByTenant(tenantId: string, filters?: Omit<ResidencyRecordFilters, 'tenantId'>, enabled = true) {
  return useQuery({
    queryKey: residencyRecordQueryKeys.byTenant(tenantId),
    queryFn: () => ResidencyRecordService.getByTenantId(tenantId, filters),
    enabled: !!tenantId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to create a residency record
export function useCreateResidencyRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ResidencyRecordFormData) => ResidencyRecordService.create(data),
    onSuccess: (response) => {
      // Invalidate and refetch residency records lists
      queryClient.invalidateQueries({ queryKey: residencyRecordQueryKeys.lists() })
      
      // Invalidate tenant-specific residency records
      queryClient.invalidateQueries({ 
        queryKey: residencyRecordQueryKeys.byTenant(response.data.tenantId) 
      })
      
      // Invalidate tenant details to refresh residency records in tenant profile
      queryClient.invalidateQueries({ 
        queryKey: ['tenants', 'detail', response.data.tenantId] 
      })
      
      toast.success('Bản ghi tạm trú/tạm vắng đã được tạo thành công!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi tạo bản ghi: ${error.message}`)
    },
  })
}

// Hook to update a residency record
export function useUpdateResidencyRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ResidencyRecordFormData> }) => 
      ResidencyRecordService.update(id, data),
    onSuccess: (response, variables) => {
      // Update specific residency record in cache
      queryClient.setQueryData(
        residencyRecordQueryKeys.detail(variables.id),
        response
      )
      
      // Invalidate residency records lists
      queryClient.invalidateQueries({ queryKey: residencyRecordQueryKeys.lists() })
      
      // Invalidate tenant-specific residency records
      queryClient.invalidateQueries({ 
        queryKey: residencyRecordQueryKeys.byTenant(response.data.tenantId) 
      })
      
      // Invalidate tenant details
      queryClient.invalidateQueries({ 
        queryKey: ['tenants', 'detail', response.data.tenantId] 
      })
      
      toast.success('Bản ghi tạm trú/tạm vắng đã được cập nhật!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi cập nhật bản ghi: ${error.message}`)
    },
  })
}

// Hook to delete a residency record
export function useDeleteResidencyRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ResidencyRecordService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove residency record from cache
      queryClient.removeQueries({ queryKey: residencyRecordQueryKeys.detail(deletedId) })
      
      // Invalidate residency records lists
      queryClient.invalidateQueries({ queryKey: residencyRecordQueryKeys.lists() })
      
      // Invalidate all tenant-specific residency records (we don't know which tenant)
      queryClient.invalidateQueries({ 
        queryKey: [...residencyRecordQueryKeys.all, 'tenant'] 
      })
      
      // Invalidate all tenant details
      queryClient.invalidateQueries({ 
        queryKey: ['tenants', 'detail'] 
      })
      
      toast.success('Bản ghi tạm trú/tạm vắng đã được xóa!')
    },
    onError: (error: Error) => {
      toast.error(`Lỗi xóa bản ghi: ${error.message}`)
    },
  })
}
