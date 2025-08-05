'use client'

// ## Component React: Dialog Chi Tiết Khách Thuê (Redesigned) ##
//
// Dependencies:
// 1. React, useState
// 2. shadcn/ui (Dialog, Button, Badge)
// 3. lucide-react (cho icons)
// 4. Các hooks và types bạn đã định nghĩa (useTenant, TenantWithContracts, etc.)
//
// Hướng dẫn tích hợp:
// 1. Thay thế toàn bộ mã của file `TenantDetailDialog.tsx` cũ bằng mã nguồn này.
// 2. Đảm bảo các đường dẫn import tới components, hooks, và types là chính xác.
// 3. Component `ResidencyRecordList` của bạn sẽ được hiển thị trong tab "Hồ sơ tạm trú".

import React, { useState } from 'react'
import {
    User,
    Pencil,
    Trash2,
    X,
    Phone,
    CreditCard,
    Calendar,
    MapPin,
    Building,
    FileText,
    FolderOpen
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useTenant, useTenantHistory } from '@/hooks/useTenants'
import { TenantWithContracts } from '@/types/tenant'
import { formatCurrency } from '@/lib/utils'
import { ResidencyRecordList } from '@/components/residency-records'

// --- Props Interface ---
interface TenantDetailDialogProps {
    tenant: TenantWithContracts | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: (tenant: TenantWithContracts) => void
    onDelete?: (tenant: TenantWithContracts) => void
}

// --- Helper Components ---

// Component hiển thị một mục thông tin cá nhân ở cột trái
const ProfileInfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        {icon && React.createElement(icon, { className: "w-4 h-4 text-slate-400 mt-1 flex-shrink-0" })}
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="font-medium text-slate-800">{value || 'N/A'}</p>
        </div>
    </div>
);

// Component hiển thị một mục thống kê ở cột trái
const StatItem = ({ label, value, valueColor = 'text-blue-600' }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-slate-500">{label}</span>
        <span className={`font-bold text-lg ${valueColor}`}>{value}</span>
    </div>
);

// Component cho các nút Tab
const TabButton = ({ label, tab, activeTab, setActiveTab }) => (
    <button
        className={`whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-colors
            ${activeTab === tab
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-500 border-transparent hover:border-slate-300 hover:text-slate-700'
            }`
        }
        onClick={() => setActiveTab(tab)}
    >
        {label}
    </button>
);


// --- Main Component ---

