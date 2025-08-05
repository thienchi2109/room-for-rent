'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ContractStatusDialog } from './ContractStatusDialog'
import { useCheckInContract } from '@/hooks/useContracts'
import { 
  X,
  FileText,
  Home,
  Users,
  User,
  Wallet,
  Pencil,
  LogOut,
  RefreshCw,
  Phone,
  Fingerprint,
  Cake,
  Building,
  LucideIcon
} from 'lucide-react'
import { ContractWithDetails } from '@/types/contract'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ContractService } from '@/services/contractService'

interface ContractDetailDialogProps {
  contract: ContractWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (contract: ContractWithDetails) => void
}

// Helper Components
const InfoRow = ({ icon: Icon, label, value, valueColorClass = 'text-slate-800' }: {
  icon?: LucideIcon
  label: string
  value: React.ReactNode
  valueColorClass?: string
}) => (
  <div className="flex justify-between items-center py-2">
    <div className="flex items-center text-slate-500">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      <span className="text-sm">{label}</span>
    </div>
    <span className={`text-sm font-medium ${valueColorClass}`}>{value}</span>
  </div>
)

const InfoCard = ({ title, icon: Icon, children }: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}) => (
  <div className="bg-white border border-slate-200/80 rounded-xl">
    <div className="p-4 border-b border-slate-200/80">
      <h3 className="font-semibold text-slate-800 flex items-center">
        <Icon className="w-5 h-5 mr-3 text-slate-500" />
        {title}
      </h3>
    </div>
    <div className="p-4 space-y-1">
      {children}
    </div>
  </div>
)

interface TenantData {
  name: string
  phone: string
  idCard: string
  birthDate: string
  hometown?: string
  isMain: boolean
}

const TenantInfo = ({ tenant }: { tenant: TenantData }) => (
  <div className={`p-4 rounded-lg ${tenant.isMain ? 'bg-blue-50/50 border border-blue-200' : ''}`}>
    <div className="flex items-center mb-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${tenant.isMain ? 'bg-blue-100' : 'bg-slate-100'}`}>
        <User className={`w-5 h-5 ${tenant.isMain ? 'text-blue-600' : 'text-slate-500'}`} />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{tenant.name}</p>
        {tenant.isMain && <span className="text-xs font-medium bg-blue-600 text-white px-2 py-0.5 rounded-full">Khách chính</span>}
      </div>
    </div>
    <div className="space-y-2 text-sm pl-2 border-l-2 border-slate-200 ml-5">
      <div className="flex items-center text-slate-600">
        <Phone className="w-3.5 h-3.5 mr-2.5" /> SĐT: {tenant.phone}
      </div>
      <div className="flex items-center text-slate-600">
        <Fingerprint className="w-3.5 h-3.5 mr-2.5" /> CCCD: {tenant.idCard}
      </div>
      {tenant.birthDate && tenant.birthDate !== 'N/A' && (
        <div className="flex items-center text-slate-600">
          <Cake className="w-3.5 h-3.5 mr-2.5" /> Ngày sinh: {tenant.birthDate}
        </div>
      )}
      {tenant.hometown && (
        <div className="flex items-center text-slate-600">
          <Building className="w-3.5 h-3.5 mr-2.5" /> Quê quán: {tenant.hometown}
        </div>
      )}
    </div>
  </div>
)

