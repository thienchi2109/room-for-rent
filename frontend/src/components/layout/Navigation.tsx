'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building, Users, FileText, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { LogoutButton } from '@/components/auth/LogoutButton'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Quản lý phòng', href: '/rooms', icon: Building },
  { name: 'Khách thuê', href: '/tenants', icon: Users },
  { name: 'Hợp đồng', href: '/contracts', icon: FileText },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { settings } = useSettingsStore()

  if (!user) return null

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                {settings.general.hotelName}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
