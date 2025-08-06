'use client'

import { Bill } from '../../types/bill'
import { BillStatusBadge } from './BillStatusBadge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  Zap, 
  Droplets, 
  Settings,
  Phone,
  CreditCard,
  FileText,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface BillDetailDialogProps {
  bill: Bill
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillDetailDialog({ bill, open, onOpenChange }: BillDetailDialogProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const primaryTenant = bill.contract.tenants[0]?.tenant

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            Chi tiết Hóa đơn - Tháng {bill.month}/{bill.year}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Room & Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Thông tin Phòng & Hợp đồng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Số phòng</p>
                    <p className="font-semibold text-lg">{bill.room.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tầng</p>
                    <p className="font-semibold">{bill.room.floor}</p>
                  </div>
                </div>

                {bill.room.area && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Diện tích</p>
                      <p className="font-semibold">{bill.room.area} m²</p>
                    </div>
                    {bill.room.capacity && (
                      <div>
                        <p className="text-sm text-gray-600">Sức chứa</p>
                        <p className="font-semibold">{bill.room.capacity} người</p>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-gray-600">Số hợp đồng</p>
                  <p className="font-semibold">{bill.contract.contractNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Thông tin Khách thuê
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {primaryTenant ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Họ tên</p>
                      <p className="font-semibold">{primaryTenant.fullName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-semibold flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {primaryTenant.phone}
                        </p>
                      </div>
                      {primaryTenant.idCard && (
                        <div>
                          <p className="text-sm text-gray-600">CCCD/CMND</p>
                          <p className="font-semibold">{primaryTenant.idCard}</p>
                        </div>
                      )}
                    </div>

                    {bill.contract.tenants.length > 1 && (
                      <div>
                        <p className="text-sm text-gray-600">Số người thuê</p>
                        <Badge variant="outline">
                          {bill.contract.tenants.length} người
                        </Badge>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic">Chưa có thông tin khách thuê</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bill Details */}
          <div className="space-y-6">
            {/* Bill Status & Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Thông tin Hóa đơn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <BillStatusBadge status={bill.status} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Kỳ hóa đơn</p>
                    <p className="font-semibold">Tháng {bill.month}/{bill.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày tạo</p>
                    <p className="font-semibold">
                      {format(new Date(bill.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Hạn thanh toán</p>
                    <p className="font-semibold text-orange-600">
                      {format(new Date(bill.dueDate), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                  {bill.paidDate && (
                    <div>
                      <p className="text-sm text-gray-600">Ngày thanh toán</p>
                      <p className="font-semibold text-green-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(bill.paidDate), 'dd/MM/yyyy', { locale: vi })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bill Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Chi tiết Thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rent */}
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-500" />
                    <span>Tiền thuê phòng</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(bill.rentAmount)}</span>
                </div>

                <Separator />

                {/* Electric */}
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Tiền điện</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(bill.electricAmount)}</span>
                </div>

                <Separator />

                {/* Water */}
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Tiền nước</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(bill.waterAmount)}</span>
                </div>

                {/* Service (if any) */}
                {bill.serviceAmount > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span>Dịch vụ khác</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(bill.serviceAmount)}</span>
                    </div>
                  </>
                )}

                <Separator className="border-2" />

                {/* Total */}
                <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-lg">Tổng cộng</span>
                  </div>
                  <span className="font-bold text-xl text-green-600">
                    {formatCurrency(bill.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {bill.paidDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Lịch sử Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">Đã thanh toán</p>
                      <p className="text-sm text-green-600">
                        {format(new Date(bill.paidDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(bill.totalAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}