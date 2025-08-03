'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/store/settings'
import { toast } from 'react-hot-toast'

const tabs = [
  { id: 'general', name: 'Thông tin chung' },
  { id: 'pricing', name: 'Giá dịch vụ' }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const { settings, updateGeneralSettings, updatePricingSettings } = useSettingsStore()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quản lý cài đặt hệ thống và thông tin nhà trọ
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin chung</h2>
          <form onSubmit={handleGeneralSubmit} className="space-y-4">
            <div>
              <Label htmlFor="hotelName">Tên nhà trọ</Label>
              <Input
                id="hotelName"
                value={generalForm.hotelName}
                onChange={(e) => setGeneralForm({ ...generalForm, hotelName: e.target.value })}
                placeholder="Nhập tên nhà trọ"
              />
            </div>
            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={generalForm.address}
                onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                value={generalForm.phoneNumber}
                onChange={(e) => setGeneralForm({ ...generalForm, phoneNumber: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={generalForm.email}
                onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                placeholder="Nhập email"
              />
            </div>
            <Button type="submit">Lưu thay đổi</Button>
          </form>
        </div>
      )}

      {/* Pricing Settings */}
      {activeTab === 'pricing' && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Giá dịch vụ</h2>
          <form onSubmit={handlePricingSubmit} className="space-y-4">
            <div>
              <Label htmlFor="electricityRate">Giá điện (VNĐ/kWh)</Label>
              <Input
                id="electricityRate"
                type="number"
                value={pricingForm.electricityRate}
                onChange={(e) => setPricingForm({ ...pricingForm, electricityRate: Number(e.target.value) })}
                placeholder="Nhập giá điện"
              />
            </div>
            <div>
              <Label htmlFor="waterRate">Giá nước (VNĐ/khối)</Label>
              <Input
                id="waterRate"
                type="number"
                value={pricingForm.waterRate}
                onChange={(e) => setPricingForm({ ...pricingForm, waterRate: Number(e.target.value) })}
                placeholder="Nhập giá nước"
              />
            </div>
            <div>
              <Label htmlFor="internetFee">Phí internet (VNĐ/tháng)</Label>
              <Input
                id="internetFee"
                type="number"
                value={pricingForm.internetFee}
                onChange={(e) => setPricingForm({ ...pricingForm, internetFee: Number(e.target.value) })}
                placeholder="Nhập phí internet"
              />
            </div>
            <div>
              <Label htmlFor="cleaningFee">Phí vệ sinh (VNĐ/tháng)</Label>
              <Input
                id="cleaningFee"
                type="number"
                value={pricingForm.cleaningFee}
                onChange={(e) => setPricingForm({ ...pricingForm, cleaningFee: Number(e.target.value) })}
                placeholder="Nhập phí vệ sinh"
              />
            </div>
            <Button type="submit">Lưu thay đổi</Button>
          </form>
        </div>
      )}
    </div>
  )
}
