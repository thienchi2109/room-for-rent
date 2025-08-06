'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { AnimatedContent } from '@/components/ui/animated-content'
import { useCheckInContract } from '@/hooks/useContracts'
import { ContractWithDetails } from '@/types/contract'
import { 
  Building, 
  Users, 
  Calendar, 
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Home,
  Clock,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
// import { cn } from '@/lib/utils' // Removed unused import

interface CheckInDialogProps {
  contract: ContractWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const CHECKIN_STEPS = [
  {
    id: 1,
    title: 'Xác nhận thông tin',
    description: 'Kiểm tra thông tin hợp đồng và phòng',
    icon: Building
  },
  {
    id: 2,
    title: 'Xác nhận check-in',
    description: 'Hoàn tất quá trình check-in',
    icon: CheckCircle
  }
]

export function CheckInDialog({ 
  contract, 
  open, 
  onOpenChange, 
  onSuccess 
}: CheckInDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isConfirming, setIsConfirming] = useState(false)
  const checkInMutation = useCheckInContract()

  if (!contract) return null

  const primaryTenant = contract.tenants.find(ct => ct.isPrimary)
  const otherTenants = contract.tenants.filter(ct => !ct.isPrimary)
  const isExpired = new Date(contract.endDate) <= new Date()
  const daysUntilExpiry = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const handleNext = () => {
    if (currentStep < CHECKIN_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCheckIn = async () => {
    setIsConfirming(true)
    try {
      await checkInMutation.mutateAsync(contract.id)
      onOpenChange(false)
      onSuccess?.()
      // Reset state
      setCurrentStep(1)
      setIsConfirming(false)
    } catch {
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setCurrentStep(1)
    setIsConfirming(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 rounded-2xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-white/80 backdrop-blur-sm border-b border-blue-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                Check-in Hợp đồng
              </DialogTitle>
              <p className="text-gray-600 mt-1 font-mono text-sm">{contract.contractNumber}</p>
            </div>
            
            {/* Step Indicator */}
            <ProgressSteps 
              steps={CHECKIN_STEPS} 
              currentStep={currentStep} 
              variant="compact"
            />
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Contract Information */}
          {currentStep === 1 && (
            <AnimatedContent className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Xác nhận thông tin hợp đồng</h3>
                <p className="text-gray-600">Vui lòng kiểm tra kỹ thông tin trước khi thực hiện check-in</p>
              </div>

              {/* Warning if expired */}
              {isExpired && (
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-800">Hợp đồng đã hết hạn</h4>
                      <p className="text-red-700 text-sm">
                        Hợp đồng đã hết hạn từ {format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Contract expiry warning */}
              {!isExpired && daysUntilExpiry <= 30 && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Hợp đồng sắp hết hạn</h4>
                      <p className="text-yellow-700 text-sm">
                        Hợp đồng sẽ hết hạn trong {daysUntilExpiry} ngày ({format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })})
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contract Details */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Thông tin hợp đồng
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phòng:</span>
                      <Badge variant="outline" className="font-mono">
                        {contract.room.number} (Tầng {contract.room.floor})
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Diện tích:</span>
                      <span className="font-medium">{contract.room.area}m²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sức chứa:</span>
                      <span className="font-medium">{contract.room.capacity} người</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giá thuê:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(contract.room.basePrice)}/tháng</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tiền cọc:</span>
                      <span className="font-bold text-green-600">{formatCurrency(contract.deposit)}</span>
                    </div>
                  </div>
                </Card>

                {/* Tenant Information */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Khách thuê ({contract.tenants.length})
                  </h4>
                  <div className="space-y-4">
                    {/* Primary Tenant */}
                    {primaryTenant && (
                      <div className="border-l-4 border-blue-500 pl-4 bg-blue-50/50 py-2 rounded-r">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{primaryTenant.tenant.fullName}</span>
                          <Badge variant="default" className="text-xs">Khách chính</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>CCCD: {primaryTenant.tenant.idCard}</div>
                          <div>SĐT: {primaryTenant.tenant.phone}</div>
                          <div>Quê quán: {primaryTenant.tenant.hometown}</div>
                        </div>
                      </div>
                    )}

                    {/* Other Tenants */}
                    {otherTenants.map((ct) => (
                      <div key={ct.tenantId} className="border-l-4 border-gray-300 pl-4 py-2">
                        <div className="font-medium text-gray-900 mb-1">{ct.tenant.fullName}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>CCCD: {ct.tenant.idCard}</div>
                          <div>SĐT: {ct.tenant.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Contract Timeline */}
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Thời hạn hợp đồng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Ngày bắt đầu</div>
                    <div className="font-bold text-blue-600">
                      {format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Ngày kết thúc</div>
                    <div className="font-bold text-green-600">
                      {format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Thời hạn</div>
                    <div className="font-bold text-purple-600">
                      {Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedContent>
          )}

          {/* Step 2: Confirmation */}
          {currentStep === 2 && (
            <AnimatedContent className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Xác nhận Check-in</h3>
                <p className="text-gray-600">Bạn có chắc chắn muốn thực hiện check-in cho hợp đồng này?</p>
              </div>

              {/* Summary Card */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Thông tin cơ bản
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hợp đồng:</span>
                        <span className="font-mono font-medium">{contract.contractNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phòng:</span>
                        <span className="font-medium">{contract.room.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Khách chính:</span>
                        <span className="font-medium">{primaryTenant?.tenant.fullName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Thông tin tài chính
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiền thuê/tháng:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(contract.room.basePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiền cọc:</span>
                        <span className="font-bold text-green-600">{formatCurrency(contract.deposit)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-900 font-medium">Tổng ban đầu:</span>
                        <span className="font-bold text-red-600">
                          {formatCurrency(contract.room.basePrice + contract.deposit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* What happens next */}
              <Card className="p-6 bg-green-50 border-green-200">
                <h5 className="font-semibold text-green-800 mb-3">Sau khi check-in:</h5>
                <ul className="space-y-2 text-sm text-green-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Hợp đồng sẽ được kích hoạt (trạng thái ACTIVE)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Phòng sẽ chuyển sang trạng thái &ldquo;Đã thuê&rdquo;
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Bắt đầu tính tiền thuê từ hôm nay
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Khách thuê có thể chính thức vào ở
                  </li>
                </ul>
              </Card>
            </AnimatedContent>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? handleClose : handlePrevious}
              disabled={isConfirming}
              className="px-6"
            >
              {currentStep === 1 ? 'Hủy' : 'Quay lại'}
            </Button>

            <div className="flex gap-3">
              {currentStep < CHECKIN_STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={isExpired}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  Tiếp theo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCheckIn}
                  disabled={isConfirming || isExpired}
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  {isConfirming && <LoadingSpinner size="sm" className="mr-2" />}
                  {isConfirming ? 'Đang xử lý...' : 'Xác nhận Check-in'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}