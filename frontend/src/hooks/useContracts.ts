import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { ContractService } from '@/services/contractService'
import type { 
  ContractFormData, 
  ContractFilters,
  ContractStatusUpdateData
} from '@/types/contract'

// Query keys factory
export const contractQueryKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractQueryKeys.all, 'list'] as const,
  list: (filters?: ContractFilters) => [...contractQueryKeys.lists(), filters] as const,
  details: () => [...contractQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractQueryKeys.details(), id] as const,
  stats: () => [...contractQueryKeys.all, 'stats'] as const,
  availableRooms: () => [...contractQueryKeys.all, 'availableRooms'] as const,
  availableTenants: () => [...contractQueryKeys.all, 'availableTenants'] as const,
}

// Hook to get contracts with filters
export function useContracts(filters?: ContractFilters) {
  return useQuery({
    queryKey: contractQueryKeys.list(filters),
    queryFn: () => ContractService.getAll(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get a specific contract
export function useContract(id: string, enabled = true) {
  return useQuery({
    queryKey: contractQueryKeys.detail(id),
    queryFn: () => ContractService.getById(id),
    enabled: !!id && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to get contract statistics
export function useContractStats() {
  return useQuery({
    queryKey: contractQueryKeys.stats(),
    queryFn: () => ContractService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  })
}

// Hook to get available rooms for contract creation
export function useAvailableRooms(enabled = true) {
  return useQuery({
    queryKey: contractQueryKeys.availableRooms(),
    queryFn: () => ContractService.getAvailableRooms(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to get available tenants for contract
export function useAvailableTenants(enabled = true) {
  return useQuery({
    queryKey: contractQueryKeys.availableTenants(),
    queryFn: () => ContractService.getAvailableTenants(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  })
}

// Hook to create a contract
export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ContractFormData) => ContractService.create(data),
    onSuccess: (response) => {
      // Invalidate and refetch contracts list
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      
      // Invalidate contract stats
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.stats() })
      
      // Invalidate available rooms (room status might have changed)
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.availableRooms() })
      
      // Invalidate rooms list (room status updated)
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      
      toast.success(`Hợp đồng ${response.data.contractNumber} đã được tạo thành công!`)
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi tạo hợp đồng'
      toast.error(`Lỗi tạo hợp đồng: ${message}`)
    },
  })
}

// Hook to update a contract
export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContractFormData> }) => 
      ContractService.update(id, data),
    onSuccess: (response, variables) => {
      // Update specific contract in cache
      queryClient.setQueryData(
        contractQueryKeys.detail(variables.id),
        response
      )
      
      // Invalidate contracts list to reflect changes
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      
      // Invalidate contract stats
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.stats() })
      
      toast.success(`Hợp đồng ${response.data.contractNumber} đã được cập nhật!`)
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi cập nhật hợp đồng'
      toast.error(`Lỗi cập nhật hợp đồng: ${message}`)
    },
  })
}

// Hook to update contract status
export function useUpdateContractStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContractStatusUpdateData }) => 
      ContractService.updateStatus(id, data),
    onSuccess: (response, variables) => {
      // Update specific contract in cache
      queryClient.setQueryData(
        contractQueryKeys.detail(variables.id),
        response
      )
      
      // Invalidate contracts list to reflect changes
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      
      // Invalidate contract stats
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.stats() })
      
      // Invalidate rooms list (room status might have changed)
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      
      const statusLabel = ContractService.getContractStatusLabel(variables.data.status)
      toast.success(`Trạng thái hợp đồng đã được cập nhật thành "${statusLabel}"`)
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi cập nhật trạng thái hợp đồng'
      toast.error(`Lỗi cập nhật trạng thái: ${message}`)
    },
  })
}

// Hook to delete a contract
export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ContractService.delete(id),
    onSuccess: (response, variables) => {
      // Remove contract from cache
      queryClient.removeQueries({ queryKey: contractQueryKeys.detail(variables) })
      
      // Invalidate contracts list
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      
      // Invalidate contract stats
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.stats() })
      
      // Invalidate rooms list (room status might have changed)
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      
      toast.success('Hợp đồng đã được xóa thành công!')
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi xóa hợp đồng'
      toast.error(`Lỗi xóa hợp đồng: ${message}`)
    },
  })
}

// Hook to check-in contract
export function useCheckInContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ContractService.checkIn(id),
    onSuccess: (response, variables) => {
      // Update specific contract in cache
      queryClient.setQueryData(
        contractQueryKeys.detail(variables),
        response
      )
      
      // Invalidate contracts list
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      
      // Invalidate contract stats
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.stats() })
      
      // Invalidate rooms list (room status changed to OCCUPIED)
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      
      toast.success(`Hợp đồng ${response.data.contractNumber} đã được check-in thành công!`)
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi check-in hợp đồng'
      toast.error(`Lỗi check-in: ${message}`)
    },
  })
}

// Hook to check-out contract
export function useCheckOutContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { reason?: string } }) => 
      ContractService.checkOut(id, data),
    onSuccess: (response, variables) => {
      // Update specific contract in cache
      queryClient.setQueryData(
        contractQueryKeys.detail(variables.id),
        response
      )
      
      // Invalidate contracts list
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.lists() })
      
      // Invalidate contract stats
      queryClient.invalidateQueries({ queryKey: contractQueryKeys.stats() })
      
      // Invalidate rooms list (room status changed to AVAILABLE)
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      
      toast.success(`Hợp đồng ${response.data.contractNumber} đã được check-out thành công!`)
    },
    onError: (error: Error) => {
      const message = error.message || 'Có lỗi xảy ra khi check-out hợp đồng'
      toast.error(`Lỗi check-out: ${message}`)
    },
  })
}
