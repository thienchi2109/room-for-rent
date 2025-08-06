'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building, Users, FileText, DollarSign, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { LogoutButton } from '@/components/auth/LogoutButton'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Quản lý phòng', href: '/rooms', icon: Building },
  { name: 'Khách thuê', href: '/tenants', icon: Users },
  { name: 'Hợp đồng', href: '/contracts', icon: FileText },
  { name: 'Hóa đơn', href: '/bills', icon: DollarSign },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { settings } = useSettingsStore()

  if (!user) return null

  return (
    <>
      {/* Desktop Header Navigation */}
      <nav className="hidden xl:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                  {settings.general.hotelName}
                </Link>
              </div>
              <div className="ml-6 flex space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Xin chào, <span className="font-medium">{user.username}</span>
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header - Only Logo and User Info */}
      <nav className="xl:hidden bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-lg font-bold text-gray-900 truncate">
                {settings.general.hotelName}
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-700 font-medium truncate">
                {user.username}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-6 h-16">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium truncate ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