export function ContractDetailDialog({ 
  contract, 
  open, 
  onOpenChange, 
  onEdit 
}: ContractDetailDialogProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const checkInMutation = useCheckInContract()

  if (!contract) return null

  const primaryTenant = contract.tenants.find(ct => ct.isPrimary)
  const otherTenants = contract.tenants.filter(ct => !ct.isPrimary)
  const remainingDays = ContractService.getRemainingDays(contract.endDate)
  const contractDuration = ContractService.getContractDuration(contract.startDate, contract.endDate)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Get status info
  const getStatusInfo = () => {
    if (contract.status === 'ACTIVE') {
      return {
        color: 'bg-green-500',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        label: 'Đang hoạt động'
      }
    } else if (contract.status === 'EXPIRED') {
      return {
        color: 'bg-orange-500',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        label: 'Hết hạn'
      }
    } else {
      return {
        color: 'bg-red-500',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        label: 'Đã kết thúc'
      }
    }
  }

  const statusInfo = getStatusInfo()

  // Prepare tenant data for display
  const mainTenantData = primaryTenant ? {
    name: primaryTenant.tenant.fullName,
    phone: primaryTenant.tenant.phone,
    idCard: primaryTenant.tenant.idCard,
    birthDate: primaryTenant.tenant.dateOfBirth ? format(new Date(primaryTenant.tenant.dateOfBirth), 'dd/MM/yyyy', { locale: vi }) : 'N/A',
    hometown: primaryTenant.tenant.hometown,
    isMain: true
  } : null

  const otherTenantsData = otherTenants.map(ct => ({
    name: ct.tenant.fullName,
    phone: ct.tenant.phone,
    idCard: ct.tenant.idCard,
    birthDate: ct.tenant.dateOfBirth ? format(new Date(ct.tenant.dateOfBirth), 'dd/MM/yyyy', { locale: vi }) : 'N/A',
    hometown: ct.tenant.hometown,
    isMain: false
  }))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-none w-full max-w-6xl p-0 gap-0 bg-slate-50 border-0 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start p-5 border-b border-slate-200 sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chi tiết hợp đồng</h2>
              <p className="text-sm text-slate-500 font-mono">{contract.contractNumber}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`}></span>
                <span className="font-medium text-slate-700">{statusInfo.label}</span>
                <span className="text-slate-500">({remainingDays > 0 ? `${remainingDays} ngày` : `Quá hạn ${Math.abs(remainingDays)} ngày`})</span>
              </div>
              <button 
                onClick={() => onOpenChange(false)} 
                className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200/80 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mb-6">
              {contract.status === 'ACTIVE' && (
                <button 
                  onClick={() => setIsStatusDialogOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Check-out
                </button>
              )}
              
              {contract.status !== 'ACTIVE' && contract.status !== 'TERMINATED' && (
                <button 
                  onClick={() => checkInMutation.mutate(contract.id)}
                  disabled={checkInMutation.isPending}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Building className="w-4 h-4" /> 
                  {checkInMutation.isPending ? 'Đang xử lý...' : 'Check-in'}
                </button>
              )}
              
              <button 
                onClick={() => setIsStatusDialogOpen(true)}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Thay đổi
              </button>
              
              {onEdit && (
                <button 
                  onClick={() => onEdit(contract)}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Pencil className="w-4 h-4" /> Chỉnh sửa
                </button>
              )}
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Contract Info */}
              <div className="lg:col-span-2 space-y-6">
                <InfoCard title="Thông tin hợp đồng" icon={FileText}>
                  <InfoRow 
                    label="Trạng thái" 
                    value={
                      <span className={`flex items-center gap-2 text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor} px-2 py-1 rounded-full`}>
                        <span className={`w-2 h-2 rounded-full ${statusInfo.color}`}></span>
                        {statusInfo.label} ({remainingDays > 0 ? `${remainingDays} ngày` : `Quá hạn ${Math.abs(remainingDays)} ngày`})
                      </span>
                    } 
                  />
                  <InfoRow 
                    label="Ngày tạo" 
                    value={contract.createdAt ? format(new Date(contract.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'} 
                  />
                  <InfoRow 
                    label="Ngày bắt đầu" 
                    value={contract.startDate ? format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: vi }) : 'N/A'} 
                  />
                  <InfoRow 
                    label="Ngày kết thúc" 
                    value={contract.endDate ? format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: vi }) : 'N/A'} 
                  />
                  <InfoRow 
                    label="Thời hạn" 
                    value={`${contractDuration} ngày`} 
                  />
                  <InfoRow 
                    label="Còn lại" 
                    value={remainingDays > 0 ? `${remainingDays} ngày` : `Quá hạn ${Math.abs(remainingDays)} ngày`}
                    valueColorClass={remainingDays > 0 ? 'text-green-600' : 'text-red-600'}
                  />
                  <InfoRow 
                    label="Tiền cọc" 
                    value={formatCurrency(contract.deposit)} 
                    valueColorClass="text-green-600 font-bold" 
                  />
                </InfoCard>

                <InfoCard title="Thông tin phòng" icon={Home}>
                  <InfoRow label="Số phòng" value={contract.room.number} />
                  <InfoRow label="Tầng" value={contract.room.floor} />
                  <InfoRow 
                    label="Diện tích" 
                    value={`${contract.room.area}m²`} 
                  />
                  <InfoRow 
                    label="Sức chứa" 
                    value={`${contract.room.capacity} người`} 
                  />
                  <InfoRow 
                    label="Trạng thái phòng" 
                    value={
                      <span className="text-sm font-medium bg-slate-800 text-white px-2.5 py-1 rounded-md">
                        {contract.room.status === 'OCCUPIED' ? 'Đã thuê' : 
                         contract.room.status === 'AVAILABLE' ? 'Có sẵn' :
                         contract.room.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đã đặt'}
                      </span>
                    } 
                  />
                  <InfoRow 
                    label="Giá thuê" 
                    value={formatCurrency(contract.room.basePrice) + ' /tháng'} 
                    valueColorClass="text-blue-600 font-bold" 
                  />
                </InfoCard>
              </div>

              {/* Right Column - Tenants & Bills */}
              <div className="lg:col-span-1 space-y-6">
                <InfoCard title="Thông tin khách thuê" icon={Users}>
                  <div className="space-y-4">
                    {mainTenantData && <TenantInfo tenant={mainTenantData} />}
                    {otherTenantsData.map((tenant, index) => (
                      <TenantInfo key={index} tenant={tenant} />
                    ))}
                  </div>
                </InfoCard>

                <InfoCard title="Hóa đơn" icon={Wallet}>
                  <InfoRow label="Tổng hóa đơn" value={contract._count?.bills || 0} />
                  {contract.bills && contract.bills.length > 0 && (
                    <>
                      <InfoRow 
                        label="Đã thanh toán" 
                        value={contract.bills.filter(bill => bill.status === 'PAID').length}
                        valueColorClass="text-green-600"
                      />
                      <InfoRow 
                        label="Chưa thanh toán" 
                        value={contract.bills.filter(bill => bill.status === 'UNPAID').length}
                        valueColorClass="text-red-600"
                      />
                      <InfoRow 
                        label="Quá hạn" 
                        value={contract.bills.filter(bill => bill.status === 'OVERDUE').length}
                        valueColorClass="text-orange-600"
                      />
                    </>
                  )}
                  <button className="w-full mt-2 text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                    Xem tất cả hóa đơn
                  </button>
                </InfoCard>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <ContractStatusDialog
        contract={contract}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      />
    </>
  )
}
