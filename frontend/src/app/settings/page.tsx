'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/store/settings'
import { toast } from 'sonner'
import { SlidersHorizontal, DollarSign } from 'lucide-react'

// --- Helper Components ---

// Component cho các mục điều hướng bên trái
interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  tabId: string
  activeTab: string
  setActiveTab: (tab: string) => void
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, tabId, activeTab, setActiveTab }) => {
  const isActive = activeTab === tabId
  const IconComponent = icon
  
  return (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <IconComponent className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
      <span>{label}</span>
    </button>
  )
}

// Component cho một trường trong form
interface FormFieldProps {
  id: string
  label: string
  description?: string
  children: React.ReactNode
}

const FormField: React.FC<FormFieldProps> = ({ id, label, description, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-start">
    <div className="md:col-span-1">
      <Label htmlFor={id} className="font-semibold text-slate-800">{label}</Label>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
    <div className="md:col-span-2">
      {children}
    </div>
  </div>
)

// Component cho thẻ chứa form
interface SettingsCardProps {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, description, children, footer }) => (
  <div className="bg-white rounded-xl shadow-sm">
    <div className="p-6 border-b border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end">
      {footer}
    </div>
  </div>
)

// --- Main Component ---

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const { settings, updateGeneralSettings, updatePricingSettings } = useSettingsStore()
  
  // Clone settings to local form state to avoid direct mutation
  const [generalForm, setGeneralForm] = useState(settings.general)
  const [pricingForm, setPricingForm] = useState(settings.pricing)

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateGeneralSettings(generalForm)
    toast.success('Cập nhật thông tin chung thành công!')
  }

  const handlePricingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePricingSettings(pricingForm)
    toast.success('Cập nhật giá dịch vụ thành công!')
  }

  const tabs = [
    { id: 'general', name: 'Thông tin chung', icon: SlidersHorizontal },
    { id: 'pricing', name: 'Giá dịch vụ', icon: DollarSign }
  ]

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">CÀI ĐẶT HỆ THỐNG</h1>
        <p className="text-slate-600 mt-1">
          Quản lý các thông tin và cấu hình cốt lõi cho toàn bộ hệ thống nhà trọ của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Navigation */}
        <aside className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <NavItem
                key={tab.id}
                icon={tab.icon}
                label={tab.name}
                tabId={tab.id}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            ))}
          </nav>
        </aside>

        {/* Right Content */}
        <main className="lg:col-span-3">
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSubmit}>
              <SettingsCard
                title="Thông tin chung"
                description="Cập nhật thông tin liên hệ và địa chỉ của nhà trọ."
                footer={<Button type="submit">Lưu thay đổi</Button>}
              >
                <FormField id="hotelName" label="Tên nhà trọ">
                  <Input
                    id="hotelName"
                    value={generalForm.hotelName}
                    onChange={(e) => setGeneralForm({ ...generalForm, hotelName: e.target.value })}
                    placeholder="Ví dụ: Nhà trọ An Bình"
                  />
                </FormField>
                <hr className="border-slate-200" />
                <FormField id="address" label="Địa chỉ">
                  <Input
                    id="address"
                    value={generalForm.address}
                    onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                    placeholder="Số 1, Đường A, Phường B, Quận C"
                  />
                </FormField>
                <hr className="border-slate-200" />
                <FormField id="phoneNumber" label="Số điện thoại">
                  <Input
                    id="phoneNumber"
                    value={generalForm.phoneNumber}
                    onChange={(e) => setGeneralForm({ ...generalForm, phoneNumber: e.target.value })}
                    placeholder="Số điện thoại liên hệ chính"
                  />
                </FormField>
                <hr className="border-slate-200" />
                <FormField id="email" label="Email">
                  <Input
                    id="email"
                    type="email"
                    value={generalForm.email}
                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                    placeholder="Email để nhận thông báo và liên hệ"
                  />
                </FormField>
              </SettingsCard>
            </form>
          )}

          {activeTab === 'pricing' && (
            <form onSubmit={handlePricingSubmit}>
              <SettingsCard
                title="Giá dịch vụ"
                description="Thiết lập đơn giá cho các dịch vụ điện, nước và các chi phí khác."
                footer={<Button type="submit">Lưu thay đổi</Button>}
              >
                <FormField id="electricityRate" label="Giá điện" description="Đơn vị tính: VNĐ/kWh">
                  <Input
                    id="electricityRate"
                    type="number"
                    value={pricingForm.electricityRate}
                    onChange={(e) => setPricingForm({ ...pricingForm, electricityRate: Number(e.target.value) })}
                    placeholder="Ví dụ: 3500"
                  />
                </FormField>
                <hr className="border-slate-200" />
                <FormField id="waterRate" label="Giá nước" description="Đơn vị tính: VNĐ/khối (m³)">
                  <Input
                    id="waterRate"
                    type="number"
                    value={pricingForm.waterRate}
                    onChange={(e) => setPricingForm({ ...pricingForm, waterRate: Number(e.target.value) })}
                    placeholder="Ví dụ: 15000"
                  />
                </FormField>
                <hr className="border-slate-200" />
                <FormField id="internetFee" label="Phí internet" description="Đơn vị tính: VNĐ/tháng">
                  <Input
                    id="internetFee"
                    type="number"
                    value={pricingForm.internetFee}
                    onChange={(e) => setPricingForm({ ...pricingForm, internetFee: Number(e.target.value) })}
                    placeholder="Nhập 0 nếu miễn phí hoặc đã tính vào tiền phòng"
                  />
                </FormField>
                <hr className="border-slate-200" />
                <FormField id="cleaningFee" label="Phí vệ sinh" description="Đơn vị tính: VNĐ/tháng">
                  <Input
                    id="cleaningFee"
                    type="number"
                    value={pricingForm.cleaningFee}
                    onChange={(e) => setPricingForm({ ...pricingForm, cleaningFee: Number(e.target.value) })}
                    placeholder="Nhập 0 nếu không có"
                  />
                </FormField>
              </SettingsCard>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}
