'use client'

import { useState } from 'react'
import { useBills } from '../../hooks/useBills'
import { BillFilters, Bill } from '../../types/bill'
import { BillStatus } from '../../../../shared/src/types/models'
import { BillStatusBadge } from './BillStatusBadge'
import { BillDetailDialog } from './BillDetailDialog'
import { BillForm } from './BillForm'
import { PayBillDialog } from './PayBillDialog'
import { BillStats } from './BillStats'
import { GenerateBillsDialog } from './GenerateBillsDialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

import { LoadingSpinner } from '../ui/loading-spinner'
import { FloatingActionButton } from '../ui/floating-action-button'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  CreditCard, 
  Filter,
  Calendar,
  DollarSign,
  Building,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface BillListProps {
  className?: string
}

export function BillList({ className }: BillListProps) {
  const [filters, setFilters] = useState<BillFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPayDialog, setShowPayDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, error } = useBills(filters)

  // Update search filter with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1
    }))
  }

  // Filter handlers
  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as BillStatus,
      page: 1
    }))
  }

  const handleMonthFilter = (month: string) => {
    setFilters(prev => ({
      ...prev,
      month: month === 'all' ? undefined : parseInt(month),
      page: 1
    }))
  }

  const handleYearFilter = (year: string) => {
    setFilters(prev => ({
      ...prev,
      year: year === 'all' ? undefined : parseInt(year),
      page: 1
    }))
  }

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  // Action handlers
  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill)
    setShowDetailDialog(true)
  }

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill)
    setShowEditForm(true)
  }

  const handlePayBill = (bill: Bill) => {
    setSelectedBill(bill)
    setShowPayDialog(true)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Get current month/year options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra khi tải danh sách hóa đơn</p>
      </div>
    )
  }

  const bills = data?.data || []
  const pagination = data?.pagination

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quản lý Hóa đơn
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý hóa đơn thanh toán của khách thuê
          </p>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo hóa đơn
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <BillStats 
        month={filters.month} 
        year={filters.year} 
      />

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bộ lọc
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm theo phòng, hợp đồng, khách thuê..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg"
              />
            </div>

            {/* Status Filter */}
            <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-400 rounded-lg">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value={BillStatus.UNPAID}>Chưa thanh toán</SelectItem>
                <SelectItem value={BillStatus.PAID}>Đã thanh toán</SelectItem>
                <SelectItem value={BillStatus.OVERDUE}>Quá hạn</SelectItem>
              </SelectContent>
            </Select>

            {/* Month Filter */}
            <Select value={filters.month?.toString() || 'all'} onValueChange={handleMonthFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-400 rounded-lg">
                <SelectValue placeholder="Tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tháng</SelectItem>
                {months.map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    Tháng {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={filters.year?.toString() || 'all'} onValueChange={handleYearFilter}>
              <SelectTrigger className="border-gray-200 focus:border-blue-400 rounded-lg">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả năm</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    Năm {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {bills.map((bill) => (
          <Card key={bill.id} className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            {/* Status Indicator Bar */}
            <div className={`h-1 w-full ${
              bill.status === BillStatus.PAID ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
              bill.status === BillStatus.OVERDUE ? 'bg-gradient-to-r from-red-400 to-pink-500' :
              'bg-gradient-to-r from-yellow-400 to-orange-500'
            }`} />
            
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">Phòng {bill.room.number}</span>
                      <p className="text-sm text-gray-500 font-normal">
                        Tầng {bill.room.floor} • {bill.contract.contractNumber}
                      </p>
                    </div>
                  </CardTitle>
                </div>
                <BillStatusBadge status={bill.status} />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Tenant Info */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Khách thuê</p>
                  <p className="font-semibold text-gray-900">
                    {bill.contract.tenants[0]?.tenant.fullName || 'Chưa có thông tin'}
                  </p>
                </div>
              </div>

              {/* Period & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">KỲ HÓA ĐƠN</span>
                  </div>
                  <p className="font-bold text-purple-900">Tháng {bill.month}/{bill.year}</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">TỔNG TIỀN</span>
                  </div>
                  <p className="font-bold text-green-900 text-sm">
                    {formatCurrency(bill.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Due Date */}
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-600 font-medium mb-1">HẠN THANH TOÁN</p>
                    <p className="font-semibold text-orange-900">
                      {format(new Date(bill.dueDate), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                  {bill.paidDate && (
                    <div className="text-right">
                      <p className="text-xs text-green-600 font-medium mb-1">ĐÃ THANH TOÁN</p>
                      <p className="font-semibold text-green-900 text-sm">
                        {format(new Date(bill.paidDate), 'dd/MM/yyyy', { locale: vi })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewBill(bill)}
                  className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Xem
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditBill(bill)}
                  className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Sửa
                </Button>
                
                {bill.status !== BillStatus.PAID && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handlePayBill(bill)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Thanh toán
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {bills.length === 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-16 h-16 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Chưa có hóa đơn nào
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bắt đầu quản lý hóa đơn bằng cách tạo hóa đơn đầu tiên hoặc sử dụng tính năng tạo tự động.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo hóa đơn đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 
            trong tổng số {pagination.total} hóa đơn
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm font-medium">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <FloatingActionButton
          onClick={() => setShowGenerateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl"
        >
          <Sparkles className="w-6 h-6" />
        </FloatingActionButton>
        
        <FloatingActionButton
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl"
        >
          <Plus className="w-6 h-6" />
        </FloatingActionButton>
      </div>

      {/* Dialogs */}
      {showDetailDialog && selectedBill && (
        <BillDetailDialog
          bill={selectedBill}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      )}

      {showCreateForm && (
        <BillForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}

      {showEditForm && selectedBill && (
        <BillForm
          bill={selectedBill}
          open={showEditForm}
          onOpenChange={setShowEditForm}
          onSuccess={() => setShowEditForm(false)}
        />
      )}

      {showPayDialog && selectedBill && (
        <PayBillDialog
          bill={selectedBill}
          open={showPayDialog}
          onOpenChange={setShowPayDialog}
          onSuccess={() => setShowPayDialog(false)}
        />
      )}

      {showGenerateDialog && (
        <GenerateBillsDialog
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
          onSuccess={() => setShowGenerateDialog(false)}
        />
      )}
    </div>
  )
}