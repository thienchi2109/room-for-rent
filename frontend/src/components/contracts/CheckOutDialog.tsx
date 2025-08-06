'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProgressSteps } from '@/components/ui/progress-steps'
import { AnimatedContent } from '@/components/ui/animated-content'
import { useCheckOutContract } from '@/hooks/useContracts'
import { ContractWithDetails } from '@/types/contract'
import { 
  Building, 
  Users, 
  CreditCard,
  LogOut,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Receipt,
  DollarSign,
  Zap,
  Droplets
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface CheckOutDialogProps {
  contract: ContractWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FinalBillPreview {
  month: number
  year: number
  rentAmount: number
  electricConsumption: number
  electricAmount: number
  waterConsumption: number
  waterAmount: number
  serviceAmount: number
  totalAmount: number
  daysUsed: number
  totalDays: number
}

const CHECKOUT_STEPS = [
  {
    id: 1,
    title: 'Kiểm tra hóa đơn',
    description: 'Xác nhận tất cả hóa đơn đã thanh toán',
    icon: Receipt
  },
  {
    id: 2,
    title: 'Hóa đơn cuối kỳ',
    description: 'Xem trước hóa đơn cuối kỳ sẽ được tạo',
    icon: FileText
  },
  {
    id: 3,
    title: 'Xác nhận check-out',
    description: 'Hoàn tất quá trình check-out',
    icon: LogOut
  }
]

// Mock data for final bill preview (in real app, this would come from API)
const generateFinalBillPreview = (contract: ContractWithDetails): FinalBillPreview => {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const currentDay = now.getDate()
  
  // Calculate prorated rent (assuming checkout mid-month)
  const proratedRent = (contract.room.basePrice * currentDay) / daysInMonth
  
  // Mock utility consumption
  const electricConsumption = Math.floor(Math.random() * 100) + 50 // 50-150 kWh
  const waterConsumption = Math.floor(Math.random() * 10) + 5 // 5-15 m³
  
  // Mock pricing (should come from settings)
  const electricPrice = 3500 // VND per kWh
  const waterPrice = 25000 // VND per m³
  
  const electricAmount = electricConsumption * electricPrice
  const waterAmount = waterConsumption * waterPrice
  const serviceAmount = 0
  
  return {
    month: currentMonth,
    year: currentYear,
    rentAmount: proratedRent,
    electricConsumption,
    electricAmount,
    waterConsumption,
    waterAmount,
    serviceAmount,
    totalAmount: proratedRent + electricAmount + waterAmount + serviceAmount,
    daysUsed: currentDay,
    totalDays: daysInMonth
  }
}

export function CheckOutDialog({ 
  contract, 
  open, 
  onOpenChange, 
  onSuccess 
}: CheckOutDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [reason, setReason] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [finalBillPreview, setFinalBillPreview] = useState<FinalBillPreview | null>(null)
  const checkOutMutation = useCheckOutContract()

  useEffect(() => {
    if (contract && open) {
      setFinalBillPreview(generateFinalBillPreview(contract))
    }
  }, [contract, open])

  if (!contract) return null

  const primaryTenant = contract.tenants.find(ct => ct.isPrimary)
  const unpaidBills = contract.bills?.filter(bill => bill.status === 'UNPAID' || bill.status === 'OVERDUE') || []
  const hasUnpaidBills = unpaidBills.length > 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const handleNext = () => {
    if (currentStep < CHECKOUT_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCheckOut = async () => {
    setIsConfirming(true)
    try {
      await checkOutMutation.mutateAsync({ 
        id: contract.id, 
        data: { reason: reason.trim() || undefined } 
      })
      onOpenChange(false)
      onSuccess?.()
      // Reset state
      setCurrentStep(1)
      setReason('')
      setIsConfirming(false)
    } catch {
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setCurrentStep(1)
    setReason('')
    setIsConfirming(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-gradient-to-br from-red-50 to-orange-50 border-0 rounded-2xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 bg-white/80 backdrop-blur-sm border-b border-red-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                Check-out Hợp đồng
              </DialogTitle>
              <p className="text-gray-600 mt-1 font-mono text-sm">{contract.contractNumber}</p>
            </div>
            
            {/* Step Indicator */}
            <ProgressSteps 
              steps={CHECKOUT_STEPS} 
              currentStep={currentStep} 
              variant="compact"
            />
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Check Unpaid Bills */}
          {currentStep === 1 && (
            <AnimatedContent className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Kiểm tra hóa đơn chưa thanh toán</h3>
                <p className="text-gray-600">Tất cả hóa đơn phải được thanh toán trước khi check-out</p>
              </div>

              {/* Unpaid Bills Warning */}
              {hasUnpaidBills ? (
                <Card className="p-6 bg-red-50 border-red-200">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Có {unpaidBills.length} hóa đơn chưa thanh toán
                      </h4>
                      <p className="text-red-700 text-sm mb-4">
                        Vui lòng thanh toán tất cả hóa đơn trước khi thực hiện check-out
                      </p>
                      
                      <div className="space-y-3">
                        {unpaidBills.map((bill) => (
                          <div key={bill.id} className="bg-white p-4 rounded-lg border border-red-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  Hóa đơn tháng {bill.month}/{bill.year}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Hạn thanh toán: {bill.dueDate ? format(new Date(bill.dueDate), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-red-600">
                                  {formatCurrency(bill.totalAmount)}
                                </div>
                                <Badge variant={bill.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                                  {bill.status === 'OVERDUE' ? 'Quá hạn' : 'Chưa thanh toán'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">Tất cả hóa đơn đã được thanh toán</h4>
                      <p className="text-green-700 text-sm">Có thể tiến hành check-out</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Contract Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-red-100 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-red-600" />
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
                      <span className="text-gray-600">Ngày bắt đầu:</span>
                      <span className="font-medium">
                        {format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ngày kết thúc:</span>
                      <span className="font-medium">
                        {format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tiền cọc:</span>
                      <span className="font-bold text-green-600">{formatCurrency(contract.deposit)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white/80 backdrop-blur-sm border-red-100 shadow-lg">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-600" />
                    Khách thuê
                  </h4>
                  <div className="space-y-3">
                    {primaryTenant && (
                      <div className="border-l-4 border-red-500 pl-4 bg-red-50/50 py-2 rounded-r">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{primaryTenant.tenant.fullName}</span>
                          <Badge variant="default" className="text-xs">Khách chính</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>SĐT: {primaryTenant.tenant.phone}</div>
                        </div>
                      </div>
                    )}
                    {contract.tenants.length > 1 && (
                      <div className="text-sm text-gray-600">
                        +{contract.tenants.length - 1} khách thuê khác
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </AnimatedContent>
          )}

          {/* Step 2: Final Bill Preview */}
          {currentStep === 2 && finalBillPreview && (
            <AnimatedContent className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hóa đơn cuối kỳ</h3>
                <p className="text-gray-600">Hóa đơn này sẽ được tạo tự động sau khi check-out</p>
              </div>

              {/* Final Bill Card */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Hóa đơn tháng {finalBillPreview.month}/{finalBillPreview.year}
                  </h4>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Dự kiến
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Usage Details */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Tiền thuê phòng</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {finalBillPreview.daysUsed}/{finalBillPreview.totalDays} ngày sử dụng
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(finalBillPreview.rentAmount)}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        <span className="font-medium">Tiền điện</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {finalBillPreview.electricConsumption} kWh × 3,500đ
                      </div>
                      <div className="text-lg font-bold text-yellow-600">
                        {formatCurrency(finalBillPreview.electricAmount)}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Tiền nước</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {finalBillPreview.waterConsumption} m³ × 25,000đ
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(finalBillPreview.waterAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Summary */}
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border-2 border-red-200">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-red-600" />
                        Tổng kết
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tiền thuê:</span>
                          <span className="font-medium">{formatCurrency(finalBillPreview.rentAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tiền điện:</span>
                          <span className="font-medium">{formatCurrency(finalBillPreview.electricAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tiền nước:</span>
                          <span className="font-medium">{formatCurrency(finalBillPreview.waterAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Dịch vụ khác:</span>
                          <span className="font-medium">{formatCurrency(finalBillPreview.serviceAmount)}</span>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Tổng cộng:</span>
                            <span className="text-xl font-bold text-red-600">
                              {formatCurrency(finalBillPreview.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h6 className="font-medium text-green-800 mb-2">Tiền cọc hoàn trả</h6>
                      <div className="text-sm text-green-700 mb-2">
                        Tiền cọc ban đầu: {formatCurrency(contract.deposit)}
                      </div>
                      <div className="text-sm text-green-700 mb-2">
                        Trừ hóa đơn cuối: -{formatCurrency(finalBillPreview.totalAmount)}
                      </div>
                      <div className="border-t border-green-300 pt-2">
                        <div className="font-bold text-green-800">
                          Hoàn trả: {formatCurrency(Math.max(0, contract.deposit - finalBillPreview.totalAmount))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Important Notes */}
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <h5 className="font-medium text-yellow-800 mb-2">Lưu ý quan trọng:</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Hóa đơn này được tính dựa trên chỉ số điện nước hiện tại</li>
                  <li>• Tiền thuê được tính theo tỷ lệ ngày sử dụng thực tế</li>
                  <li>• Hóa đơn chính thức sẽ được tạo sau khi check-out</li>
                  <li>• Tiền cọc sẽ được hoàn trả sau khi trừ các khoản phí</li>
                </ul>
              </Card>
            </AnimatedContent>
          )}

          {/* Step 3: Final Confirmation */}
          {currentStep === 3 && (
            <AnimatedContent className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Xác nhận Check-out</h3>
                <p className="text-gray-600">Bạn có chắc chắn muốn thực hiện check-out cho hợp đồng này?</p>
              </div>

              {/* Final Summary */}
              <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Thông tin hợp đồng
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
                      Tài chính
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiền cọc:</span>
                        <span className="font-bold text-green-600">{formatCurrency(contract.deposit)}</span>
                      </div>
                      {finalBillPreview && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hóa đơn cuối:</span>
                            <span className="font-bold text-red-600">{formatCurrency(finalBillPreview.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-900 font-medium">Hoàn trả:</span>
                            <span className="font-bold text-blue-600">
                              {formatCurrency(Math.max(0, contract.deposit - finalBillPreview.totalAmount))}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Reason Input */}
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-red-100 shadow-lg">
                <div className="space-y-3">
                  <Label htmlFor="checkout-reason" className="text-sm font-medium text-gray-900">
                    Lý do check-out (tùy chọn)
                  </Label>
                  <Textarea
                    id="checkout-reason"
                    placeholder="Nhập lý do check-out (ví dụ: hết hạn hợp đồng, khách chuyển đi, vi phạm quy định...)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </Card>

              {/* What happens next */}
              <Card className="p-6 bg-red-50 border-red-200">
                <h5 className="font-semibold text-red-800 mb-3">Sau khi check-out:</h5>
                <ul className="space-y-2 text-sm text-red-700">
                  <li className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Hợp đồng sẽ được kết thúc (trạng thái TERMINATED)
                  </li>
                  <li className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Phòng sẽ chuyển về trạng thái &ldquo;Có sẵn&rdquo;
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Hóa đơn cuối kỳ sẽ được tạo tự động
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Dừng tính tiền thuê từ hôm nay
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
              {currentStep < CHECKOUT_STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={hasUnpaidBills}
                  className="px-8 bg-red-600 hover:bg-red-700"
                >
                  Tiếp theo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCheckOut}
                  disabled={isConfirming}
                  className="px-8 bg-red-600 hover:bg-red-700"
                >
                  {isConfirming && <LoadingSpinner size="sm" className="mr-2" />}
                  {isConfirming ? 'Đang xử lý...' : 'Xác nhận Check-out'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}