export function TenantDetailDialog({
    tenant,
    open,
    onOpenChange,
    onEdit,
    onDelete,
}: TenantDetailDialogProps) {
    const [activeTab, setActiveTab] = useState('current-contract');
    const [historyPage, setHistoryPage] = useState(1);

    // Fetch detailed tenant info
    const { data: detailData, isLoading: isDetailLoading } = useTenant(
        tenant?.id || '',
        open && !!tenant?.id
    );

    // Fetch rental history
    const { data: historyData, isLoading: isHistoryLoading } = useTenantHistory(
        tenant?.id || '',
        historyPage,
        5,
        open && !!tenant?.id
    );

    // --- Data Handling ---
    const tenantDetail = detailData?.data || tenant;
    const safeContracts = Array.isArray(tenantDetail?.contracts)
        ? tenantDetail.contracts.filter(ct => ct && ct.contract)
        : [];
    const safeCount = tenantDetail?._count || tenant?._count || { contracts: 0, residencyRecords: 0 };
    const history = historyData?.data.history || [];
    const historyPagination = historyData?.pagination;
    const activeContract = safeContracts.find(ct => ct.contract.status === 'ACTIVE');

    if (!tenant) return null;

    // --- Badge Logic ---
    const getStatusBadge = (status) => {
        const variants = {
            ACTIVE: { className: 'bg-green-100 text-green-800', label: 'Đang hoạt động' },
            EXPIRED: { className: 'bg-slate-100 text-slate-800', label: 'Hết hạn' },
            TERMINATED: { className: 'bg-red-100 text-red-800', label: 'Đã kết thúc' }
        };
        return variants[status] || { className: 'bg-slate-100 text-slate-800', label: status };
    };

    const getBillStatusBadge = (status) => {
        const variants = {
            PAID: { className: 'bg-green-100 text-green-800', label: 'Đã thanh toán' },
            UNPAID: { className: 'bg-yellow-100 text-yellow-800', label: 'Chưa thanh toán' },
            OVERDUE: { className: 'bg-red-100 text-red-800', label: 'Quá hạn' }
        };
        return variants[status] || { className: 'bg-slate-100 text-slate-800', label: status };
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-50 p-0">
                {isDetailLoading && !tenantDetail ? (
                    <div className="flex justify-center items-center h-96">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <User className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{tenantDetail.fullName}</h2>
                                        <p className="text-sm text-slate-500 font-mono">ID: {tenantDetail.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {onEdit && (
                                        <Button variant="outline" onClick={() => onEdit(tenant)}>
                                            <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 hover:border-red-400" onClick={() => onDelete(tenant)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full ml-2"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3">
                            {/* Left Column: Profile Card */}
                            <div className="lg:col-span-1 lg:border-r border-slate-200 p-6 space-y-6 bg-white lg:bg-slate-50">
                                <div>
                                    <h3 className="text-base font-semibold text-slate-600 mb-4">Thông tin liên hệ</h3>
                                    <div className="space-y-4">
                                        <ProfileInfoItem icon={Phone} label="Số điện thoại" value={tenantDetail.phone} />
                                        <ProfileInfoItem icon={CreditCard} label="Số CCCD" value={tenantDetail.idCard} />
                                        <ProfileInfoItem icon={Calendar} label="Ngày sinh" value={tenantDetail.dateOfBirth ? new Date(tenantDetail.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'} />
                                        <ProfileInfoItem icon={MapPin} label="Quê quán" value={tenantDetail.hometown} />
                                    </div>
                                </div>
                                <div className="border-t border-slate-200"></div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-600 mb-4">Thống kê</h3>
                                    <div className="space-y-4">
                                        <StatItem label="Tổng hợp đồng" value={safeCount.contracts} valueColor="text-blue-600" />
                                        <StatItem label="Đang thuê" value={safeContracts.filter(ct => ct.contract.status === 'ACTIVE').length} valueColor="text-green-600" />
                                        <StatItem label="Hồ sơ tạm trú" value={safeCount.residencyRecords} valueColor="text-purple-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Tabs */}
                            <div className="lg:col-span-2 p-6">
                                <div className="border-b border-slate-200 mb-6">
                                    <nav className="flex -mb-px" aria-label="Tabs">
                                        <TabButton label="Hợp đồng hiện tại" tab="current-contract" activeTab={activeTab} setActiveTab={setActiveTab} />
                                        <TabButton label="Lịch sử thuê" tab="history" activeTab={activeTab} setActiveTab={setActiveTab} />
                                        <TabButton label="Hồ sơ tạm trú" tab="residency" activeTab={activeTab} setActiveTab={setActiveTab} />
                                    </nav>
                                </div>
                                <div>
                                    {activeTab === 'current-contract' && (
                                        <div className="space-y-6">
                                            {activeContract ? (
                                                <>
                                                    <div className="p-5 bg-white rounded-xl border border-slate-200/80">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <Building className="w-5 h-5 text-slate-500" />
                                                                <p className="font-semibold text-slate-800">Phòng {activeContract.contract.room.number} - Tầng {activeContract.contract.room.floor}</p>
                                                            </div>
                                                            <Badge className={getStatusBadge(activeContract.contract.status).className}>{getStatusBadge(activeContract.contract.status).label}</Badge>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                                            <div><p className="text-slate-500">Ngày bắt đầu:</p><p className="font-medium text-slate-800">{new Date(activeContract.contract.startDate).toLocaleDateString('vi-VN')}</p></div>
                                                            <div><p className="text-slate-500">Ngày kết thúc:</p><p className="font-medium text-slate-800">{new Date(activeContract.contract.endDate).toLocaleDateString('vi-VN')}</p></div>
                                                            <div><p className="text-slate-500">Giá thuê:</p><p className="font-medium text-slate-800">{formatCurrency(activeContract.contract.room.basePrice || 0)}/tháng</p></div>
                                                            <div><p className="text-slate-500">Tiền cọc:</p><p className="font-medium text-slate-800">{formatCurrency(activeContract.contract.deposit)}</p></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-3 text-slate-800">Hóa đơn gần đây</h4>
                                                        <div className="space-y-2">
                                                            {(activeContract.contract.bills && activeContract.contract.bills.length > 0) ? activeContract.contract.bills.slice(0, 3).map((bill) => (
                                                                <div key={bill.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200/80">
                                                                    <div>
                                                                        <p className="font-medium">Tháng {bill.month}/{bill.year}</p>
                                                                        <p className="text-sm text-slate-600">{formatCurrency(bill.totalAmount)}</p>
                                                                    </div>
                                                                    <Badge className={getBillStatusBadge(bill.status).className}>{getBillStatusBadge(bill.status).label}</Badge>
                                                                </div>
                                                            )) : <p className="text-sm text-slate-500 text-center py-4">Không có hóa đơn.</p>}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200/80">
                                                    <FileText className="w-12 h-12 mx-auto text-slate-300" />
                                                    <p className="mt-4 font-medium">Không có hợp đồng nào đang hoạt động</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {activeTab === 'history' && (
                                        <div className="space-y-4">
                                            {isHistoryLoading ? <div className="flex justify-center py-8"><LoadingSpinner /></div>
                                                : history.length > 0 ? (
                                                    <>
                                                        {history.map(({ contract, isPrimary }) => (
                                                            <div key={contract.id} className="p-4 bg-white rounded-lg border border-slate-200/80">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <p className="font-medium">Phòng {contract.room.number}</p>
                                                                    <Badge className={getStatusBadge(contract.status).className}>{getStatusBadge(contract.status).label}</Badge>
                                                                </div>
                                                                <p className="text-sm text-slate-500">Thời gian thuê: {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {new Date(contract.endDate).toLocaleDateString('vi-VN')}</p>
                                                            </div>
                                                        ))}
                                                        {historyPagination && historyPagination.totalPages > 1 && (
                                                            <div className="flex justify-center items-center gap-2 pt-4">
                                                                <Button variant="outline" size="sm" disabled={!historyPagination.hasPrev} onClick={() => setHistoryPage(historyPagination.page - 1)}>Trước</Button>
                                                                <span className="text-sm text-slate-600">Trang {historyPagination.page} / {historyPagination.totalPages}</span>
                                                                <Button variant="outline" size="sm" disabled={!historyPagination.hasNext} onClick={() => setHistoryPage(historyPagination.page + 1)}>Sau</Button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200/80">
                                                        <FolderOpen className="w-12 h-12 mx-auto text-slate-300" />
                                                        <p className="mt-4 font-medium">Chưa có lịch sử thuê phòng</p>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                    {activeTab === 'residency' && (
                                        <ResidencyRecordList
                                            tenantId={tenantDetail.id}
                                            tenantName={tenantDetail.fullName}
                                            showCreateButton={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
