'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  useCreateContract, 
  useUpdateContract, 
  useAvailableRooms, 
  useAvailableTenants 
} from '@/hooks/useContracts'
import { ContractService } from '@/services/contractService'
import { ContractFormData, ContractWithDetails, ContractWizardData } from '@/types/contract'
import { 
  Building, 
  Users, 
  FileText, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ContractFormProps {
  contract?: ContractWithDetails
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

const STEPS = [
  { id: 1, title: 'Chọn phòng', icon: Building, description: 'Chọn phòng cho hợp đồng' },
  { id: 2, title: 'Chọn khách thuê', icon: Users, description: 'Chọn khách thuê và khách chính' },
  { id: 3, title: 'Chi tiết hợp đồng', icon: FileText, description: 'Nhập thông tin hợp đồng' },
  { id: 4, title: 'Xác nhận', icon: CheckCircle, description: 'Xem lại và xác nhận' }
]

export function ContractForm({ 
  contract, 
  open, 
  onOpenChange, 
  mode, 
  onSuccess 
}: ContractFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<ContractWizardData>({
    step: 1,
    tenantIds: [],
    contractDetails: {
      startDate: '',
      endDate: '',
      deposit: 0
    }
  })

  const { data: availableRoomsData, isLoading: roomsLoading } = useAvailableRooms(open)
  const { data: availableTenantsData, isLoading: tenantsLoading } = useAvailableTenants(open)
  const createContract = useCreateContract()
  const updateContract = useUpdateContract()

  const availableRooms = availableRoomsData?.data || []
  const availableTenants = availableTenantsData?.data || []

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === 'edit' && contract) {
      setWizardData({
        step: 3, // Skip room and tenant selection for edit
        roomId: contract.roomId,
        tenantIds: contract.tenants.map(ct => ct.tenantId),
        primaryTenantId: contract.tenants.find(ct => ct.isPrimary)?.tenantId,
        contractDetails: {
          contractNumber: contract.contractNumber,
          startDate: contract.startDate.split('T')[0],
          endDate: contract.endDate.split('T')[0],
          deposit: contract.deposit
        }
      })
      setCurrentStep(3)
    }
  }, [mode, contract])

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
      setWizardData(prev => ({ ...prev, step: currentStep + 1 }))
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setWizardData(prev => ({ ...prev, step: currentStep - 1 }))
    }
  }

  const handleRoomSelect = (roomId: string) => {
    setWizardData(prev => ({ ...prev, roomId }))
  }

  const handleTenantToggle = (tenantId: string) => {
    setWizardData(prev => {
      const newTenantIds = prev.tenantIds.includes(tenantId)
        ? prev.tenantIds.filter(id => id !== tenantId)
        : [...prev.tenantIds, tenantId]
      
      // If removing the primary tenant, clear primary selection
      let newPrimaryTenantId = prev.primaryTenantId
      if (!newTenantIds.includes(prev.primaryTenantId || '')) {
        newPrimaryTenantId = newTenantIds.length > 0 ? newTenantIds[0] : undefined
      }
      
      return {
        ...prev,
        tenantIds: newTenantIds,
        primaryTenantId: newPrimaryTenantId
      }
    })
  }

  const handlePrimaryTenantSelect = (tenantId: string) => {
    setWizardData(prev => ({ ...prev, primaryTenantId: tenantId }))
  }

  const handleContractDetailsChange = (field: string, value: string | number | Date) => {
    setWizardData(prev => ({
      ...prev,
      contractDetails: {
        ...prev.contractDetails!,
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    if (!wizardData.roomId || !wizardData.primaryTenantId || !wizardData.contractDetails) {
      return
    }

    const formData: ContractFormData = {
      contractNumber: wizardData.contractDetails.contractNumber,
      roomId: wizardData.roomId,
      startDate: wizardData.contractDetails.startDate,
      endDate: wizardData.contractDetails.endDate,
      deposit: wizardData.contractDetails.deposit,
      tenantIds: wizardData.tenantIds,
      primaryTenantId: wizardData.primaryTenantId
    }

    try {
      if (mode === 'create') {
        await createContract.mutateAsync(formData)
      } else if (contract) {
        await updateContract.mutateAsync({ id: contract.id, data: formData })
      }
      
      onOpenChange(false)
      onSuccess?.()
      
      // Reset form
      setCurrentStep(1)
      setWizardData({
        step: 1,
        tenantIds: [],
        contractDetails: {
          startDate: '',
          endDate: '',
          deposit: 0
        }
      })
    } catch (error) {
      console.error('Contract form error:', error)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return !!wizardData.roomId
      case 2:
        return wizardData.tenantIds.length > 0 && !!wizardData.primaryTenantId
      case 3:
        return !!(
          wizardData.contractDetails?.startDate &&
          wizardData.contractDetails?.endDate &&
          wizardData.contractDetails?.deposit > 0
        )
      default:
        return true
    }
  }

  const selectedRoom = availableRooms.find(room => room.id === wizardData.roomId)
  const selectedTenants = availableTenants.filter(tenant => 
    wizardData.tenantIds.includes(tenant.id)
  )

  const isLoading = createContract.isPending || updateContract.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Tạo hợp đồng mới' : 'Chỉnh sửa hợp đồng'}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        {mode === 'create' && (
          <div className="flex items-center justify-between mb-8 px-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isActive ? "border-blue-500 bg-blue-500 text-white" :
                    isCompleted ? "border-green-500 bg-green-500 text-white" :
                    "border-gray-300 bg-white text-gray-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-12 sm:w-16 h-0.5 mx-2 sm:mx-4 transition-colors",
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[400px] px-4">
          {/* Step 1: Room Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Chọn phòng</h3>
                <p className="text-gray-600">Chọn phòng trống để tạo hợp đồng</p>
              </div>

              {roomsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableRooms.map((room) => (
                    <Card 
                      key={room.id}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:shadow-md",
                        wizardData.roomId === room.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      )}
                      onClick={() => handleRoomSelect(room.id)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Phòng {room.number}</h4>
                          <Badge variant={room.isAvailable ? "default" : "secondary"}>
                            {room.isAvailable ? "Có sẵn" : "Đã thuê"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Tầng: {room.floor}</div>
                          <div>Diện tích: {room.area}m²</div>
                          <div>Sức chứa: {room.capacity} người</div>
                          <div className="font-medium text-gray-900">
                            Giá: {room.basePrice.toLocaleString('vi-VN')} ₫/tháng
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Tenant Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Chọn khách thuê</h3>
                <p className="text-gray-600">Chọn khách thuê và chỉ định khách chính</p>
              </div>

              {tenantsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {availableTenants.map((tenant) => {
                    const isSelected = wizardData.tenantIds.includes(tenant.id)
                    const isPrimary = wizardData.primaryTenantId === tenant.id
                    
                    return (
                      <Card 
                        key={tenant.id}
                        className={cn(
                          "p-4 transition-all",
                          isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleTenantToggle(tenant.id)}
                            />
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{tenant.fullName}</h4>
                                {isPrimary && (
                                  <Badge variant="default">Khách chính</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {tenant.phone}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {tenant.hometown}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {isSelected && (
                            <Button
                              variant={isPrimary ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePrimaryTenantSelect(tenant.id)}
                            >
                              {isPrimary ? "Khách chính" : "Chọn làm khách chính"}
                            </Button>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Contract Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Chi tiết hợp đồng</h3>
                <p className="text-gray-600">Nhập thông tin chi tiết hợp đồng</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contractNumber">Số hợp đồng (tùy chọn)</Label>
                    <Input
                      id="contractNumber"
                      placeholder="Để trống để tự động tạo"
                      value={wizardData.contractDetails?.contractNumber || ''}
                      onChange={(e) => handleContractDetailsChange('contractNumber', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={wizardData.contractDetails?.startDate || ''}
                      onChange={(e) => handleContractDetailsChange('startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Ngày kết thúc *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={wizardData.contractDetails?.endDate || ''}
                      onChange={(e) => handleContractDetailsChange('endDate', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="deposit">Tiền cọc (VNĐ) *</Label>
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="0"
                      value={wizardData.contractDetails?.deposit || ''}
                      onChange={(e) => handleContractDetailsChange('deposit', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Xem trước</h4>

                  {selectedRoom && (
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">Phòng đã chọn</h5>
                      <div className="space-y-1 text-sm">
                        <div>Phòng: {selectedRoom.number}</div>
                        <div>Tầng: {selectedRoom.floor}</div>
                        <div>Diện tích: {selectedRoom.area}m²</div>
                        <div>Giá thuê: {selectedRoom.basePrice.toLocaleString('vi-VN')} ₫/tháng</div>
                      </div>
                    </Card>
                  )}

                  {selectedTenants.length > 0 && (
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">Khách thuê ({selectedTenants.length})</h5>
                      <div className="space-y-2">
                        {selectedTenants.map((tenant) => (
                          <div key={tenant.id} className="flex items-center justify-between text-sm">
                            <span>{tenant.fullName}</span>
                            {tenant.id === wizardData.primaryTenantId && (
                              <Badge variant="outline" className="text-xs">Chính</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {wizardData.contractDetails?.startDate && wizardData.contractDetails?.endDate && (
                    <Card className="p-4">
                      <h5 className="font-medium mb-2">Thời hạn hợp đồng</h5>
                      <div className="text-sm space-y-1">
                        <div>Từ: {format(new Date(wizardData.contractDetails.startDate), 'dd/MM/yyyy', { locale: vi })}</div>
                        <div>Đến: {format(new Date(wizardData.contractDetails.endDate), 'dd/MM/yyyy', { locale: vi })}</div>
                        <div className="font-medium">
                          Thời gian: {ContractService.getContractDuration(
                            wizardData.contractDetails.startDate,
                            wizardData.contractDetails.endDate
                          )} ngày
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Xác nhận thông tin</h3>
                <p className="text-gray-600">Kiểm tra lại thông tin trước khi tạo hợp đồng</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contract Summary */}
                <div className="space-y-4">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Thông tin hợp đồng
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số hợp đồng:</span>
                        <span className="font-medium">
                          {wizardData.contractDetails?.contractNumber || 'Tự động tạo'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày bắt đầu:</span>
                        <span className="font-medium">
                          {wizardData.contractDetails?.startDate &&
                            format(new Date(wizardData.contractDetails.startDate), 'dd/MM/yyyy', { locale: vi })
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày kết thúc:</span>
                        <span className="font-medium">
                          {wizardData.contractDetails?.endDate &&
                            format(new Date(wizardData.contractDetails.endDate), 'dd/MM/yyyy', { locale: vi })
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiền cọc:</span>
                        <span className="font-medium">
                          {wizardData.contractDetails?.deposit?.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Thông tin phòng
                    </h4>
                    {selectedRoom && (
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số phòng:</span>
                          <span className="font-medium">{selectedRoom.number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tầng:</span>
                          <span className="font-medium">{selectedRoom.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Diện tích:</span>
                          <span className="font-medium">{selectedRoom.area}m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sức chứa:</span>
                          <span className="font-medium">{selectedRoom.capacity} người</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giá thuê:</span>
                          <span className="font-medium">{selectedRoom.basePrice.toLocaleString('vi-VN')} ₫/tháng</span>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Tenants Summary */}
                <div className="space-y-4">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Khách thuê ({selectedTenants.length})
                    </h4>
                    <div className="space-y-4">
                      {selectedTenants.map((tenant) => (
                        <div key={tenant.id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{tenant.fullName}</span>
                            {tenant.id === wizardData.primaryTenantId && (
                              <Badge variant="default" className="text-xs">Khách chính</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>CCCD: {tenant.idCard}</div>
                            <div>SĐT: {tenant.phone}</div>
                            <div>Quê quán: {tenant.hometown}</div>
                            <div>Ngày sinh: {format(new Date(tenant.dateOfBirth), 'dd/MM/yyyy', { locale: vi })}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Summary totals */}
                  <Card className="p-6 bg-blue-50 border-blue-200">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Tổng kết
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span>Tiền thuê hàng tháng:</span>
                        <span className="font-bold text-blue-600">
                          {selectedRoom?.basePrice.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span>Tiền cọc:</span>
                        <span className="font-bold text-green-600">
                          {wizardData.contractDetails?.deposit?.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-xl font-bold">
                          <span>Tổng tiền ban đầu:</span>
                          <span className="text-red-600">
                            {((selectedRoom?.basePrice || 0) + (wizardData.contractDetails?.deposit || 0)).toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t px-4 mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || (mode === 'edit' && currentStep === 3)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
              >
                Tiếp theo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceedToNext() || isLoading}
              >
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {mode === 'create' ? 'Tạo hợp đồng' : 'Cập nhật hợp đồng'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
