'use client'

import { useAuthStore } from '@/store/auth'
import { LogoutButton } from './LogoutButton'

interface UserMenuProps {
  className?: string
}

export function UserMenu({ className }: UserMenuProps) {
  const { user } = useAuthStore()

  if (!user) {
    return null
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* User Info */}
      <div className="text-right">
        <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
      </div>
      
      {/* User Avatar */}
      <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-slate-700">
          {user.fullName.charAt(0).toUpperCase()}
        </span>
      </div>
      
      {/* Logout Button */}
      <LogoutButton variant="outline" size="sm" />
    </div>
  )
}
